#!/usr/bin/env python3
"""
BR→Foreign Pipeline v4 — Versão final com filtros corrigidos
Para integração na API TradeXA Intel.

Mudanças v4:
- Filtro GRUPO adicionado aos clusters genéricos
- BR→BR relationships filtrados (país != Brazil)
- Extração de país do campo partner_name quando country vazio
- Score reflete shared_bols corretamente
- Gera evidence_cache no banco

Uso: python3 br_foreign_v4.py [NCM] [--save-db]
"""

import json
import sys
import urllib.request
import urllib.error
from collections import defaultdict
import re
from datetime import datetime
import psycopg2
import psycopg2.extras

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════
DB_DSN = "host=localhost dbname=tradexa_comexstat user=tradexa password=tradexa2026"
API_BASE = "http://localhost:5057/api/v1/intel/ncm"

GENERIC_ROOTS = {
    'LOGISTICS', 'FREIGHT', 'SHIPPING', 'CARGO', 'TRANS', 'TRADE',
    'LOG', 'FORWARDING', 'COURIER', 'DISTRIBUTION', 'WAREHOUSE',
    'TRANSPORT', 'GREEN', 'UNION', 'GRAND', 'PERFORMANCE',
    'SPECIAL', 'SYNERGY', 'MOVING', 'TECNOLOGIA', 'TECHNOLOGIES',
    'SOLUTIONS', 'SERVICES', 'WORLDWIDE', 'INTERNATIONAL', 'OCEAN',
    'AIR', 'SEA', 'LAND', 'ALLIANCE', 'GROUP', 'PARTNERS', 'GLOBAL',
    'GRUPO',  # ← NOVO: GRUPO é genérico em espanhol/português
    'WORLD', 'TOTAL', 'SUPER', 'NOVA', 'GOLD', 'PLATINUM',
    'PREMIUM', 'FIRST', 'BEST', 'TOP', 'AMERICAN', 'NATIONAL',
    'ROYAL', 'PRIME', 'SOURCE', 'LINK', 'NETWORK', 'SYSTEM',
}

LOGISTICS_KEYWORDS = [
    'LOGISTIC', 'FREIGHT', 'SHIPPING', 'CARGO', 'FORWARDING',
    'TRANSPORT', 'COURIER', 'WAREHOUSE', 'DISTRIBUTION',
    'AGENCIAMENTO', 'NAVEGACAO', 'LOG', 'TRANS', 'DESPACHO',
    'ADUANAL', 'ADUANEIRO', 'CUSTOMS', 'BROKER',
]


# ═══════════════════════════════════════════
# FUNÇÕES DE CONEXÃO
# ═══════════════════════════════════════════

def get_conn():
    return psycopg2.connect(DB_DSN)


# ═══════════════════════════════════════════
# FUNÇÕES DE UTILIDADE
# ═══════════════════════════════════════════

def extract_country(text):
    """Extrai país de texto como 'CARGILL JAPAN LLC (Japan)'"""
    if not text:
        return None
    m = re.search(r'\(([^)]+)\)$', text)
    if m:
        country = m.group(1).strip()
        if country not in ('USA', '', 'Unknown', 'None', 'Brazil'):
            return country
    return None

COUNTRY_MAP = {
    'USA': 'United States', 'Milwaukee': 'United States',
    'Indiana': 'United States', 'Indianapolis': 'United States',
    'Mexico City': 'Mexico', 'Jakarta': 'Indonesia',
    'Shanghai': 'China', 'Beijing': 'China', 'Seoul': 'South Korea',
    'Tokyo': 'Japan', 'Yokohama': 'Japan', 'Bangkok': 'Thailand',
    'Singapore': 'Singapore', 'London': 'United Kingdom',
    'Opelousas': 'United States', 'Fukushima Ku': 'Japan',
    'New Mexico': 'United States', 'Jakarta Pusat': 'Indonesia',
}

def normalize_country(c):
    if not c:
        return None
    c = c.strip()
    if c in COUNTRY_MAP:
        return COUNTRY_MAP[c]
    if c in ('', 'Unknown', 'None', 'Brazil'):
        return None
    return c


