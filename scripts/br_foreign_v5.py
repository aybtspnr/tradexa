#!/usr/bin/env python3
"""
BR→Foreign Pipeline v5 — Versão Final com BOL Reciprocity + Direcionalidade Corrigida

NOVO: BOL shipper reciprocity — encontra no BOL quem a empresa BR realmente vendeu
NOVO: Web evidence — cache de notícias e B2B platforms
MELHORIA: Direcionalidade import/export mais precisa
MELHORIA: Filtros mais rigorosos

Uso: python3 br_foreign_v5.py [NCM] [--save-db] [--web]
"""

import json, sys, urllib.request, urllib.error, re
from collections import defaultdict, Counter
from datetime import datetime
import psycopg2, psycopg2.extras

DB_DSN = "host=localhost dbname=tradexa_comexstat user=tradexa password=tradexa2026"
API_BASE = "http://localhost:5057/api/v1/intel/ncm"

GENERIC_ROOTS = {
    'LOGISTICS', 'FREIGHT', 'SHIPPING', 'CARGO', 'TRANS', 'TRADE',
    'LOG', 'FORWARDING', 'COURIER', 'DISTRIBUTION', 'WAREHOUSE',
    'TRANSPORT', 'GREEN', 'UNION', 'GRAND', 'PERFORMANCE',
    'SPECIAL', 'SYNERGY', 'MOVING', 'TECNOLOGIA', 'TECHNOLOGIES',
    'SOLUTIONS', 'SERVICES', 'WORLDWIDE', 'INTERNATIONAL', 'OCEAN',
    'AIR', 'SEA', 'LAND', 'ALLIANCE', 'GROUP', 'PARTNERS', 'GLOBAL',
    'GRUPO', 'WORLD', 'TOTAL', 'SUPER', 'NOVA', 'GOLD', 'PLATINUM',
    'PREMIUM', 'FIRST', 'BEST', 'TOP', 'AMERICAN', 'NATIONAL',
    'ROYAL', 'PRIME', 'SOURCE', 'LINK', 'NETWORK', 'SYSTEM',
}

LOGISTICS_KEYWORDS = [
    'LOGISTIC', 'FREIGHT', 'SHIPPING', 'CARGO', 'FORWARDING',
    'TRANSPORT', 'COURIER', 'WAREHOUSE', 'DISTRIBUTION',
    'AGENCIAMENTO', 'NAVEGACAO', 'LOG', 'TRANS', 'DESPACHO',
    'ADUANAL', 'ADUANEIRO', 'CUSTOMS', 'BROKER',
]

COUNTRY_MAP = {
    'USA': 'United States', 'Milwaukee': 'United States',
    'Indiana': 'United States', 'Indianapolis': 'United States',
    'Mexico City': 'Mexico', 'Jakarta': 'Indonesia',
    'Shanghai': 'China', 'Beijing': 'China', 'Seoul': 'South Korea',
    'Tokyo': 'Japan', 'Yokohama': 'Japan', 'Bangkok': 'Thailand',
    'Singapore': 'Singapore', 'London': 'United Kingdom',
    'Opelousas': 'United States', 'Fukushima Ku': 'Japan',
    'New Mexico': 'United States', 'Jakarta Pusat': 'Indonesia',
    'Pennsauken': 'United States', 'Port of Spain': 'Trinidad',
    'East Setauket': 'United States', 'Ciudad de Mexico': 'Mexico',
}

def extract_country(text):
    if not text: return None
    m = re.search(r'\(([^)]+)\)$', text)
    if m:
        c = m.group(1).strip()
        if c not in ('USA', '', 'Unknown', 'None', 'Brazil'): return c
    return None

def normalize_country(c):
    if not c: return None
    c = c.strip()
    if c in COUNTRY_MAP: return COUNTRY_MAP[c]
    if c in ('', 'Unknown', 'None', 'Brazil'): return None
    return c

def get_conn(): return psycopg2.connect(DB_DSN)

# ─── PASSO 1: EMPRESAS BR ───

def get_br_companies(ncm, limit=200):
    url = f"{API_BASE}/{ncm}/details?limit_empresas={limit}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"  ERRO API: {e}")
        return []
    empresas = data.get('empresas', {})
    if not empresas: return []
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

def get_first_word(name):
    skip = {'LTDA', 'SA', 'S/A', 'ME', 'EPP', 'EIRELI', 'DO', 'DA',
            'DE', 'COM', 'E', 'LTDA.', 'S.A.', 'IND', 'COMERCIO',
            'INDUSTRIA', 'IMPORTACAO', 'EXPORTACAO'}
    words = name.split()
    for w in words:
        wc = w.upper().strip('.,()/"')
        if wc not in skip and len(wc) > 2:
            return wc
    return words[0].upper() if words else ''

