import sqlite3
from collections import defaultdict

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# City and country maps
c.execute("SELECT cod_mun, nome_mun, uf FROM comex_municipios")
mun_map = {r[0]: (r[1], r[2]) for r in c.fetchall()}
c.execute("SELECT cod_pais, nome_pais FROM comex_paises")
pais_map = dict(c.fetchall())

def analyze_flow(flow, label):
    ncm_table = f"comex_{flow}_2026_ncm"
    mun_table = f"comex_{flow}_2026_mun"
    
    print(f"\n{'=' * 80}")
    print(f"{label} NCM 54024400 - Fev/2026")
    print(f"{'=' * 80}")
    
    # 1. Get NCM country totals
    c.execute(f"""
        SELECT CO_PAIS, SUM(KG_LIQUIDO), SUM(VL_FOB)
        FROM {ncm_table}
        WHERE CO_NCM = '54024400'
          AND CO_MES = '02'
        GROUP BY CO_PAIS
        ORDER BY SUM(VL_FOB) DESC
    """)
    ncm_rows = c.fetchall()
    
    if not ncm_rows:
        print(" Sem dados no nivel NCM")
        return
    
    # 2. Get SH4 city-country breakdown
    c.execute(f"""
        SELECT CO_MUN, CO_PAIS, SUM(KG_LIQUIDO), SUM(VL_FOB)
        FROM {mun_table}
        WHERE SH4 = '5402'
          AND CO_MES = '02'
        GROUP BY CO_MUN, CO_PAIS
        ORDER BY SUM(VL_FOB) DESC
    """)
    sh4_rows = c.fetchall()
    
    # Build SH4 country-city totals
    sh4_by_country = defaultdict(lambda: defaultdict(float))
    sh4_by_country_kg = defaultdict(lambda: defaultdict(float))
    sh4_total_by_country = defaultdict(float)
    
    for r in sh4_rows:
        cod_mun = r[0]
        co_pais = r[1]
        kg = r[2] or 0
        fob = r[3] or 0
        cidade = mun_map.get(cod_mun, (cod_mun, ''))
        city_key = f"{cidade[0]}/{cidade[1]}"
        nome_pais = pais_map.get(co_pais, f'Cod {co_pais}')
        sh4_by_country[nome_pais][city_key] += fob
        sh4_by_country_kg[nome_pais][city_key] += kg
        sh4_total_by_country[nome_pais] += fob
    
    # Build NCM country totals
    ncm_by_country = {}
    for r in ncm_rows:
        co_pais = r[0]
        kg = r[1] or 0
        fob = r[2] or 0
        nome_pais = pais_map.get(co_pais, f'Cod {co_pais}')
        ncm_by_country[nome_pais] = {'fob': fob, 'kg': kg}
    
    # Global stats
    total_fob = sum(v['fob'] for v in ncm_by_country.values())
    total_kg = sum(v['kg'] for v in ncm_by_country.values())
    print(f"\n Total FOB: US$ {total_fob:,.2f}")
    print(f" Total KG: {total_kg:,.0f} kg ({total_kg/1000:,.1f} t)")
    print(f" Preco medio: US$ {total_fob/total_kg:.2f}/kg\n" if total_kg > 0 else "")
    
    # Allocate NCM values to cities proportionally
    city_pais = defaultdict(list)
    
    for nome_pais, ncm_data in sorted(ncm_by_country.items(), key=lambda x: x[1]['fob'], reverse=True):
        ncm_fob = ncm_data['fob']
        ncm_kg = ncm_data['kg']
        sh4_total = sh4_total_by_country.get(nome_pais, 0)
        
        if sh4_total <= 0 or ncm_fob <= 0:
            continue
        
        city_fobs = sh4_by_country[nome_pais]
        for city_key, sh4_fob in sorted(city_fobs.items(), key=lambda x: x[1], reverse=True):
            ratio = sh4_fob / sh4_total
            allocated_fob = ncm_fob * ratio
            allocated_kg = ncm_kg * ratio
            
            if allocated_fob >= 100:  # Filter small values
                city_pais[city_key].append({
                    'pais': nome_pais,
                    'fob': allocated_fob,
                    'kg': allocated_kg,
                    'usd_kg': allocated_fob / allocated_kg if allocated_kg > 0 else 0
                })
    
    # Print by city
    for city_key in sorted(city_pais.keys(), key=lambda k: sum(p['fob'] for p in city_pais[k]), reverse=True):
        total_fob_city = sum(p['fob'] for p in city_pais[city_key])
        total_kg_city = sum(p['kg'] for p in city_pais[city_key])
        print(f"\n {'-' * 60}")
        print(f" 📍 {city_key}")
        print(f"    Total: US$ {total_fob_city:,.2f} | {total_kg_city:,.0f} kg | US$ {total_fob_city/total_kg_city:.2f}/kg")
        print(f"    Por pais:")
        for p in sorted(city_pais[city_key], key=lambda x: x['fob'], reverse=True):
            preco = f"US$ {p['usd_kg']:.2f}/kg" if p['kg'] > 0 else "N/A"
            print(f"      {p['pais']:<28} US$ {p['fob']:>10,.2f} | {p['kg']:>7,.0f} kg | {preco}")

# Analyze both flows
analyze_flow("imp", "📥 IMPORTACAO")
analyze_flow("exp", "📤 EXPORTACAO")

db.close()
