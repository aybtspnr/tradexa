import sqlite3, sys

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Show all tables
c.execute("SELECT name FROM sqlite_master WHERE type=? ORDER BY name", ("table",))
print("Tabelas:")
for t in c.fetchall():
    print(" ", t[0])

# Get all SP entries in rf_municipios
c.execute("SELECT rf_code, ibge_code FROM rf_municipios WHERE uf=? ORDER BY ibge_code", ("SP",))
sp = c.fetchall()
print(f"\nSP em rf_municipios: {len(sp)}")

# Find the max rf_code for SP
max_rf = max(int(r[0]) for r in sp) if sp else 0
min_ibge = min(int(r[1]) for r in sp) if sp else 0
max_ibge = max(int(r[1]) for r in sp) if sp else 0
print(f"RF range: 1-{max_rf}")
print(f"IBGE range: {min_ibge}-{max_ibge}")

# Check where Paulinia (3436505) falls in the IBGE range
print(f"\nPaulinia IBGE: 3436505 (SP)")
print(f"Esta no range IBGE de SP? {min_ibge <= 3436505 <= max_ibge}")

# Check if any SP municipality in rf_municipios has IBGE near 3436505
nearby = [r for r in sp if str(r[1]).startswith("3436")]
print(f"Municipios SP 3436xxx: {len(nearby)}")
for r in nearby[:5]:
    print(f"  RF={r[0]} -> IBGE={r[1]}")

# Check the estabelecimentos table indices
c.execute("SELECT name FROM sqlite_master WHERE type=? AND tbl_name=?", ("index", "estabelecimentos"))
indices = [r[0] for r in c.fetchall()]
print(f"\nIndices em estabelecimentos: {len(indices)}")
for idx in indices:
    print(f"  {idx}")

db.close()