# ─── FONTE A: BOL SHIPPER RECIPROCITY (NOVA - MAIS FORTE) ───

def search_bol_reciprocity(conn, company_name, chapter):
    """
    Encontra no BOL: quem a empresa BR realmente vendeu.
    Busca shipper_name ≈ empresa BR → retorna consignee_name (comprador).
    """
    cur = conn.cursor()
    words = company_name.upper().split()
    skip = {'LTDA', 'SA', 'S/A', 'ME', 'EPP', 'EIRELI', 'DO', 'DA',
            'DE', 'COM', 'E', 'LTDA.', 'S.A.', 'IND', 'COMERCIO',
            'INDUSTRIA', 'IMPORTACAO', 'EXPORTACAO'}
    sig = [w.strip(".,()/\"") for w in words if w.strip(".,()/\"") not in skip and len(w.strip(".,()/\"")) > 2]
    if not sig: return []
    
    results = []
    for nw in [2, 1]:
        pat = '%' + '%'.join(sig[:nw]) + '%'
        cur.execute("""
            SELECT consignee_name,
                   COUNT(*) as bol_count,
                   ARRAY_AGG(DISTINCT sh4) FILTER (WHERE sh4 IS NOT NULL) as sh4s,
                   ARRAY_AGG(DISTINCT commodity) FILTER (WHERE commodity IS NOT NULL) as commodities,
                   MIN(run_date) as first_bol, MAX(run_date) as last_bol
            FROM importinfo.bols
            WHERE shipper_name ILIKE %s
              AND (sh2 = %s OR sh4 LIKE %s)
              AND consignee_name IS NOT NULL AND consignee_name != ''
              AND consignee_name NOT ILIKE '%%UNKNOWN%%'
            GROUP BY consignee_name
            ORDER BY bol_count DESC
            LIMIT 15
        """, (pat, chapter, chapter + '%'))
        
        rows = cur.fetchall()
        if rows:
            for r in rows:
                cn = r[0] or ''
                if any(k.lower() in cn.lower() for k in LOGISTICS_KEYWORDS):
                    continue
                country = extract_country(cn) or ''
                country = normalize_country(country) or 'United States'
                results.append({
                    'partner_name': cn,
                    'partner_country': country,
                    'shared_bols': r[1] or 0,
                    'sh4_codes': list(set(r[2] or []))[:5],
                    'direction': 'export',
                    'source': 'bol_reciprocity',
                })
            if nw == 1: break
    
    cur.close()
    return results

# ─── FONTE B: relationships ───

def search_relationships(conn, company_name):
    cur = conn.cursor()
    fw = get_first_word(company_name)
    if fw in GENERIC_ROOTS: return []
    
    results = []
    cur.execute("""
        SELECT r.from_name, r.from_country, r.to_name, r.to_country,
               r.shared_bols, r.value
        FROM importinfo.relationships r
        WHERE (r.from_slug IN (SELECT slug FROM importinfo.companies WHERE name ILIKE %s AND country = 'Brazil')
            OR r.to_slug IN (SELECT slug FROM importinfo.companies WHERE name ILIKE %s AND country = 'Brazil'))
          AND r.shared_bols > 0
        ORDER BY r.shared_bols DESC LIMIT 30
    """, (f"%{fw}%", f"%{fw}%"))
    
    for row in cur.fetchall():
        fn, fc, tn, tc, bols, val = row
        fc_ext = extract_country(fn) or ''
        tc_ext = extract_country(tn) or ''
        fc = normalize_country(fc or fc_ext) or ''
        tc = normalize_country(tc or tc_ext) or ''
        
        from_is_br = 'Brazil' in fc or '(Brazil)' in fn
        to_is_br = 'Brazil' in tc or '(Brazil)' in tn
        if from_is_br and to_is_br: continue
        
        br_in_from = fw in fn.upper()[:50]
        br_in_to = fw in tn.upper()[:50]
        
        if br_in_from and not br_in_to:
            partner_name, partner_country, direction = tn, tc or tc_ext, 'export'
        elif br_in_to and not br_in_from:
            partner_name, partner_country, direction = fn, fc or fc_ext, 'import'
        else:
            continue
        
        pc = normalize_country(partner_country or extract_country(partner_name))
        if not pc: continue
        if any(k.lower() in (partner_name or '').lower() for k in LOGISTICS_KEYWORDS): continue
        
        results.append({
            'partner_name': partner_name, 'partner_country': pc,
            'shared_bols': bols, 'value': val, 'direction': direction,
            'source': 'relationships',
        })
    
    cur.close()
    return results

# ─── FONTE C: br_global_links ───

