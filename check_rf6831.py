import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check if RF code 6831 exists in rf_municipios
for rf in ['6831', '6829', '6833', '6830', '6832']:
    c.execute("SELECT rf_code, ibge_code, uf FROM rf_municipios WHERE rf_code=? AND uf='SP'", (rf,))
    r = c.fetchone()
    print(f"RF code {rf} em rf_municipios: {r}")

# Quick check: how many RF codes between 6829 and 6833 exist for SP?
c.execute("SELECT rf_code, ibge_code FROM rf_municipios WHERE uf='SP' AND CAST(rf_code AS INTEGER) BETWEEN 6825 AND 6840 ORDER BY CAST(rf_code AS INTEGER)")
rows = c.fetchall()
print(f"\nRF codes SP entre 6825-6840:")
for r in rows:
    print(f"  RF={r[0]} -> IBGE={r[1]}")

db.close()