# ═══════════════════════════════════════════
# PASSO 1: EMPRESAS BR DA API
# ═══════════════════════════════════════════

def get_br_companies(ncm, limit=200):
    """Busca empresas brasileiras no endpoint /details da API Intel."""
    url = f"{API_BASE}/{ncm}/details?limit_empresas={limit}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"  ERRO API: {e}")
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
                    'city': c.get('municipio', ''),
                    'uf': c.get('uf', ''),
                    'flow': c.get('likely_flow', ''),
                    'capital': c.get('capital_social', 0) or 0,
                    'cnae': c.get('cnae_desc', ''),
                })
    return companies


# ═══════════════════════════════════════════
# PASSO 2: BUSCAR MATCHES
# ═══════════════════════════════════════════

def get_first_word(name, skip_generic=True):
    """Extrai primeira palavra significativa do nome."""
    skip = {'LTDA', 'SA', 'S/A', 'ME', 'EPP', 'EIRELI', 'DO', 'DA',
            'DE', 'COM', 'E', 'LTDA.', 'S.A.', 'IND', 'COMERCIO',
            'INDUSTRIA', 'IMPORTACAO', 'EXPORTACAO', 'LTDA', 'SA'}
    words = name.split()
    for w in words:
        w_clean = w.upper().strip('.,')
        if w_clean not in skip and len(w_clean) > 2:
            return w_clean
    return words[0].upper() if words else ''


def search_relationships(conn, company_name):
    """
    relationships — FONTE PRINCIPAL.
    Rastreia BOLs compartilhados entre empresa BR e parceiros estrangeiros.
    """
    cur = conn.cursor()
    first_word = get_first_word(company_name)
    
    if first_word in GENERIC_ROOTS:
        cur.close()
        return []
    
    results = []
    
    # Busca otimizada: procura por slug da empresa BR na relationships
    cur.execute("""
        SELECT DISTINCT r.from_name, r.from_country,
               r.to_name, r.to_country,
               r.shared_bols, r.value,
               r.from_slug, r.to_slug
        FROM importinfo.relationships r
        WHERE (r.from_slug IN (
            SELECT slug FROM importinfo.companies 
            WHERE name ILIKE %s AND country = 'Brazil'
        ) OR r.to_slug IN (
            SELECT slug FROM importinfo.companies 
            WHERE name ILIKE %s AND country = 'Brazil'
        ))
          AND r.shared_bols > 0
        ORDER BY r.shared_bols DESC
        LIMIT 30
    """, (f"%{first_word}%", f"%{first_word}%"))
    
    for row in cur.fetchall():
        from_name = row[0] or ''
        from_country = (row[1] or '').strip()
        to_name = row[2] or ''
        to_country = (row[3] or '').strip()
        bols = row[4] or 0
        
        # Extrair país do nome se o campo country estiver vazio
        if not from_country or from_country in ('', 'Unknown', 'None'):
            from_country = extract_country(from_name) or ''
        if not to_country or to_country in ('', 'Unknown', 'None'):
            to_country = extract_country(to_name) or ''
        
        # Pular se AMBOS forem Brasil (relação BR↔BR)
        from_is_br = 'Brazil' in from_country or '(Brazil)' in from_name
        to_is_br = 'Brazil' in to_country or '(Brazil)' in to_name
        if from_is_br and to_is_br:
            continue
        
        # Determinar quem é o parceiro estrangeiro
        br_in_from = first_word.upper() in from_name.upper()[:50]
        br_in_to = first_word.upper() in to_name.upper()[:50]
        
        if br_in_from and not br_in_to:
            partner_name = to_name
            partner_country = normalize_country(to_country)
            direction = 'export'
        elif br_in_to and not br_in_from:
            partner_name = from_name
            partner_country = normalize_country(from_country)
            direction = 'import'
        else:
            continue  # Ambiguous
        
        if not partner_country:
            partner_country = normalize_country(extract_country(partner_name))
        if not partner_country:
            continue  # skip if no country
        
        if any(kw.lower() in (partner_name or '').lower() for kw in LOGISTICS_KEYWORDS):
            continue
        
        results.append({
            'partner_name': partner_name,
            'partner_country': partner_country,
            'shared_bols': bols,
            'value': row[5],
            'direction': direction,
            'source': 'relationships',
        })
    
    cur.close()
    return results


