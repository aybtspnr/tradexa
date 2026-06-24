import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()
c.execute("PRAGMA table_info(comex_paises)")
print("comex_paises columns:")
for r in c.fetchall():
    print(f"  {r}")
c.execute("PRAGMA table_info(comex_pais_bloco)")
print("\ncomex_pais_bloco columns:")
for r in c.fetchall():
    print(f"  {r}")
db.close()
