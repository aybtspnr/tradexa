import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Simplified approach: find RF code for Paulinia using just the index on municipio
# Try a much simpler query
c.execute("""
    SELECT DISTINCT e.municipio 
    FROM estabelecimentos e 
    WHERE e.uf = 'SP' 
    LIMIT 5
""")
print("Amostra de municipio RF codes em SP:", [r[0] for r in c.fetchall()])

# Check if there's a separate table with IBGE to RF mapping
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]

# Check if the cnae_ncm table has useful info
c.execute("SELECT * FROM cnae_ncm LIMIT 5")
rows = c.fetchall()
if rows:
    cols = [d[0] for d in c.description]
    print(f"\ncnae_ncm columns: {cols}")
    for r in rows:
        print(f"  {r}")

# Try finding the IBGE code for Paulinia via the correct 35xxxxx code
# If we find establishments with RF code X that also appear in correct-IBGE rf_municipios
c.execute("""
    SELECT rf_code, ibge_code 
    FROM rf_municipios 
    WHERE uf='SP' AND ibge_code = 3536505
""")
r = c.fetchone()
print(f"\n\n3536505 em rf_municipios: {r}")
if r:
    print(f"RF code for Paulinia (correct IBGE): {r[0]}")

# Check if 3536505 exists between 3536001 and 3537000
c.execute("""
    SELECT ibge_code, rf_code 
    FROM rf_municipios 
    WHERE uf='SP' AND ibge_code >= 3536000 AND ibge_code <= 3537000
    ORDER BY ibge_code
""")
nearby = c.fetchall()
print(f"\nSP IBGE codes between 3536000-3537000 ({len(nearby)} found):")
for ibge, rf in nearby:
    c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (str(ibge),))
    name = c.fetchone()
    name_str = name[0] if name else "?"
    print(f"  IBGE={ibge} RF={rf} -> {name_str}")

db.close()
