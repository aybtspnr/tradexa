#!/usr/bin/env python3
"""
Pipeline BR→Foreign v2 — Estratégia refinada:

1. Pega empresas brasileiras DA API (COMEXSTAT) para um NCM
2. Busca matches corporativos em name_clusters + br_global_links
3. Filtra logistics/generic clusters
4. Busca compradores reais em BOL (se disponível)
5. Score + output

Uso: python3 br_foreign_v2.py --ncm 61091000
"""

import json
import sys
import urllib.request
from collections import defaultdict
import psycopg2

DB_DSN = "host=localhost dbname=tradexa_comexstat user=tradexa password=tradexa2026"

# Clusters genéricos/logística para EXCLUIR
GENERIC_ROOTS = {
    'LOGISTICS', 'FREIGHT', 'SHIPPING', 'CARGO', 'TRANS', 'TRADE', 
    'LOG', 'FORWARDING', 'COURIER', 'DISTRIBUTION', 'WAREHOUSE',
    'TRANSPORT', 'GLOBAL', 'GREEN', 'UNION', 'GRAND', 'PERFORMANCE',
    'SPECIAL', 'SYNERGY', 'MOVING', 'TECNOLOGIA', 'TECHNOLOGIES',
    'SOLUTIONS', 'SERVICES', 'WORLDWIDE', 'INTERNATIONAL', 'OCEAN',
    'AIR', 'SEA', 'LAND', 'ALLIANCE', 'GROUP', 'PARTNERS'
}

# Empresas de logística para excluir (name contains)
LOGISTICS_KEYWORDS = [
    'LOGISTIC', 'FREIGHT', 'SHIPPING', 'CARGO', 'FORWARDING',
    'TRANSPORT', 'COURIER', 'WAREHOUSE', 'DISTRIBUTION',
    'AGENCIAMENTO', 'NAVEGACAO', 'LOG', 'TRANS'
]

# Setores alvo por capítulo NCM
CHAPTER_SECTORS = {
    '61': ['textil', 'vestuario', 'apparel', 'cloth', 'textile', 'garment', 'fashion', 'roupa', 'camiseta'],
    '62': ['textil', 'vestuario', 'apparel', 'cloth', 'textile', 'garment', 'fashion', 'roupa'],
    '09': ['cafe', 'coffee', 'alimento', 'food', 'beverage', 'commodity', 'agricola', 'farming'],
    '84': ['maquina', 'machine', 'equipment', 'equipamento', 'industrial', 'electronico'],
    '87': ['automotivo', 'automotive', 'vehicle', 'veiculo', 'auto parts', 'autopecas'],
    '02': ['carne', 'meat', 'food', 'alimento', 'frigorifico', 'beef', 'bovino'],
    '39': ['plastico', 'plastic', 'polymer', 'polimero', 'resin', 'resina'],
    '72': ['aco', 'steel', 'metal', 'metalurgico', 'siderurgico'],
    '94': ['moveis', 'furniture', 'movel', 'madeira', 'wood'],
}

def get_br_companies_from_api(ncm):
    """Obtém empresas brasileiras do endpoint /details da API Intel."""
    url = f"http://localhost:5057/api/v1/intel/ncm/{ncm}/details?limit_empresas=200"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"ERRO API: {e}")
        return []
    
    empresas = data.get('empresas', {})
    if not empresas:
        return []
    
    seen = set()
    companies = []
    for city_key, comp_list in empresas.items():
        for c in comp_list:
            name = c.get('nome', '').strip()
            if name and name not in seen:
                seen.add(name)
                companies.append({
                    'name': name,
                    'city': c.get('municipio', c.get('nome_municipio', '')),
                    'uf': c.get('uf', ''),
                    'flow': c.get('likely_flow', ''),
                    'confidence_label': c.get('confidence_label', ''),
                    'capital': c.get('capital_social', 0),
                    'cnae': c.get('cnae_desc', ''),
                })
    
    return companies

def search_in_br_global_links(conn, company_name, chapter):
    """Busca empresa em br_global_links."""
    cur = conn.cursor()
    
    # Extrair primeira palavra (possível root_match)
    first_word = company_name.split()[0] if company_name.split() else ''
    
    results = []
    
    # Buscar por br_name similar
    cur.execute("""
        SELECT DISTINCT bgl.br_name, bgl.br_source,
               bgl.global_name, bgl.global_country, bgl.global_city,
               bgl.match_score, bgl.total_records,
               bgl.root_match
        FROM importinfo.br_global_links bgl
        WHERE bgl.br_name ILIKE %s
          AND bgl.global_name IS NOT NULL
          AND bgl.global_name != ''
        ORDER BY bgl.match_score DESC NULLS LAST, bgl.total_records DESC NULLS LAST
        LIMIT 20
    """, (f"%{first_word}%",))
    
    for row in cur.fetchall():
        root = row[7] or ''
        if root.upper() in GENERIC_ROOTS:
            continue
        if any(kw.lower() in (row[2] or '').lower() for kw in LOGISTICS_KEYWORDS):
            continue
        results.append({
            'br_name': row[0],
            'global_name': row[2],
            'global_country': row[3],
            'global_city': row[4],
            'match_score': row[6],
            'root_match': root,
            'source': 'br_global_links'
        })
    
    cur.close()
    return results

