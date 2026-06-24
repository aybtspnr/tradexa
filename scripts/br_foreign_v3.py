#!/usr/bin/env python3
"""
Pipeline BR→Foreign v3 — Scoring Final com Evidências

ESTRATÉGIA:
1. API → empresas brasileiras que comerciam o NCM
2. relationships → BOLs compartilhados com empresas estrangeiras (EVIDÊNCIA MAIS FORTE)
3. br_global_links → grupos corporativos confirmados
4. name_clusters → clusters de empresas com mesmo nome raiz
5. Score dinâmico baseado em volume de BOLs + tipo de match + flow

Uso: python3 br_foreign_v3.py [NCM] [--all] [--output FILE]
"""

import json
import sys
import urllib.request
from collections import defaultdict
import psycopg2
import re
from datetime import datetime

DB_DSN = "host=localhost dbname=tradexa_comexstat user=tradexa password=tradexa2026"

# Clusters genéricos/logística para EXCLUIR
GENERIC_ROOTS = {
    'LOGISTICS', 'FREIGHT', 'SHIPPING', 'CARGO', 'TRANS', 'TRADE', 
    'LOG', 'FORWARDING', 'COURIER', 'DISTRIBUTION', 'WAREHOUSE',
    'TRANSPORT', 'GREEN', 'UNION', 'GRAND', 'PERFORMANCE',
    'SPECIAL', 'SYNERGY', 'MOVING', 'TECNOLOGIA', 'TECHNOLOGIES',
    'SOLUTIONS', 'SERVICES', 'WORLDWIDE', 'INTERNATIONAL', 'OCEAN',
    'AIR', 'SEA', 'LAND', 'ALLIANCE', 'GROUP', 'PARTNERS', 'GLOBAL'
}

LOGISTICS_KEYWORDS = [
    'LOGISTIC', 'FREIGHT', 'SHIPPING', 'CARGO', 'FORWARDING',
    'TRANSPORT', 'COURIER', 'WAREHOUSE', 'DISTRIBUTION',
    'AGENCIAMENTO', 'NAVEGACAO', 'LOG', 'TRANS'
]

def get_br_companies_from_api(ncm, limit_empresas=200):
    """Obtém empresas brasileiras do endpoint /details."""
    url = f"http://localhost:5057/api/v1/intel/ncm/{ncm}/details?limit_empresas={limit_empresas}"
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
                    'confidence_label': c.get('confidence_label', ''),
                    'capital': c.get('capital_social', 0) or 0,
                    'cnae': c.get('cnae_desc', ''),
                })
    
    return companies

def extract_country(text):
    """Extrai país de texto como 'CARGILL JAPAN LLC (Japan)' ou 'VITERRA INC. (Canada)'"""
    if not text:
        return None
    # Padrão: "XXX (Country)"
    m = re.search(r'\(([^)]+)\)$', text)
    if m:
        country = m.group(1).strip()
        # Filtrar valores que não são países
        if country not in ('USA', '', 'Unknown'):
            return country
    return None

def normalize_country(company_country, text_hint=None):
    """Normaliza país para nome canônico."""
    mapping = {
        'USA': 'United States', 'Milwaukee': 'United States', 'Indiana': 'United States',
        'Indianapolis': 'United States', 'Mexico City': 'Mexico', 'Jakarta': 'Indonesia',
        'Shanghai': 'China', 'Beijing': 'China', 'Seoul': 'South Korea',
        'Tokyo': 'Japan', 'Yokohama': 'Japan', 'Bangkok': 'Thailand',
        'Singapore': 'Singapore', 'London': 'United Kingdom',
    }
    if company_country and company_country in mapping:
        return mapping[company_country]
    return company_country

