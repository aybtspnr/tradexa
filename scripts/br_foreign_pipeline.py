#!/usr/bin/env python3
"""
Pipeline BR→Foreign — Encontra compradores internacionais REAIS
para empresas brasileiras que comerciam um NCM.

Uso: python3 br_foreign_pipeline.py [--ncm 61091000] [--chapter 61] [--output /tmp/results.json]
"""

import argparse
import json
import os
import sys
from datetime import datetime
from collections import defaultdict

# Database config
DB_DSN = "host=localhost dbname=tradexa_comexstat user=tradexa password=tradexa2026"

def connect_db():
    """Connect to PostgreSQL."""
    import psycopg2
    return psycopg2.connect(DB_DSN)

def get_brazilian_companies_by_ncm(conn, ncm_code):
    """
    Busca empresas brasileiras associadas a este NCM.
    Usa COMEXSTAT + br_matches para encontrar.
    """
    cur = conn.cursor()
    
    # Extrair capítulo
    chapter = ncm_code[:2]
    
    # Estratégia 1: br_matches com ncm_brazilians contendo este NCM/chapter
    cur.execute("""
        SELECT DISTINCT bm.importinfo_slug, bm.importinfo_name,
               bm.foreign_partner_slug, bm.foreign_partner_name,
               bm.foreign_partner_country, bm.flow,
               bm.match_confidence, bm.ncm_brazilians,
               bm.commodities
        FROM importinfo.br_matches bm
        WHERE bm.importinfo_slug IS NOT NULL
          AND bm.ncm_brazilians IS NOT NULL
          AND EXISTS (
              SELECT 1 FROM unnest(bm.ncm_brazilians) AS n
              WHERE n LIKE %s
          )
        ORDER BY bm.match_confidence DESC
    """, (f"{chapter}%",))
    
    matches = []
    for row in cur.fetchall():
        matches.append({
            "br_slug": row[0],
            "br_name": row[1],
            "foreign_slug": row[2],
            "foreign_name": row[3],
            "foreign_country": row[4],
            "flow": row[5],
            "confidence": row[6],
            "ncm_list": row[7],
            "commodities": row[8],
            "source": "br_matches"
        })
    
    cur.close()
    return matches

def get_brazilian_companies_by_chapter_cluster(conn, chapter):
    """
    Busca empresas brasileiras via name_clusters + br_global_links
    que têm relação com este capítulo NCM.
    """
    cur = conn.cursor()
    
    # br_global_links: BR companies with global links
    cur.execute("""
        SELECT DISTINCT bgl.br_slug, bgl.br_name, bgl.br_source,
               bgl.global_slug, bgl.global_name, bgl.global_country,
               bgl.match_score, bgl.total_records,
               nc.root_match
        FROM importinfo.br_global_links bgl
        JOIN importinfo.name_clusters nc 
          ON nc.root_match = bgl.root_match AND nc.is_generic = FALSE
        WHERE bgl.br_source IS NOT NULL
          AND bgl.global_name IS NOT NULL
        ORDER BY bgl.match_score DESC NULLS LAST, bgl.total_records DESC NULLS LAST
    """)
    
    matches = []
    seen = set()
    for row in cur.fetchall():
        key = (row[0], row[3])  # (br_slug, global_slug)
        if key not in seen:
            seen.add(key)
            matches.append({
                "br_slug": row[0],
                "br_name": row[1],
                "br_source": row[2],
                "foreign_slug": row[3],
                "foreign_name": row[4],
                "foreign_country": row[5],
                "match_score": row[6],
                "total_records": row[7],
                "root_match": row[8],
                "source": "br_global_links"
            })
    
    cur.close()
    return matches

