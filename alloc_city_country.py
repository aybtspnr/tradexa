import sqlite3
from collections import defaultdict

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# 1. Get NCM 54024400 country totals
c.execute("""
    SELECT CO_PAIS, SUM(KG_LIQUIDO), SUM(VL_FOB)
    FROM comex_exp_2026_ncm
    WHERE CO_NCM = '54024400'
      AND CO_MES = '02'
    GROUP BY CO_PAIS
    ORDER BY SUM(VL_FOB) DESC
""")
ncm_rows = c.fetchall()

# 2. Get SH4 5402 city-country breakdown
c.execute("""
    SELECT CO_MUN, CO_PAIS, SUM(KG_LIQUIDO), SUM(VL_FOB)
    FROM comex_exp_2026_mun
    WHERE SH4 = '5402'
      AND CO_MES = '02'
    GROUP BY CO_MUN, CO_PAIS
    ORDER BY CO_MUN, SUM(VL_FOB) DESC
""")
sh4_rows = c.fetchall()

# 3. Get city and country names
c.execute("SELECT cod_mun, nome_mun, uf FROM comex_municipios")
mun_map = {r[0]: (r[1], r[2]) for r in c.fetchall()}
c.execute("SELECT cod_pais, nome_pais FROM comex_paises")
pais_map = dict(c.fetchall())

# Build SH4 country-city totals
sh4_by_country = defaultdict(lambda: defaultdict(float))  # pais -> {cidade: fob}
sh4_by_country_kg = defaultdict(lambda: defaultdict(float))
sh4_total_by_country = defaultdict(float)  # pais -> total fob

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

# Allocate NCM values to cities proportionally
print("=" * 80)
print("NCM 54024400 - Exportacao por Cidade e Pais (Fev/2026)")
print("Alocacao proporcional baseada no SH4 5402")
print("=" * 80)

# Group by city first
city_pais = defaultdict(list)

for nome_pais, ncm_data in sorted(ncm_by_country.items(), key=lambda x: x[1]['fob'], reverse=True):
    ncm_fob = ncm_data['fob']
    ncm_kg = ncm_data['kg']
    sh4_total = sh4_total_by_country.get(nome_pais, 0)
    
    if sh4_total <= 0 or ncm_fob <= 0:
        continue
    
    # Distribute NCM value to cities proportionally
    city_fobs = sh4_by_country[nome_pais]
    for city_key, sh4_fob in sorted(city_fobs.items(), key=lambda x: x[1], reverse=True):
        ratio = sh4_fob / sh4_total if sh4_total > 0 else 0
        allocated_fob = ncm_fob * ratio
        allocated_kg = ncm_kg * ratio if ncm_kg > 0 else (sh4_by_country_kg[nome_pais][city_key] * ratio if False else 0)
        
        if allocated_fob >= 10:  # Only show meaningful values
            city_pais[city_key].append({
                'pais': nome_pais,
                'fob': allocated_fob,
                'kg': allocated_kg
            })

# Print by city
for city_key in sorted(city_pais.keys(), key=lambda k: sum(p['fob'] for p in city_pais[k]), reverse=True):
    total_fob = sum(p['fob'] for p in city_pais[city_key])
    total_kg = sum(p['kg'] for p in city_pais[city_key])
    print(f"\n{'-'*60}")
    print(f"📍 {city_key}")
    print(f"   Total: US$ {total_fob:,.2f} | {total_kg:.0f} kg")
    print(f"   Por país:")
    for p in sorted(city_pais[city_key], key=lambda x: x['fob'], reverse=True):
        print(f"     {p['pais']:<25} US$ {p['fob']:>10,.2f} | {p['kg']:>6.0f} kg | US$ {p['fob']/p['kg']:.2f}/kg" if p['kg'] > 0 else f"     {p['pais']:<25} US$ {p['fob']:>10,.2f} | {p['kg']:>6.0f} kg | N/A")

db.close()