def search_br_global_links(conn, company_name):
    """br_global_links — grupos corporativos."""
    cur = conn.cursor()
    first_word = get_first_word(company_name)
    
    if first_word in GENERIC_ROOTS:
        cur.close()
        return []
    
    results = []
    
    cur.execute("""
        SELECT DISTINCT bgl.global_name, bgl.global_country, bgl.global_city,
               bgl.match_score, bgl.total_records, bgl.root_match
        FROM importinfo.br_global_links bgl
        WHERE bgl.br_name ILIKE %s
          AND bgl.global_name IS NOT NULL AND bgl.global_name != ''
          AND bgl.global_country NOT IN ('Brazil', '', 'Unknown', 'None')
          AND bgl.global_country IS NOT NULL
          AND bgl.root_match NOT IN %s
        ORDER BY bgl.match_score DESC NULLS LAST
        LIMIT 10
    """, (f"%{first_word}%", tuple(GENERIC_ROOTS)))
    
    for row in cur.fetchall():
        global_name = row[0] or ''
        country = normalize_country(row[1])
        
        if not country:
            continue
        if any(kw.lower() in global_name.lower() for kw in LOGISTICS_KEYWORDS):
            continue
        
        results.append({
            'partner_name': global_name,
            'partner_country': country,
            'partner_city': row[2],
            'match_score': row[3],
            'total_records': row[4],
            'root_match': row[5],
            'source': 'br_global_links',
        })
    
    cur.close()
    return results


# ═══════════════════════════════════════════
# SCORING
# ═══════════════════════════════════════════

def score_match(company_name, match):
    """
    Score baseado em evidências.
    
    relationships:
      1000+ BOLs: +55
      100+ BOLs:  +45
      10+ BOLs:   +35
      >0 BOLs:    +25
      + direção export: +5
      + nome compartilha raiz: +10
    
    br_global_links:
      match_score > 0: +30
      base: +20
      + root não genérico: +5
      + total_records > 50: +5
    """
    source = match.get('source', '')
    score = 10
    bols = match.get('shared_bols', 0) or 0
    
    if source == 'relationships':
        if bols >= 1000:
            score += 55
        elif bols >= 100:
            score += 45
        elif bols >= 10:
            score += 35
        elif bols > 0:
            score += 25
        
        if match.get('direction') == 'export':
            score += 5
        
        # Same-name bonus
        pname = match.get('partner_name', '') or ''
        if pname and company_name:
            br_first = get_first_word(company_name)
            p_first = get_first_word(pname)
            if br_first and br_first == p_first:
                score += 10
    
    elif source == 'br_global_links':
        ms = match.get('match_score', 0) or 0
        score += 30 if ms > 0 else 20
        
        root = match.get('root_match', '') or ''
        if root and root not in GENERIC_ROOTS:
            score += 5
        if (match.get('total_records') or 0) > 50:
            score += 5
    
    return min(score, 100)


def confidence_label(score):
    if score >= 80: return "Confirmado"
    if score >= 60: return "Alta probabilidade"
    if score >= 40: return "Média probabilidade"
    if score >= 20: return "Baixa probabilidade"
    return "Sem evidência"


def evidence_text(match):
    parts = []
    source = match.get('source', '')
    if source == 'relationships':
        bols = match.get('shared_bols', 0)
        direction = match.get('direction', '')
        partner = match.get('partner_name', '')[:30]
        country = match.get('partner_country', '')
        if direction == 'export':
            parts.append(f"Exporta para {partner} ({country}) — {bols} BOLs")
        else:
            parts.append(f"Importa de {partner} ({country}) — {bols} BOLs")
        if bols >= 100:
            parts.append("Relação comercial consistente")
    elif source == 'br_global_links':
        parts.append(f"Grupo corporativo: {match.get('root_match', '')}")
        if match.get('total_records', 0):
            parts.append(f"{match['total_records']} registros BOL")
    return ' | '.join(parts)