def get_relationships_for_company(conn, company_name, ncm_chapter=None):
    """Busca relacionamentos BOL para uma empresa."""
    cur = conn.cursor()
    
    # Buscar por nome normalizado
    cur.execute("""
        SELECT DISTINCT r.from_name, r.from_country,
               r.to_name, r.to_country,
               r.shared_bols, r.value
        FROM importinfo.relationships r
        WHERE (r.from_name ILIKE %s OR r.to_name ILIKE %s)
          AND r.shared_bols > 0
        ORDER BY r.shared_bols DESC, r.value DESC NULLS LAST
        LIMIT 20
    """, (f"%{company_name[:30]}%", f"%{company_name[:30]}%"))
    
    results = []
    for row in cur.fetchall():
        results.append({
            "from_name": row[0],
            "from_country": row[1],
            "to_name": row[2],
            "to_country": row[3],
            "shared_bols": row[4],
            "value": row[5]
        })
    
    cur.close()
    return results

def get_root_chapters(conn):
    """Obtém mapeamento root_match → chapters."""
    cur = conn.cursor()
    cur.execute("SELECT root_match, chapters FROM importinfo.root_chapters")
    chapters = {}
    for row in cur.fetchall():
        chapters[row[0]] = row[1]
    cur.close()
    return chapters

def calculate_score(match, root_chapters):
    """
    Calcula score baseado em evidências.
    
    Fontes de evidência (cada uma adiciona pontos):
    - br_matches com confiança >= 90: +35
    - br_matches sem confiança: +25
    - br_global_links com match_score: +20
    - root_match em root_chapters para o capítulo: +15
    - BOL count > 5: +10
    - foreign_country preenchido: +5
    """
    score = 10  # baseline
    
    source = match.get("source", "")
    confidence = match.get("confidence") or match.get("match_score") or 0
    
    if source == "br_matches":
        if confidence >= 90:
            score += 35
        elif confidence >= 70:
            score += 28
        else:
            score += 20
        
        # Bônus por múltiplos BOLs/commodities
        commodities = match.get("commodities")
        if commodities and len(commodities) > 5:
            score += 10
        elif commodities and len(commodities) > 2:
            score += 5
    
    elif source == "br_global_links":
        score += 20
        if confidence > 0:
            score += min(confidence, 10)
        
        # Bônus por total_records
        total = match.get("total_records", 0) or 0
        if total > 100:
            score += 10
        elif total > 10:
            score += 5
        
        # Verificar root_chapters
        root = match.get("root_match", "")
        if root and root in root_chapters:
            score += 10
    
    # Bônus por país preenchido
    if match.get("foreign_country"):
        score += 5
    
    # Bônus por flow "both" (importa E exporta)
    if match.get("flow") == "both":
        score += 5
    
    return min(score, 100)

def confidence_label(score):
    if score >= 80:
        return "Confirmado"
    elif score >= 60:
        return "Alta probabilidade"
    elif score >= 40:
        return "Média probabilidade"
    elif score >= 20:
        return "Baixa probabilidade"
    return "Sem evidência"