def search_br_global_links(conn, company_name):
    cur = conn.cursor()
    fw = get_first_word(company_name)
    if fw in GENERIC_ROOTS: return []
    
    results = []
    cur.execute("""
        SELECT global_name, global_country, match_score, total_records, root_match
        FROM importinfo.br_global_links
        WHERE br_name ILIKE %s
          AND global_name IS NOT NULL AND global_name != ''
          AND global_country NOT IN ('Brazil','','Unknown','None')
          AND global_country IS NOT NULL
          AND root_match NOT IN %s
        ORDER BY match_score DESC NULLS LAST LIMIT 10
    """, (f"%{fw}%", tuple(GENERIC_ROOTS)))
    
    for r in cur.fetchall():
        gn = r[0] or ''
        c = normalize_country(r[1])
        if not c: continue
        if any(k.lower() in gn.lower() for k in LOGISTICS_KEYWORDS): continue
        results.append({
            'partner_name': gn, 'partner_country': c,
            'match_score': r[2], 'total_records': r[3],
            'root_match': r[4], 'source': 'br_global_links',
        })
    
    cur.close()
    return results

# ─── SCORING V5 ───

def score_match(company_name, match):
    source = match.get('source', '')
    score = 10
    bols = match.get('shared_bols', 0) or 0
    
    if source == 'bol_reciprocity':
        # Fonte mais forte: BOL mostra venda direta
        if bols >= 50: score += 60
        elif bols >= 10: score += 50
        elif bols >= 3: score += 40
        else: score += 30
        score += 5  # export direction confirmed
    
    elif source == 'relationships':
        if bols >= 1000: score += 50
        elif bols >= 100: score += 40
        elif bols >= 10: score += 30
        else: score += 20
        if match.get('direction') == 'export': score += 10
    
    elif source == 'br_global_links':
        ms = match.get('match_score', 0) or 0
        score += 25 if ms > 0 else 15
        if (match.get('total_records') or 0) > 50: score += 5
        root = match.get('root_match', '') or ''
        if root and root not in GENERIC_ROOTS: score += 5
    
    # Bônus: nome compartilha raiz
    pname = match.get('partner_name', '') or ''
    if pname and company_name:
        bf = get_first_word(company_name)
        pf = get_first_word(pname)
        if bf and pf and bf == pf: score += 10
    
    return min(score, 100)

def confidence_label(score):
    if score >= 80: return "Confirmado"
    if score >= 60: return "Alta probabilidade"
    if score >= 40: return "Média probabilidade"
    if score >= 20: return "Baixa probabilidade"
    return "Sem evidência"

def evidence_text(match):
    s = match.get('source', '')
    bols = match.get('shared_bols', 0) or 0
    pn = (match.get('partner_name', '') or '')[:30]
    pc = match.get('partner_country', '') or ''
    d = match.get('direction', '')
    
    if s == 'bol_reciprocity':
        return f"Venda confirmada: BR → {pn} ({pc}) — {bols} BOLs" + (" | Relação consistente" if bols >= 10 else "")
    elif s == 'relationships':
        return f"{'Exporta' if d == 'export' else 'Importa'} de/para {pn} ({pc}) — {bols} BOLs" + (" | Relação consistente" if bols >= 100 else "")
    elif s == 'br_global_links':
        return f"Grupo corporativo: {match.get('root_match','')}"
    return ""

# ─── EVIDENCE CACHE ───

def save_to_cache(conn, ncm, matches):
    cur = conn.cursor()
    now = datetime.now()
    for m in matches:
        try:
            cur.execute("""
                INSERT INTO comexstat.evidence_cache
                    (ncm, br_company, partner_name, partner_country,
                     score, score_label, source, shared_bols, direction, evidence, verified_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (ncm, br_company, partner_name)
                DO UPDATE SET score=EXCLUDED.score, score_label=EXCLUDED.score_label,
                    source=EXCLUDED.source, shared_bols=EXCLUDED.shared_bols,
                    direction=EXCLUDED.direction, evidence=EXCLUDED.evidence,
                    verified_at=EXCLUDED.verified_at
            """, (ncm, m['br_company'], m.get('partner_name',''),
                  m.get('partner_country',''), m.get('score',0),
                  m.get('score_label',''), m.get('source',''),
                  m.get('shared_bols',0), m.get('direction',''),
                  m.get('evidence',''), now))
        except Exception as e:
            print(f"  ERRO cache: {e}")
    conn.commit()
    cur.close()

# ─── PIPELINE PRINCIPAL ───

