import sqlite3

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Get a sample of establishments in SP with textile CNAEs to find Paulinia's RF code
# Use a more efficient query with LIMIT
c.execute("""
    SELECT e.municipio, e.cnae_fiscal_principal, e.nome_fantasia, e.uf
    FROM estabelecimentos e
    WHERE e.cnae_fiscal_principal IN ('1313800', '2040100')
      AND e.uf = 'SP'
      AND e.municipio IS NOT NULL
      AND e.municipio != ''
    LIMIT 100
""")
rows = c.fetchall()
print(f"Amostra de {len(rows)} estabelecimentos SP com CNAEs 13138/20401:")
rf_codes_seen = set()
for r in rows:
    rf_codes_seen.add(r[0])
    if 'PAULIN' in (r[2] or '').upper():
        print(f"  ENCONTRADO PAULINIA! RF code: {r[0]}")
        print(f"    Nome: {r[2]}, CNAE: {r[1]}")

print(f"\nRF codes distintos vistos: {sorted(rf_codes_seen)[:20]}")

# For each RF code, check if it maps to any IBGE code in rf_municipios
for rf in sorted(rf_codes_seen)[:10]:
    c.execute("SELECT ibge_code, uf FROM rf_municipios WHERE rf_code = ? AND uf = 'SP'", (rf,))
    ibge = c.fetchone()
    if ibge:
        print(f"  RF code {rf} -> IBGE {ibge[0]}")
    else:
        print(f"  RF code {rf} -> NENHUM MAPEAMENTO em rf_municipios")

db.close()
