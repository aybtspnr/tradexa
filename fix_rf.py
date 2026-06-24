import sqlite3

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check if 3536505 (correct Paulinia) is in comex_municipios
c.execute("SELECT * FROM comex_municipios WHERE cod_mun=? AND uf=?", ("3536505", "SP"))
print("3536505 em comex_municipios:", c.fetchone())

# Check rf_municipios for 3536505
c.execute("SELECT * FROM rf_municipios WHERE ibge_code=3536505")
r = c.fetchone()
print("3536505 em rf_municipios:", r)

# If not found, check nearby IBGE codes in SP rf_municipios
c.execute("SELECT ibge_code FROM rf_municipios WHERE uf=? AND ibge_code BETWEEN 3536001 AND 3537000", ("SP",))
nearby = [r[0] for r in c.fetchall()]
print(f"\nIBGE codes SP entre 3536001-3537000: {len(nearby)}")
for code in nearby[:10]:
    print(f"  {code}")

# Alternative: add Paulinia directly using the correct RF code
# First, let me find what RF code Paulinia should have
# I can look for establishments with CNAE 13138 or 20401 in SP 
# and check which municipio RF code they use
# Then see if that RF code maps to any IBGE near Paulinia
c.execute("""
    SELECT e.municipio, COUNT(*) as cnt 
    FROM estabelecimentos e 
    WHERE e.cnae_fiscal_principal IN ('1313800', '2040100') 
      AND e.uf = 'SP' 
      AND e.municipio IS NOT NULL 
      AND e.municipio != ''
    GROUP BY e.municipio 
    ORDER BY cnt DESC
    LIMIT 10
""")
rows = c.fetchall()
print("\nTop RF codes SP com CNAEs texteis:")
for r in rows:
    rf = r[0]
    cnt = r[1]
    # Look up what IBGE this RF maps to
    c.execute("SELECT ibge_code, uf FROM rf_municipios WHERE rf_code=? AND uf='SP'", (rf,))
    ibge = c.fetchone()
    ibge_str = f"IBGE={ibge[0]}" if ibge else "SEM MAPEAMENTO"
    # Look up city name
    if ibge:
        c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (str(ibge[0]),))
        nome = c.fetchone()
        nome_str = nome[0] if nome else "?"
    else:
        nome_str = "?"
    print(f"  RF={rf}: {cnt} estab -> {ibge_str} ({nome_str})")

db.close()
