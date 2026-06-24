import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check country table schema
c.execute("SELECT sql FROM sqlite_master WHERE name='comex_paises'")
schema = c.fetchone()
print("PAISES schema:", schema[0] if schema else "NOT FOUND")

# Get the columns
c.execute("SELECT * FROM comex_paises LIMIT 2")
cols = [d[0] for d in c.description]
print(f"Columns: {cols}")
for r in c.fetchall():
    print(f"  {r}")

# Get NCM 54024400 country data
print("\n\nNCM 54024400 - export countries Feb 2026:")
c.execute("""
    SELECT CO_PAIS, SUM(KG_LIQUIDO), SUM(VL_FOB)
    FROM comex_exp_2026_ncm
    WHERE CO_NCM = '54024400'
      AND CO_MES = '02'
    GROUP BY CO_PAIS
    ORDER BY SUM(VL_FOB) DESC
""")
rows = c.fetchall()
if rows:
    for r in rows:
        # Look up country name
        c.execute("SELECT * FROM comex_paises WHERE ROWID=? OR ? IN (SELECT * FROM comex_paises)", (1, r[0]))
        # Just print raw for now
        print(f"  COD_PAIS={r[0]}: US$ {r[2]:,.2f} | {r[1]:.0f} kg")
else:
    print("No NCM-level data found")
    c.execute("SELECT COUNT(*) FROM comex_exp_2026_ncm")
    print(f"Total records: {c.fetchone()[0]}")

# Try alternative column name
c.execute("SELECT * FROM comex_paises LIMIT 1")
cols = [d[0] for d in c.description]
print(f"\nPaises columns: {cols}")
c.execute("SELECT * FROM comex_paises LIMIT 5")
for r in c.fetchall():
    print(f"  {r}")

db.close()