# ═══════════════════════════════════════════
# EVIDENCE CACHE — SALVAR NO BANCO
# ═══════════════════════════════════════════

def create_evidence_cache_table(conn):
    """Cria tabela de cache se não existir — já deve existir (criada via DDL)."""
    pass


def save_to_cache(conn, ncm, matches):
    """Salva matches no evidence_cache."""
    cur = conn.cursor()
    now = datetime.now()
    
    for m in matches:
        try:
            cur.execute("""
                INSERT INTO comexstat.evidence_cache 
                    (ncm, br_company, partner_name, partner_country, 
                     score, score_label, source, shared_bols, direction, 
                     evidence, verified_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (ncm, br_company, partner_name) 
                DO UPDATE SET
                    score = EXCLUDED.score,
                    score_label = EXCLUDED.score_label,
                    source = EXCLUDED.source,
                    shared_bols = EXCLUDED.shared_bols,
                    direction = EXCLUDED.direction,
                    evidence = EXCLUDED.evidence,
                    verified_at = EXCLUDED.verified_at
            """, (
                ncm, m['br_company'], m.get('partner_name', ''),
                m.get('partner_country', ''), m.get('score', 0),
                m.get('score_label', ''), m.get('source', ''),
                m.get('shared_bols', 0), m.get('direction', ''),
                m.get('evidence', ''), now
            ))
        except Exception as e:
            print(f"  ERRO ao salvar cache: {e}")
    
    conn.commit()
    cur.close()


# ═══════════════════════════════════════════
# PIPELINE PRINCIPAL
# ═══════════════════════════════════════════