def run_pipeline(ncm_code=None, chapter=None, output_file=None):
    """Pipeline principal."""
    
    if not ncm_code and not chapter:
        print("ERRO: Forneça --ncm ou --chapter")
        sys.exit(1)
    
    if ncm_code:
        chapter = ncm_code[:2]
    
    print(f"🔍 Pipeline BR→Foreign para {'NCM ' + ncm_code if ncm_code else 'Capítulo ' + chapter}")
    print(f"   Início: {datetime.now().isoformat()}")
    print()
    
    conn = connect_db()
    root_chapters = get_root_chapters(conn)
    
    results = {
        "query": {"ncm": ncm_code, "chapter": chapter},
        "timestamp": datetime.now().isoformat(),
        "sources": {},
        "companies": [],
        "stats": {}
    }
    
    # Fonte 1: br_matches
    print("📦 Fonte 1: br_matches...")
    br_matches = get_brazilian_companies_by_ncm(conn, ncm_code or f"{chapter}000000")
    print(f"   → {len(br_matches)} matches encontrados")
    
    for m in br_matches:
        m["score"] = calculate_score(m, root_chapters)
        m["score_label"] = confidence_label(m["score"])
        results["companies"].append(m)
    
    results["sources"]["br_matches"] = len(br_matches)
    
    # Fonte 2: br_global_links + name_clusters
    print("📦 Fonte 2: br_global_links + name_clusters...")
    cluster_matches = get_brazilian_companies_by_chapter_cluster(conn, chapter)
    print(f"   → {len(cluster_matches)} matches encontrados")
    
    # Filtrar para não duplicar com br_matches já adicionados
    existing_pairs = set()
    for m in results["companies"]:
        if m.get("foreign_slug"):
            existing_pairs.add((m["br_slug"], m["foreign_slug"]))
    
    for m in cluster_matches:
        pair = (m["br_slug"], m.get("foreign_slug", ""))
        if pair not in existing_pairs:
            m["score"] = calculate_score(m, root_chapters)
            m["score_label"] = confidence_label(m["score"])
            results["companies"].append(m)
            existing_pairs.add(pair)
    
    results["sources"]["br_global_links"] = len(cluster_matches)
    
    # Deduplicar e ordenar
    seen = set()
    unique_companies = []
    for m in results["companies"]:
        key = (m.get("br_name", ""), m.get("foreign_name", ""))
        if key not in seen:
            seen.add(key)
            unique_companies.append(m)
    
    unique_companies.sort(key=lambda x: x.get("score", 0), reverse=True)
    results["companies"] = unique_companies
    
    # Estatísticas
    scores = [c.get("score", 0) for c in unique_companies]
    results["stats"] = {
        "total": len(unique_companies),
        "with_foreign_partner": sum(1 for c in unique_companies if c.get("foreign_name")),
        "without_foreign_partner": sum(1 for c in unique_companies if not c.get("foreign_name")),
        "by_score": {
            "confirmado": sum(1 for c in unique_companies if c.get("score", 0) >= 80),
            "alta": sum(1 for c in unique_companies if 60 <= c.get("score", 0) < 80),
            "media": sum(1 for c in unique_companies if 40 <= c.get("score", 0) < 60),
            "baixa": sum(1 for c in unique_companies if 20 <= c.get("score", 0) < 40),
            "sem_evidencia": sum(1 for c in unique_companies if c.get("score", 0) < 20),
        },
        "top_foreign_countries": {}
    }
    
    # Top países
    countries = defaultdict(int)
    for c in unique_companies:
        if c.get("foreign_country"):
            countries[c["foreign_country"]] += 1
    results["stats"]["top_foreign_countries"] = dict(
        sorted(countries.items(), key=lambda x: x[1], reverse=True)[:15]
    )
    
    # Output
    print()
    print("=" * 60)
    print(f"📊 RESULTADOS: {results['stats']['total']} empresas brasileiras")
    print(f"   Com foreign partner: {results['stats']['with_foreign_partner']}")
    print(f"   Sem foreign partner: {results['stats']['without_foreign_partner']}")
    print()
    print("   Por nível de evidência:")
    for level, count in results['stats']['by_score'].items():
        print(f"     {level}: {count}")
    print()
    print("   Top países dos compradores:")
    for pais, count in list(results['stats']['top_foreign_countries'].items())[:10]:
        print(f"     {pais}: {count}")
    print()
    
    # Mostrar top 20
    print("🏆 TOP 20 MATCHES (por score):")
    print(f"   {'BR Company':40s} | {'Foreign Partner':35s} | {'País':15s} | Score | Fonte")
    print(f"   {'-'*40} | {'-'*35} | {'-'*15} | {'-'*5} | {'-'*12}")
    for c in unique_companies[:20]:
        br = (c.get("br_name", "") or "")[:38]
        fp = (c.get("foreign_name", "") or "(sem match)")[:33]
        pais = (c.get("foreign_country", "") or "?")[:13]
        score = c.get("score", 0)
        fonte = c.get("source", "?")[:10]
        print(f"   {br:40s} | {fp:35s} | {pais:15s} | {score:3d}  | {fonte}")
    
    # Salvar output
    if output_file:
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n💾 Resultados salvos em: {output_file}")
    
    conn.close()
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline BR→Foreign")
    parser.add_argument("--ncm", help="Código NCM (ex: 61091000)")
    parser.add_argument("--chapter", help="Capítulo (ex: 61)")
    parser.add_argument("--output", default="/tmp/br_foreign_results.json", help="Arquivo de saída")
    
    args = parser.parse_args()
    run_pipeline(args.ncm, args.chapter, args.output)