def search_in_name_clusters(conn, company_name, chapter):
    """Busca empresa em name_clusters."""
    cur = conn.cursor()
    
    first_word = company_name.split()[0] if company_name.split() else ''
    if first_word.upper() in GENERIC_ROOTS:
        cur.close()
        return []
    
    cur.execute("""
        SELECT DISTINCT nc.root_match, unnest(nc.slugs) as slug,
               unnest(nc.names) as name, unnest(nc.countries) as country,
               nc.is_generic
        FROM importinfo.name_clusters nc
        WHERE nc.root_match = %s
          AND nc.is_generic = FALSE
          AND EXISTS (
              SELECT 1 FROM unnest(nc.countries) c
              WHERE c NOT IN ('Brazil', '', 'Unknown', 'None')
                AND c IS NOT NULL
          )
        ORDER BY name
        LIMIT 50
    """, (first_word.upper(),))
    
    results = []
    for row in cur.fetchall():
        country = row[3] or ''
        if country in ('Brazil', '', 'Unknown', 'None'):
            continue
        name = row[2] or ''
        if any(kw.lower() in name.lower() for kw in LOGISTICS_KEYWORDS):
            continue
        results.append({
            'root_match': row[0],
            'br_slug': row[1],
            'foreign_name': name,
            'foreign_country': country,
            'source': 'name_clusters'
        })
    
    cur.close()
    return results

def search_in_relationships(conn, company_name):
    """Busca relacionamentos BOL."""
    cur = conn.cursor()
    
    first_word = company_name.split()[0] if company_name.split() else ''
    
    cur.execute("""
        SELECT DISTINCT r.from_name, r.from_country,
               r.to_name, r.to_country,
               r.shared_bols, r.value
        FROM importinfo.relationships r
        WHERE (r.from_name ILIKE %s OR r.to_name ILIKE %s)
          AND r.shared_bols > 0
          AND r.to_country NOT IN ('Brazil', '', 'Unknown', 'None')
          AND r.to_country IS NOT NULL
        ORDER BY r.shared_bols DESC
        LIMIT 20
    """, (f"%{first_word}%", f"%{first_word}%"))
    
    results = []
    for row in cur.fetchall():
        if any(kw.lower() in (row[2] or '').lower() for kw in LOGISTICS_KEYWORDS):
            continue
        results.append({
            'from': f"{row[0]} ({row[1]})",
            'to': f"{row[2]} ({row[3]})",
            'shared_bols': row[4],
            'value': row[5],
            'source': 'relationships'
        })
    
    cur.close()
    return results

def calculate_score_breakdown(company_name, matches):
    """Calcula score detalhado para cada match."""
    scored = []
    
    for m in matches:
        score = 10  # baseline
        evidence = []
        
        source = m.get('source', '')
        
        if source == 'br_global_links':
            score += 25
            evidence.append("Grupo corporativo confirmado via br_global_links")
            
            if m.get('match_score', 0) > 0:
                score += min(m['match_score'], 10)
            
            if m.get('total_records', 0) or 0 > 50:
                score += 10
                evidence.append("Empresa estrangeira com múltiplos registros BOL")
            
            if m.get('global_country'):
                score += 5
        
        elif source == 'name_clusters':
            score += 20
            evidence.append(f"Cluster corporativo: {m.get('root_match', '')}")
            
            if m.get('foreign_country'):
                score += 5
        
        elif source == 'relationships':
            score += 30
            bols = m.get('shared_bols', 0)
            evidence.append(f"{bols} BOLs compartilhados com empresa brasileira")
            
            if bols > 10:
                score += 10
            
            if m.get('value', 0) or 0 > 100000:
                score += 5
        
        score = min(score, 100)
        
        # Label
        if score >= 80:
            label = "Confirmado"
        elif score >= 60:
            label = "Alta probabilidade"
        elif score >= 40:
            label = "Média probabilidade"
        else:
            label = "Baixa probabilidade"
        
        m['score'] = score
        m['score_label'] = label
        m['evidence'] = evidence
        scored.append(m)
    
    return sorted(scored, key=lambda x: x.get('score', 0), reverse=True)

