import sqlite3, sys

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check if the correct IBGE codes exist but with a different format
# The IBGE codes might be stored as integers vs strings
for code in [3536505, "3536505"]:
    c.execute("SELECT * FROM rf_municipios WHERE ibge_code = ?", (code,))
    r = c.fetchone()
    print(f"rf_municipios ibge_code={code!r}: {r}")

# Check comex_municipios for Paulinia with correct code
for code in [3536505, "3536505"]:
    c.execute("SELECT * FROM comex_municipios WHERE cod_mun = ?", (code,))
    r = c.fetchone()
    print(f"comex_municipios cod_mun={code!r}: {r}")

# Check what the exp_mun table has for Paulinia's cod_mun
c.execute("""
    SELECT CO_MUN, SG_UF_MUN, SUM(VL_FOB) as total_fob 
    FROM comex_exp_2026_mun 
    WHERE SH4='5402' AND SG_UF_MUN='SP' AND CO_MES='02'
    GROUP BY CO_MUN
    ORDER BY total_fob DESC
    LIMIT 5
""")
print("\nTop SP export cities in Feb/2026 (SH4 5402):")
for r in c.fetchall():
    # Look up city name
    c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (r[0],))
    name = c.fetchone()
    name_str = name[0] if name else "?"
    # Check if this cod_mun has rf mapping
    c.execute("SELECT rf_code FROM rf_municipios WHERE ibge_code=? AND uf='SP'", (int(r[0]),))
    rf = c.fetchone()
    rf_str = f"RF={rf[0]}" if rf else "SEM RF"
    print(f"  {r[0]} - {name_str}: FOB=${r[2]:,.2f} | {rf_str}")

print(f"\nNote: cod_mun uses prefix 34, should be 35 for SP")
print(f"This means ALL SP cities fail to match in rf_municipios!")

db.close()
