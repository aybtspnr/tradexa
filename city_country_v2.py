import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check NCM table structure
c.execute("SELECT sql FROM sqlite_master WHERE name='comex_exp_2026_ncm'")
schema_ncm = c.fetchone()
print("NCM table schema:")
print(schema_ncm[0] if schema_ncm else "NOT FOUND")

# Get NCM-level country data for 54024400 in Feb 2026
print("\n\nNCM 54024400 - country breakdown from NCM table:")
c.execute("""
    SELECT CO_PAIS, KG_LIQUIDO, VL_FOB
    FROM comex_exp_2026_ncm
    WHERE CO_NCM = '54024400'
      AND CO_MES = '02'
    ORDER BY VL_FOB DESC
""")
# Get country names
c.execute("SELECT CO_PAIS, NO_PAIS FROM comex_paises")
pais_map = dict(c.fetchall())

rows = c.fetchall()
if rows:
    total_fob = sum(r[2] for r in rows)
    total_kg = sum(r[1] for r in rows)
    print(f"Total FOB: US$ {total_fob:,.2f}")
    print(f"Total KG: {total_kg:.0f} kg")
    print()
    for r in rows:
        nome = pais_map.get(r[0], f'Cod {r[0]}')
        print(f"  -> {nome}: US$ {r[2]:,.2f} | {r[1]:.0f} kg")
else:
    print("No data found in NCM table")
    # Show what's in the table
    c.execute("SELECT COUNT(*) FROM comex_exp_2026_ncm")
    total = c.fetchone()[0]
    print(f"Total records in exp_2026_ncm: {total}")
    c.execute("SELECT DISTINCT CO_NCM FROM comex_exp_2026_ncm LIMIT 5")
    for r in c.fetchall():
        print(f"  NCM: {r[0]}")

# Also get SH4 level city-country data to show per-city breakdown (SH4 5402)
print("\n\nSH4 5402 (heading) - City-Country breakdown from MUN table:")
c.execute("""
    SELECT e.CO_MUN, e.CO_PAIS, SUM(e.KG_LIQUIDO), SUM(e.VL_FOB)
    FROM comex_exp_2026_mun e
    WHERE e.SH4 = '5402'
      AND e.CO_MES = '02'
    GROUP BY e.CO_MUN, e.CO_PAIS
    ORDER BY SUM(e.VL_FOB) DESC
""")
# City names
c.execute("SELECT cod_mun, nome_mun, uf FROM comex_municipios")
mun_map = {r[0]: (r[1], r[2]) for r in c.fetchall()}

from collections import defaultdict
city_data = defaultdict(list)
for r in c.fetchall():
    cod_mun = r[0]
    co_pais = r[1]
    kg = r[2] or 0
    fob = r[3] or 0
    cidade = mun_map.get(cod_mun, (cod_mun, ''))
    nome_pais = pais_map.get(co_pais, f'Cod {co_pais}')
    city_data[(cidade[0], cidade[1])].append({
        'pais': nome_pais,
        'fob': fob,
        'kg': kg
    })

for (cidade, uf), paises in sorted(city_data.items(), key=lambda x: sum(p['fob'] for p in x[1]), reverse=True):
    total_fob = sum(p['fob'] for p in paises)
    total_kg = sum(p['kg'] for p in paises)
    print(f"\n{cidade}/{uf} - US$ {total_fob:,.2f} - {total_kg:.0f} kg")
    for p in sorted(paises, key=lambda x: x['fob'], reverse=True):
        print(f"  {p['pais']}: US$ {p['fob']:,.2f} | {p['kg']:.0f} kg")

db.close()