def search_relationships(conn, company_name):
    """Busca em relationships — FONTE MAIS FORTE de evidência."""
    cur = conn.cursor()
    
    # Extrair primeira palavra significativa
    words = company_name.split()
    first_word = words[0] if words else ''
    # Pular palavras genéricas
    skip_words = {'LTDA', 'SA', 'S/A', 'ME', 'EPP', 'DO', 'DA', 'DE', 'COM', 'E', 'LTDA.', 'S.A.'}
    for w in words:
        if w.upper() not in skip_words and len(w) > 2:
            first_word = w
            break
    
    if first_word == company_name.split()[0] if words else '':
        pass  # keep first_word
    # Try with first 2 significant words
    sig_words = [w for w in words[:3] if w.upper() not in skip_words and len(w) > 2]
    search_term = ' '.join(sig_words[:2]) if sig_words else first_word
    
    results = []
    
    # Buscar relacionamentos where Brazilian company is involved
    cur.execute("""
        SELECT r.from_name, r.from_country,
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
        LIMIT 50
    """, (f"%{first_word}%", f"%{first_word}%"))
    
    for row in cur.fetchall():
        from_name = row[0] or ''
        from_country = row[1] or ''
        to_name = row[2] or ''
        to_country = row[3] or ''
        
        # Determinar se o parceiro estrangeiro é FROM ou TO
        # Se from_name ≈ company_name, então partner = to_name (buyer)
        # Se to_name ≈ company_name, então partner = from_name (seller)
        is_from_br = first_word.upper() in from_name.upper()[:30]
        is_to_br = first_word.upper() in to_name.upper()[:30]
        
        if is_from_br and not is_to_br:
            partner_name = to_name
            partner_country = to_country or extract_country(to_name) or from_country
            direction = 'export'  # BR vende para foreign
        elif is_to_br and not is_from_br:
            partner_name = from_name
            partner_country = from_country or extract_country(from_name)
            direction = 'import'  # BR compra de foreign
        else:
            # Ambos ou nenhum — usar o que tiver mais BOLs com nome mais diferente
            if first_word.upper() in to_name.upper()[:30]:
                partner_name = from_name
                partner_country = from_country or extract_country(from_name)
                direction = 'import'
            else:
                partner_name = to_name
                partner_country = to_country or extract_country(to_name)
                direction = 'export'
        
        # Filtrar logística
        if any(kw.lower() in (partner_name or '').lower() for kw in LOGISTICS_KEYWORDS):
            continue
        
        # Extrair país se não veio do campo country
        if not partner_country or partner_country in ('', 'Unknown'):
            partner_country = extract_country(partner_name)
        
        partner_country = normalize_country(partner_country)
        
        # Calcular score baseado em shared_bols
        bols = row[4] or 0
        
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

def search_br_global_links(conn, company_name, chapter):
    """Busca em br_global_links."""
    cur = conn.cursor()
    first_word = company_name.split()[0] if company_name.split() else ''
    if first_word.upper() in GENERIC_ROOTS:
        cur.close()
        return []
    
    results = []
    cur.execute("""
        SELECT DISTINCT bgl.br_name, bgl.global_name, 
               bgl.global_country, bgl.global_city,
               bgl.match_score, bgl.total_records, bgl.root_match
        FROM importinfo.br_global_links bgl
        WHERE bgl.br_name ILIKE %s
          AND bgl.global_name IS NOT NULL AND bgl.global_name != ''
          AND bgl.root_match NOT IN %s
        ORDER BY bgl.match_score DESC NULLS LAST
        LIMIT 10
    """, (f"%{first_word}%", tuple(GENERIC_ROOTS)))
    
    for row in cur.fetchall():
        global_name = row[1] or ''
        if any(kw.lower() in global_name.lower() for kw in LOGISTICS_KEYWORDS):
            continue
        
        country = row[2] or ''
        country = normalize_country(country)
        
        results.append({
            'partner_name': global_name,
            'partner_country': country,
            'partner_city': row[3],
            'match_score': row[4],
            'total_records': row[5],
            'root_match': row[6],
            'source': 'br_global_links',
        })
    
    cur.close()
    return results

def search_name_clusters(conn, company_name, chapter):
    """Busca em name_clusters."""
    cur = conn.cursor()
    first_word = company_name.split()[0] if company_name.split() else ''
    if first_word.upper() in GENERIC_ROOTS:
        cur.close()
        return []
    
    results = []
    cur.execute("""
        SELECT DISTINCT nc.root_match, unnest(nc.names) as name,
               unnest(nc.countries) as country, nc.is_generic
        FROM importinfo.name_clusters nc
        WHERE nc.root_match = %s
          AND nc.is_generic = FALSE
        ORDER BY name
        LIMIT 20
    """, (first_word.upper(),))
    
    for row in cur.fetchall():
        country = row[2] or ''
        if country in ('Brazil', '', 'Unknown', 'None'):
            continue
        name = row[1] or ''
        if any(kw.lower() in name.lower() for kw in LOGISTICS_KEYWORDS):
            continue
        
        country = normalize_country(country)
        
        results.append({
            'partner_name': name,
            'partner_country': country,
            'root_match': row[0],
            'source': 'name_clusters',
        })
    
    cur.close()
    return results

