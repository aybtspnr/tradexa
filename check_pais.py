import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()
c.execute("SELECT * FROM comex_paises LIMIT 3")
cols = [d[0] for d in c.description]
print("Paises columns:", cols)
for r in c.fetchall():
    print(f"  {r}")

# Also check imp_pais
c.execute("SELECT * FROM comex_imp_pais LIMIT 3")
cols = [d[0] for d in c.description]
print("\nImp_pais columns:", cols)
for r in c.fetchall():
    print(f"  {r}")

c.execute("SELECT * FROM comex_pais_bloco LIMIT 3")
cols = [d[0] for d in c.description]
print("\nPais_bloco columns:", cols)
for r in c.fetchall():
    print(f"  {r}")
db.close()
