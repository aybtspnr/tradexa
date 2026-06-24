import sqlite3

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check indices on estabelecimentos
c.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='estabelecimentos'")
indices = [r[0] for r in c.fetchall()]
print(f"Indices em estabelecimentos ({len(indices)}):")
for idx in indices[:10]:
    print(f"  {idx}")

# Try to find Paulinia's RF code using a targeted query
# Use the cidade_nome table which maps RF codes to city names
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%cidade%' OR name LIKE '%municipio%'")
tables = [r[0] for r in c.fetchall()]
print(f"\nTabelas de cidade/municipio: {tables}")

db.close()
