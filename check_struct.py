import sqlite3
import sys

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check estabelecimentos structure
c.execute("PRAGMA table_info(estabelecimentos)")
print("=== ESTRUTURA estabelecimentos ===")
for r in c.fetchall():
    print(f"  {r}")

# Check empresas structure
c.execute("PRAGMA table_info(empresas)")
print("\n=== ESTRUTURA empresas ===")
for r in c.fetchall():
    print(f"  {r}")

# Check if there's a secondary CNAE table
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%cnae%'")
print("\n=== TABELAS CNAE ===")
for t in c.fetchall():
    print(f"  {t[0]}")

# Check cnae table
c.execute("PRAGMA table_info(cnae)")
print("\n=== ESTRUTURA cnae ===")
for r in c.fetchall():
    print(f"  {r}")

# Check what secondary CNAE data exists
c.execute("SELECT COUNT(*) FROM estabelecimentos WHERE cnae_fiscal_secundaria IS NOT NULL AND cnae_fiscal_secundaria != '' LIMIT 1")
has_secondary = c.fetchone()[0]
print(f"\nTem cnae_fiscal_secundaria? {'SIM' if has_secondary else 'NAO'}")

# Sample companies in Paulinia to see their data
c.execute("""
    SELECT e.cnpj_basico, e.cnpj_ordem, e.cnpj_dv, 
           e.nome_fantasia, e.cnae_fiscal_principal,
           e.cnae_fiscal_secundaria,
           e.situacao_cadastral,
           e.uf, e.municipio
    FROM estabelecimentos e
    WHERE e.municipio = '6831' AND e.uf = 'SP'
    LIMIT 5
""")
print("\n=== AMOSTRA ESTABELECIMENTOS PAULINIA ===")
for r in c.fetchall():
    print(f"  {r}")

db.close()
