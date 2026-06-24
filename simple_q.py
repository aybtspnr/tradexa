import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Ultra simple query - just count by cnae
c.execute("SELECT COUNT(*) FROM estabelecimentos WHERE cnae_fiscal_principal='2040100'")
print(f"CNAE 2040100 total: {c.fetchone()[0]}")

c.execute("SELECT COUNT(*) FROM estabelecimentos WHERE cnae_fiscal_principal='2040100' AND uf='SP'")
print(f"CNAE 2040100 em SP: {c.fetchone()[0]}")

# Just get municipio
c.execute("SELECT municipio FROM estabelecimentos WHERE cnae_fiscal_principal='2040100' AND uf='SP' AND municipio IS NOT NULL LIMIT 5")
rows = c.fetchall()
print(f"Municipios RF: {[r[0] for r in rows]}")

db.close()