def run(ncm, save_db=False):
    chapter = ncm[:2]
    print(f"\n{'='*70}")
    print(f"🔍 BR→FOREIGN v5 — NCM {ncm} (cap.{chapter}) — {datetime.now():%H:%M:%S}")
    print(f"{'='*70}")
    
    conn = get_conn()
    
    # Passo 1
    print(f"\n📦[1/3] Empresas brasileiras...")
    br_companies = get_br_companies(ncm)
    print(f"   → {len(br_companies)} empresas")
    if not br_companies: return
    
    by_cap = sorted(br_companies, key=lambda x: x.get('capital',0), reverse=True)
    print(f"\n   Top 10:")
    for c in by_cap[:10]:
        print(f"     {c['name'][:45]:47s} | cap={c['capital']:>12,.0f} | flow={c['flow']}")
    
    # Passo 2
    print(f"\n📦[2/3] Buscando evidencias (3 fontes)...")
    
    all_matches = []
    br_with = 0
    stats = Counter()
    
    for i, bc in enumerate(br_companies):
        name = bc['name']
        matches = []
        
        # A: BOL reciprocity (NOVA)
        bolr = search_bol_reciprocity(conn, name, chapter)
        matches.extend(bolr)
        
        # B: relationships
        rels = search_relationships(conn, name)
        matches.extend(rels)
        
        # C: br_global_links
        links = search_br_global_links(conn, name)
        matches.extend(links)
        
        if matches:
            br_with += 1
            for m in matches:
                m['br_company'] = name
                m['br_flow'] = bc.get('flow','')
                m['br_capital'] = bc.get('capital',0)
                m['score'] = score_match(name, m)
                m['score_label'] = confidence_label(m['score'])
                m['evidence'] = evidence_text(m)
                stats[m['source']] += 1
                all_matches.append(m)
        
        if (i+1) % 20 == 0:
            print(f"   ... {i+1}/{len(br_companies)}")
    
    # Dedup
    seen = set()
    unique = []
    for m in sorted(all_matches, key=lambda x: x.get('score',0), reverse=True):
        key = (m['br_company'], m.get('partner_name',''))
        if key not in seen:
            seen.add(key)
            unique.append(m)
    
    print(f"   → {len(br_companies)} BR | {br_with} com matches ({br_with*100//len(br_companies)}%)")
    print(f"   → {len(unique)} matches unicos")
    
    # Estatisticas
    levels = {'Confirmado (80-100)':0,'Alta (60-79)':0,'Media (40-59)':0,'Baixa (20-39)':0,'<20':0}
    countries = Counter()
    for m in unique:
        s = m.get('score',0)
        if s>=80: levels['Confirmado (80-100)']+=1
        elif s>=60: levels['Alta (60-79)']+=1
        elif s>=40: levels['Media (40-59)']+=1
        elif s>=20: levels['Baixa (20-39)']+=1
        else: levels['<20']+=1
        c = m.get('partner_country','')
        if c: countries[c]+=1
    
    # Salvar cache
    if save_db and unique:
        save_to_cache(conn, ncm, unique)
        print(f"   ✅ Cache salvo")
    
    conn.close()
    
    # Top 20
    print(f"\n{'='*70}")
    print(f"🏆 TOP MATCHES (score >= 40)")
    print(f"{'='*70}")
    for m in [x for x in unique if x.get('score',0)>=40][:25]:
        br = (m.get('br_company','') or '')[:38]
        fp = (m.get('partner_name','') or '')[:30]
        pais = (m.get('partner_country','') or '')[:13]
        sc = m.get('score',0)
        lb = m.get('score_label','')[:6]
        bols = m.get('shared_bols',0) or 0
        src = m.get('source','')[:10]
        print(f"   {br:40s} | {fp:32s} | {pais:13s} | {sc:3d} {lb:6s}")
        if bols: print(f"   {'':40s}   ├─ {bols} BOLs | {src}")
    
    print(f"\n📊 Score:")
    for l,c in levels.items():
        print(f"   {l:25s}: {c}")
    
    print(f"\n📊 Fontes:")
    for s,c in stats.most_common():
        print(f"   {s:25s}: {c}")
    
    print(f"\n📊 Paises:")
    for p,c in countries.most_common(20):
        print(f"   {p:20s}: {c}")
    
    out = f'/tmp/br_v5_{ncm}.json'
    with open(out,'w') as f:
        json.dump({'ncm':ncm,'chapter':chapter,'timestamp':str(datetime.now()),
            'stats':{'total':len(unique),'br_with_matches':br_with,
                     'by_score':dict(levels),'by_source':dict(stats),
                     'top_countries':dict(countries.most_common(25))},
            'matches_by_company':{}}, f, indent=2, default=str, ensure_ascii=False)
    print(f"\n💾 {out}")

if __name__ == '__main__':
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('ncm')
    p.add_argument('--save-db', action='store_true')
    args = p.parse_args()
    run(args.ncm, save_db=args.save_db)