def score_match(company_name, match):
    """
    Score baseado em evidências múltiplas.
    
    Tabela de pesos:
    - relationships com >1000 BOLs: +50 (evidência fortíssima)
    - relationships com >100 BOLs: +40
    - relationships com >10 BOLs: +30
    - relationships com >0 BOLs: +20
    - br_global_links com match_score > 0: +30
    - br_global_links: +20
    - name_clusters: +15
    - Bônus: nome compartilha raiz (ex: Cargill→Cargill Japan): +15
    - Bônus: flow export (BR vende para foreign): +10
    - Bônus: país válido: +5
    """
    source = match.get('source', '')
    score = 10  # baseline
    
    bols = match.get('shared_bols', 0) or 0
    match_score = match.get('match_score', 0) or 0
    
    if source == 'relationships':
        if bols >= 1000:
            score += 50
        elif bols >= 100:
            score += 40
        elif bols >= 10:
            score += 30
        elif bols > 0:
            score += 20
        
        # Bônus export direction
        if match.get('direction') == 'export':
            score += 5
    
    elif source == 'br_global_links':
        if match_score > 0:
            score += 30
        else:
            score += 20
        
        if (match.get('total_records') or 0) > 50:
            score += 10
        
        if match.get('root_match') and match['root_match'].upper() not in GENERIC_ROOTS:
            score += 5
    
    elif source == 'name_clusters':
        score += 15
        if match.get('root_match', '').upper() not in GENERIC_ROOTS:
            score += 5
    
    # Bônus: nome compartilha raiz (Cargill Brasil → Cargill Japan)
    partner_name = match.get('partner_name', '') or ''
    if partner_name:
        br_first = company_name.split()[0] if company_name.split() else ''
        partner_first = partner_name.split()[0] if partner_name.split() else ''
        if br_first and partner_first and br_first.upper() == partner_first.upper():
            score += 15
    
    # Bônus: país válido
    if match.get('partner_country') and match['partner_country'] not in ('', 'Unknown', 'None'):
        score += 5
    
    score = min(score, 100)
    return score

def confidence_label(score):
    if score >= 80: return "Confirmado"
    if score >= 60: return "Alta probabilidade"
    if score >= 40: return "Média probabilidade"
    if score >= 20: return "Baixa probabilidade"
    return "Sem evidência"

def generate_evidence_text(match):
    """Gera texto descritivo da evidência."""
    parts = []
    source = match.get('source', '')
    
    if source == 'relationships':
        bols = match.get('shared_bols', 0)
        direction = match.get('direction', '')
        partner = match.get('partner_name', '')
        country = match.get('partner_country', '')
        
        if direction == 'export':
            parts.append(f"{bols} embarques BOL compartilhados (BR→{partner}{' ('+country+')' if country else ''})")
        else:
            parts.append(f"{bols} embarques BOL compartilhados ({partner}→BR)")
        
        if bols >= 100:
            parts.append("Relação comercial consistente e duradoura")
        elif bols >= 10:
            parts.append("Relação comercial recorrente")
    
    elif source == 'br_global_links':
        parts.append(f"Grupo corporativo: {match.get('root_match', '')}")
        if match.get('total_records', 0):
            parts.append(f"{match['total_records']} registros BOL no total")
    
    elif source == 'name_clusters':
        parts.append(f"Cluster corporativo: {match.get('root_match', '')}")
    
    return ' | '.join(parts)

