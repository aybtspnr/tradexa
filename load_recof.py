import sqlite3, json

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Create RECOF table
c.execute("""
    CREATE TABLE IF NOT EXISTS recof_empresas (
        razao_social TEXT PRIMARY KEY,
        data_habilitacao TEXT
    )
""")

# Load data
with open("/tmp/recof_empresas.json") as f:
    empresas = json.load(f)

# Insert
inserted = 0
for name, date in empresas:
    try:
        c.execute("INSERT OR REPLACE INTO recof_empresas (razao_social, data_habilitacao) VALUES (?, ?)", 
                  (name.upper(), date))
        inserted += 1
    except:
        pass

db.commit()
print(f"RECOF: {inserted} empresas inseridas")
c.execute("SELECT COUNT(*) FROM recof_empresas")
print(f"Total na tabela: {c.fetchone()[0]}")

db.close()
