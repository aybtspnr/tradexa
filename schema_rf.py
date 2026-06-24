import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()
c.execute("SELECT sql FROM sqlite_master WHERE name='rf_municipios'")
print("rf_municipios schema:", c.fetchone()[0])
db.close()