def run(ncm_code, output_file=None):
    chapter = ncm_code[:2]
    print(f"\n{'='*70}")
    print(f"** BR→FOREIGN v3 — NCM {ncm_code} (cap.{chapter})")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}")
    
    # Passo 1: Empresas BR
    print(f"\n📦[1/3] Buscando empresas brasileiras...")
    br_companies = get_br_companies_from_api(ncm_code)
    print(f"   → {len(br_companies)} empresas únicas")
    
    if not br_companies:
        print("   ⚠️ Nenhuma empresa encontrada.")
        return
    
    # Top 10
    by_capital = sorted(br_companies, key=lambda x: x.get('capital', 0), reverse=True)
    print(f"\n   Top 10:")
    for c in by_capital[:10]:
        print(f"     {c['name'][:45]:47s} | cap={c['capital']:>12,.0f} | flow={c['flow']}")
    
    # Passo 2: Matches
    print(f"\n📦[2/3] Buscando matches corporativos e relacionamentos...")
    conn = psycopg2.connect(DB_DSN)
    
    all_matches = []
    br_with_matches = 0
    
    for i, br_comp in enumerate(br_companies):
        name = br_comp['name']
        if (i+1) % 20 == 0:
            print(f"   ... {i+1}/{len(br_companies)} processadas")
        
        matches = []
        
        # relationships é a fonte MAIS FORTE
        rels = search_relationships(conn, name)
        matches.extend(rels)
        
        # br_global_links
        links = search_br_global_links(conn, name, chapter)
        matches.extend(links)
        
        # name_clusters
        clusters = search_name_clusters(conn, name, chapter)
        matches.extend(clusters)
        
        if matches:
            br_with_matches += 1
            for m in matches:
                m['br_company'] = name
                m['br_flow'] = br_comp.get('flow', '')
                m['br_capital'] = br_comp.get('capital', 0)
                
                # Calcular score
                m['score'] = score_match(name, m)
                m['score_label'] = confidence_label(m['score'])
                m['evidence'] = generate_evidence_text(m)
                all_matches.append(m)
    
    conn.close()
    
    # Ordenar
    all_matches.sort(key=lambda x: x.get('score', 0), reverse=True)
    
    # Deduplicar por (br_company, partner_name)
    seen = set()
    unique_matches = []
    for m in all_matches:
        key = (m['br_company'], m.get('partner_name', ''))
        if key not in seen:
            seen.add(key)
            unique_matches.append(m)
    
    print(f"   → {len(br_companies)} empresas BR analisadas")
    print(f"   → {br_with_matches} empresas com matches ({br_with_matches/len(br_companies)*100:.0f}%)")
    print(f"   → {len(all_matches)} matches brutos, {len(unique_matches)} únicos")
    
    # Estatísticas
    levels = {'Confirmado (80-100)': 0, 'Alta (60-79)': 0, 
              'Média (40-59)': 0, 'Baixa (20-39)': 0, 'Sem evidência (<20)': 0}
    for m in unique_matches:
        s = m.get('score', 0)
        if s >= 80: levels['Confirmado (80-100)'] += 1
        elif s >= 60: levels['Alta (60-79)'] += 1
        elif s >= 40: levels['Média (40-59)'] += 1
        elif s >= 20: levels['Baixa (20-39)'] += 1
        else: levels['Sem evidência (<20)'] += 1
    
    # Por source
    sources = defaultdict(int)
    for m in unique_matches:
        sources[m.get('source', '?')] += 1
    
    # Top países
    countries = defaultdict(int)
    for m in unique_matches:
        c = m.get('partner_country', '')
        if c and c not in ('', 'Unknown', 'None'):
            countries[c] += 1
    
    # Output
    print(f"\n{'='*70}")
    print(f"🏆 TOP 20 MATCHES (por score)")
    print(f"{'='*70}")
    
    for m in unique_matches[:20]:
        br = (m.get('br_company', '') or '')[:38]
        fp = (m.get('partner_name', '') or '')[:30]
        pais = (m.get('partner_country', '') or '')[:13]
        score = m.get('score', 0)
        label = m.get('score_label', '')[:6]
        fonte = (m.get('source', '') or '')[:8]
        bols = m.get('shared_bols', 0) or 0
        
        print(f"   {br:40s} | {fp:32s} | {pais:13s} | {score:3d} {label:6s}")
        if bols:
            print(f"   {'':40s}   {'':32s}   {'':13s}   ├─ {bols} BOLs | {fonte}")
        ev = m.get('evidence', '')
        if ev:
            print(f"   {'':40s}   {'':32s}   {'':13s}   ├─ {ev[:60]}")
    
    print(f"\n📊 Score Distribution:")
    for level, count in levels.items():
        bar = '█' * min(count // 2, 50)
        print(f"   {level:25s}: {count:4d} {bar}")
    
    print(f"\n📊 Fontes de evidência:")
    for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
        print(f"   {source:20s}: {count}")
    
    print(f"\n📊 Top países parceiros:")
    for pais, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:20]:
        print(f"   {pais:15s}: {count}")
    
    # Salvar
    output = {
        'ncm': ncm_code,
        'chapter': chapter,
        'timestamp': datetime.now().isoformat(),
        'stats': {
            'total_br_companies': len(br_companies),
            'companies_with_matches': br_with_matches,
            'total_matches': len(unique_matches),
            'by_score': levels,
            'by_source': dict(sources),
            'top_countries': dict(sorted(countries.items(), key=lambda x: x[1], reverse=True)[:25]),
        },
        'top_br_companies': [
            {'name': c['name'], 'flow': c['flow'], 'capital': c['capital']}
            for c in by_capital[:15]
        ],
        'top_matches': unique_matches[:100],
        'all_matches_by_company': {}
    }
    
    for m in unique_matches:
        br = m.get('br_company', '')
        if br not in output['all_matches_by_company']:
            output['all_matches_by_company'][br] = []
        output['all_matches_by_company'][br].append({
            'partner_name': m.get('partner_name', ''),
            'partner_country': m.get('partner_country', ''),
            'score': m.get('score', 0),
            'score_label': m.get('score_label', ''),
            'source': m.get('source', ''),
            'shared_bols': m.get('shared_bols', 0),
            'direction': m.get('direction', ''),
            'evidence': m.get('evidence', ''),
        })
    
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(output, f, indent=2, default=str, ensure_ascii=False)
        print(f"\n💾 Resultados salvos em: {output_file}")
    
    return output

if __name__ == '__main__':
    output_file = '/tmp/br_foreign_v3_results.json'
    ncm = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not ncm:
        print("Uso: python3 br_foreign_v3.py NCM [--output FILE]")
        print("Ex: python3 br_foreign_v3.py 61091000")
        sys.exit(1)
    
    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        output_file = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else output_file
    
    run(ncm, output_file)
