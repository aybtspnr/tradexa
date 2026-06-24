import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Get city-country mapping for NCM 54024400 (SH4 5402) export Feb 2026
c.execute("""
    SELECT e.CO_MUN, e.CO_PAIS, e.KG_LIQUIDO, e.VL_FOB
    FROM comex_exp_2026_mun e
    WHERE e.SH4 = '5402'
      AND e.CO_MES = '02'
      AND e.KG_LIQUIDO > 0
    ORDER BY e.VL_FOB DESC
""")

# Get city names
c.execute("SELECT cod_mun, nome_mun, uf FROM comex_municipios")
mun_map = {}
for r in c.fetchall():
    mun_map[r[0]] = (r[1], r[2])

# Get country names
c.execute("SELECT CO_PAIS, NO_PAIS FROM comex_paises")
pais_map = {}
for r in c.fetchall():
    pais_map[r[0]] = r[1]

# Group by city
from collections import defaultdict
city_countries = defaultdict(list)
for r in c.fetchall():
    cod_mun = r[0]
    co_pais = r[1]
    kg = r[2] or 0
    fob = r[3] or 0
    cidade = mun_map.get(cod_mun, (cod_mun, ''))
    nome_cidade = cidade[0]
    uf = cidade[1]
    nome_pais = pais_map.get(co_pais, f'Pais {co_pais}')
    
    city_countries[(nome_cidade, uf)].append({
        'pais': nome_pais,
        'kg': kg,
        'fob': fob
    })

# Print results
print("Exportacao por Cidade e Pais - NCM 54024400 - Fev/2026")
print()

for (cidade, uf), paises in sorted(city_countries.items(), key=lambda x: sum(p['fob'] for p in x[1]), reverse=True):
    total_fob = sum(p['fob'] for p in paises)
    total_kg = sum(p['kg'] for p in paises)
    print(f"{cidade}/{uf} - US$ {total_fob:,.2f} - {total_kg:.0f} kg")
    for p in sorted(paises, key=lambda x: x['fob'], reverse=True):
        print(f"  -> {p['pais']}: US$ {p['fob']:,.2f} | {p['kg']:.0f} kg")
    print()

db.close()