def run(ncm_code):
    chapter = ncm_code[:2]
    
    print(f"\n{'='*70}")
    print(f"🔍 PIPELINE BR→FOREIGN v2 — NCM {ncm_code} (cap.{chapter})")
    print(f"{'='*70}")
    
    # Passo 1: Empresas brasileiras da API
    print(f"\n📦 Passo 1: Buscando empresas brasileiras na API...")
    br_companies = get_br_companies_from_api(ncm_code)
    print(f"   → {len(br_companies)} empresas únicas encontradas")
    
    if not br_companies:
        print("   ⚠️ Nenhuma empresa encontrada. Verifique se o NCM existe na API.")
        return
    
    # Mostrar top 10
    print(f"\n   Top 10 por capital social:")
    for c in sorted(br_companies, key=lambda x: x.get('capital', 0), reverse=True)[:10]:
        print(f"     {c['name'][:40]:42s} | capital={c['capital']:>12,.0f} | {c['flow']}")
    
    # Passo 2: Para cada empresa BR, buscar matches
    print(f"\n📦 Passo 2: Buscando matches corporativos para cada empresa...")
    
    conn = psycopg2.connect(DB_DSN)
    
    all_matches = []
    companies_with_matches = 0
    
    for br_comp in br_companies[:50]:  # limit to 50 for speed
        name = br_comp['name']
        
        # Buscar em br_global_links
        global_links = search_in_br_global_links(conn, name, chapter)
        
        # Buscar em name_clusters
        clusters = search_in_name_clusters(conn, name, chapter)
        
        # Buscar em relationships
        rels = search_in_relationships(conn, name)
        
        matches = global_links + clusters + rels
        
        if matches:
            companies_with_matches += 1
            scored = calculate_score_breakdown(name, matches)
            for m in scored:
                m['br_company'] = name
                m['br_flow'] = br_comp.get('flow', '')
                m['br_capital'] = br_comp.get('capital', 0)
                all_matches.append(m)
    
    conn.close()
    
    # Passo 3: Analisar resultados
    print(f"   → {len(br_companies)} empresas BR analisadas")
    print(f"   → {companies_with_matches} empresas com pelo menos 1 match corporativo")
    print(f"   → {len(all_matches)} matches totais encontrados")
    
    # Ordenar por score
    all_matches.sort(key=lambda x: x.get('score', 0), reverse=True)
    
    # Mostrar top 20
    print(f"\n{'='*70}")
    print(f"🏆 TOP 20 MATCHES (por evidência)")
    print(f"{'='*70}")
    print(f"   {'Empresa BR':40s} | {'Foreign Partner':30s} | {'País':15s} | Score | Fonte")
    print(f"   {'-'*40} | {'-'*30} | {'-'*15} | {'-'*5} | {'-'*10}")
    
    for m in all_matches[:20]:
        br = m.get('br_company', '')[:38]
        fp = ''
        pais = ''
        
        if m.get('source') == 'br_global_links':
            fp = m.get('global_name', '')[:28]
            pais = m.get('global_country', '')[:13]
        elif m.get('source') == 'name_clusters':
            fp = m.get('foreign_name', '')[:28]
            pais = m.get('foreign_country', '')[:13]
        elif m.get('source') == 'relationships':
            fp = m.get('to', '')[:28]
            pais = ''
        
        score = m.get('score', 0)
        fonte = m.get('source', '?')[:8]
        
        print(f"   {br:40s} | {fp:30s} | {pais:15s} | {score:3d}  | {fonte}")
        
        # Mostrar evidência
        ev = m.get('evidence', [])
        for e in ev[:2]:
            print(f"   {'':40s}   {'':30s}   {'':15s}   {'':3s}    ├─ {e}")
    
    # Estatísticas por país
    print(f"\n{'='*70}")
    print(f"📊 PAÍSES DOS COMPRADORES")
    print(f"{'='*70}")
    countries = defaultdict(int)
    for m in all_matches:
        c = m.get('global_country', '') or m.get('foreign_country', '') or ''
        if c:
            countries[c] += 1
    
    for pais, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"   {pais:20s}: {count}")
    
    # Estatísticas por score
    print(f"\n📊 DISTRIBUIÇÃO DE SCORE")
    levels = {'Confirmado (80-100)': 0, 'Alta (60-79)': 0, 
              'Média (40-59)': 0, 'Baixa (20-39)': 0, '<20': 0}
    for m in all_matches:
        s = m.get('score', 0)
        if s >= 80: levels['Confirmado (80-100)'] += 1
        elif s >= 60: levels['Alta (60-79)'] += 1
        elif s >= 40: levels['Média (40-59)'] += 1
        elif s >= 20: levels['Baixa (20-39)'] += 1
        else: levels['<20'] += 1
    
    for level, count in levels.items():
        bar = '█' * min(count, 40)
        print(f"   {level:20s}: {count:4d} {bar}")
    
    # Salvar resultados completos
    output = {
        'ncm': ncm_code,
        'chapter': chapter,
        'total_br_companies': len(br_companies),
        'companies_with_matches': companies_with_matches,
        'total_matches': len(all_matches),
        'top_companies': br_companies[:10],
        'matches': all_matches[:50],
        'countries': dict(sorted(countries.items(), key=lambda x: x[1], reverse=True)[:20])
    }
    
    with open(f'/tmp/br_foreign_v2_{ncm_code}.json', 'w') as f:
        json.dump(output, f, indent=2, default=str, ensure_ascii=False)
    
    print(f"\n💾 Resultados salvos em: /tmp/br_foreign_v2_{ncm_code}.json")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run(sys.argv[1])
    else:
        print("Uso: python3 br_foreign_v2.py NCM")
        print("Ex: python3 br_foreign_v2.py 61091000")
        print("    python3 br_foreign_v2.py 09011110")