def run_pipeline(ncm, save_db=False):
    chapter = ncm[:2]
    
    print(f"\n{'='*70}")
    print(f"🔍 BR→FOREIGN v4 — NCM {ncm} (cap.{chapter})")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}")
    
    conn = get_conn()
    
    # Criar tabela se for salvar
    if save_db:
        create_evidence_cache_table(conn)
    
    # ── Passo 1: Empresas BR ──
    print(f"\n📦[1/3] Empresas brasileiras...")
    br_companies = get_br_companies(ncm)
    print(f"   → {len(br_companies)} empresas únicas")
    
    if not br_companies:
        print("   ⚠️ Nenhuma empresa encontrada.")
        conn.close()
        return
    
    # Top 10
    by_capital = sorted(br_companies, key=lambda x: x.get('capital', 0), reverse=True)
    print(f"\n   Top 10:")
    for c in by_capital[:10]:
        print(f"     {c['name'][:45]:47s} | cap={c['capital']:>12,.0f} | flow={c['flow']}")
    
    # ── Passo 2: Matches ──
    print(f"\n📦[2/3] Buscando relacionamentos...")
    
    all_matches = []
    br_with_matches = 0
    
    for i, br_comp in enumerate(br_companies):
        name = br_comp['name']
        
        matches = []
        
        # 1. relationships (fonte mais forte)
        rels = search_relationships(conn, name)
        matches.extend(rels)
        
        # 2. br_global_links
        links = search_br_global_links(conn, name)
        matches.extend(links)
        
        if matches:
            br_with_matches += 1
            for m in matches:
                m['br_company'] = name
                m['br_flow'] = br_comp.get('flow', '')
                m['br_capital'] = br_comp.get('capital', 0)
                m['score'] = score_match(name, m)
                m['score_label'] = confidence_label(m['score'])
                m['evidence'] = evidence_text(m)
                all_matches.append(m)
        
        if (i+1) % 20 == 0:
            print(f"   ... {i+1}/{len(br_companies)} processadas")
    
    # Dedup
    seen = set()
    unique = []
    for m in sorted(all_matches, key=lambda x: x.get('score', 0), reverse=True):
        key = (m['br_company'], m.get('partner_name', ''))
        if key not in seen:
            seen.add(key)
            unique.append(m)
    
    print(f"   → {len(br_companies)} empresas BR")
    print(f"   → {br_with_matches} com matches ({br_with_matches*100//len(br_companies)}%)")
    print(f"   → {len(unique)} matches únicos (de {len(all_matches)} brutos)")
    
    # ── Salvar no cache ──
    if save_db and unique:
        save_to_cache(conn, ncm, unique)
        print(f"   ✅ Salvo no evidence_cache")
    
    conn.close()
    
    # ── Estatísticas ──
    levels = {'Confirmado (80-100)': 0, 'Alta (60-79)': 0,
              'Média (40-59)': 0, 'Baixa (20-39)': 0, '<20': 0}
    countries = defaultdict(int)
    sources = defaultdict(int)
    
    for m in unique:
        s = m.get('score', 0)
        if s >= 80: levels['Confirmado (80-100)'] += 1
        elif s >= 60: levels['Alta (60-79)'] += 1
        elif s >= 40: levels['Média (40-59)'] += 1
        elif s >= 20: levels['Baixa (20-39)'] += 1
        else: levels['<20'] += 1
        
        c = m.get('partner_country', '')
        if c: countries[c] += 1
        
        sources[m.get('source', '?')] += 1
    
    # ── Mostrar TOP 20 ──
    print(f"\n{'='*70}")
    print(f"🏆 TOP 20 MATCHES (score > 40)")
    print(f"{'='*70}")
    
    top20 = [m for m in unique if m.get('score', 0) >= 40][:20]
    for m in top20:
        br = (m.get('br_company', '') or '')[:38]
        fp = (m.get('partner_name', '') or '')[:30]
        pais = (m.get('partner_country', '') or '')[:13]
        score = m.get('score', 0)
        label = m.get('score_label', '')[:6]
        bols = m.get('shared_bols', 0) or 0
        
        print(f"   {br:40s} | {fp:32s} | {pais:13s} | {score:3d} {label:6s}")
        if bols:
            print(f"   {'':40s}   ├─ {bols} BOLs")
        ev = m.get('evidence', '')
        if ev:
            print(f"   {'':40s}   ├─ {ev[:60]}")
    
    if [m for m in unique if m.get('score', 0) < 40]:
        print(f"\n   ... mais {len([m for m in unique if m.get('score', 0) < 40])} matches de baixa confiança (não exibidos)")
    
    # Distribuição
    print(f"\n📊 Score:")
    for level, count in levels.items():
        bar = '█' * min(count // 2, 50)
        print(f"   {level:25s}: {count:4d} {bar}")
    
    print(f"\n📊 Fontes:")
    for s, c in sorted(sources.items(), key=lambda x: x[1], reverse=True):
        print(f"   {s:20s}: {c}")
    
    print(f"\n📊 Países:")
    for p, c in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:20]:
        print(f"   {p:20s}: {c}")
    
    # ── Resultado para API ──
    result = {
        'ncm': ncm,
        'chapter': chapter,
        'timestamp': datetime.now().isoformat(),
        'stats': {
            'total_br_companies': len(br_companies),
            'companies_with_matches': br_with_matches,
            'total_matches': len(unique),
            'by_score': dict(levels),
            'by_source': dict(sources),
            'top_countries': dict(sorted(countries.items(), key=lambda x: x[1], reverse=True)[:25]),
        },
        'matches_by_company': {},
    }
    
    for m in unique:
        br = m.get('br_company', '')
        if br not in result['matches_by_company']:
            result['matches_by_company'][br] = []
        result['matches_by_company'][br].append({
            'partner_name': m.get('partner_name', ''),
            'partner_country': m.get('partner_country', ''),
            'score': m.get('score', 0),
            'score_label': m.get('score_label', ''),
            'source': m.get('source', ''),
            'shared_bols': m.get('shared_bols', 0),
            'direction': m.get('direction', ''),
            'evidence': m.get('evidence', ''),
        })
    
    output_file = f'/tmp/br_v4_{ncm}.json'
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2, default=str, ensure_ascii=False)
    print(f"\n💾 Salvo em: {output_file}")
    
    return result


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='BR→Foreign Pipeline v4')
    parser.add_argument('ncm', help='Código NCM (ex: 61091000)')
    parser.add_argument('--save-db', action='store_true', help='Salvar no evidence_cache')
    args = parser.parse_args()
    
    run_pipeline(args.ncm, save_db=args.save_db)
