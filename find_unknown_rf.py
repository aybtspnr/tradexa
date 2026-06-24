import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Find a empresa in Paulinia using any CNAE to discover the RF code
# Use the idx_estab_municipio index by searching for 'SP' municipio codes
# that we know exist from rf_municipios, but also check for unknown ones

# Get a list of known RF codes for SP
c.execute("SELECT rf_code FROM rf_municipios WHERE uf='SP'")
known_rf = set(r[0] for r in c.fetchall())
print(f"Known RF codes in SP: {len(known_rf)}")

# Now do a direct query for Paulinia - we know it exports SH4 5402
# Look for establishments in SP with any CNAE in the textile range
# that have a municipio NOT in known_rf (these are the missing cities)
result = c.execute("""
    SELECT e.municipio, e.cnae_fiscal_principal, e.nome_fantasia, e.uf
    FROM estabelecimentos e
    WHERE e.cnae_fiscal_principal BETWEEN '1311000' AND '1355000'
      AND e.uf = 'SP'
      AND e.municipio NOT IN (SELECT rf_code FROM rf_municipios WHERE uf='SP')
    LIMIT 20
""")
rows = result.fetchall()
print(f"\nEstablishments in 'unknown' SP RF codes: {len(rows)}")
seen = set()
for r in rows:
    rf = r[0]
    if rf not in seen:
        seen.add(rf)
        cnae = r[1]
        name = r[2] or '?'
        print(f"  RF code={rf}, CNAE={cnae}, nome={name}")

# For each unknown RF code, try adding it to rf_municipios
# The ibge_code to assign is the corrected one (35xxxxx)
print(f"\nUnique unknown RF codes found: {len(seen)}")
for rf in sorted(seen):
    print(f"  RF code={rf} -> needs to be mapped")

db.close()
