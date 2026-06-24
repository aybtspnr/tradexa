import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Try RF code 6831 for Paulinia (IBGE 3536505)
# This is in the gap between 6829 (3536406) and 6833 (3536604)
print("Checking RF code 6831...")
c.execute("SELECT * FROM rf_municipios WHERE rf_code='6831' AND uf='SP'")
r = c.fetchone()
if r:
    print(f"  Already exists: {r}")
else:
    print("  Does not exist - inserting as Paulinia")
    # Insert with CORRECT IBGE (3536505) for the corrected API query
    c.execute("INSERT INTO rf_municipios (rf_code, uf, ibge_code, nome) VALUES (?, 'SP', ?, ?)",
              ('6831', 3536505, 'PAULINIA'))
    db.commit()
    print("  Inserted successfully!")

# Also check what other missing RF codes we found might correspond to
# Let's find their IBGE neighbors
unknown_rfs = ['6131', '6175', '6217', '6251', '6493', '7145']
for rf in unknown_rfs:
    c.execute("SELECT rf_code, ibge_code, nome FROM rf_municipios WHERE uf='SP' ORDER BY CAST(rf_code AS INTEGER)")
    all_sp = c.fetchall()
    # Find neighbors
    rf_int = int(rf)
    before = None
    after = None
    for r in all_sp:
        r_int = int(r[0])
        if r_int < rf_int:
            before = r
        elif r_int > rf_int and after is None:
            after = r
            break
    ibge_guess = None
    if before and after:
        ibge_before = int(before[1])
        ibge_after = int(after[1])
        gap = ibge_after - ibge_before
        rf_gap = int(after[0]) - int(before[0])
        if rf_gap > 0:
            steps = rf_int - int(before[0])
            ibge_guess = ibge_before + (gap // rf_gap) * steps
    
    print(f"\nRF {rf}:")
    if before:
        print(f"  Before: RF={before[0]} -> IBGE={before[1]} ({before[2]})")
    if after:
        print(f"  After: RF={after[0]} -> IBGE={after[1]} ({after[2]})")
    if ibge_guess:
        c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (str(ibge_guess),))
        nome = c.fetchone()
        nome_str = nome[0] if nome else "?"
        print(f"  -> Guessing IBGE={ibge_guess} ({nome_str})")

db.close()
