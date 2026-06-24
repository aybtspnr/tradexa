import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# The RF code for Paulinia should be findable from establishments
# Use a more targeted query with the index on municipio
c.execute("""
    SELECT e.municipio, e.cnae_fiscal_principal, COUNT(*) as cnt
    FROM estabelecimentos e 
    WHERE e.cnae_fiscal_principal IN ('1313800','2040100','1330800','1351100','4689302')
      AND e.uf = 'SP'
    GROUP BY e.municipio
    ORDER BY cnt DESC
    LIMIT 30
""")
rows = c.fetchall()
print("RF codes SP com CNAEs texteis:")
for r in rows:
    rf = r[0]
    c.execute("SELECT nome FROM rf_municipios WHERE rf_code=? AND uf='SP'", (rf,))
    nome = c.fetchone()
    nome_str = nome[0] if nome else "?"
    c.execute("SELECT ibge_code FROM rf_municipios WHERE rf_code=? AND uf='SP'", (rf,))
    ibge = c.fetchone()
    ibge_str = str(ibge[0]) if ibge else "NO MAP"
    print(f"  RF={rf} -> IBGE={ibge_str} -> {nome_str} ({r[2]} estab)")

# Also check which SP cities from export data are NOW matching
c.execute("""
    SELECT DISTINCT e.CO_MUN, e.SG_UF_MUN
    FROM comex_exp_2026_mun e
    WHERE e.SH4='5402' AND e.CO_MES='02' AND e.SG_UF_MUN='SP'
""")
sp_cities = c.fetchall()
print(f"\nSP cities exportando SH4 5402: {len(sp_cities)}")
matched = 0
for code, uf in sp_cities:
    # Check with 35 prefix
    correct = int("35" + code[2:])
    c.execute("SELECT rf_code FROM rf_municipios WHERE ibge_code=? AND uf='SP'", (correct,))
    if c.fetchone():
        matched += 1
print(f"Destas, {matched} tem mapeamento RF com IBGE 35xxxxx")
print(f"{len(sp_cities) - matched} ainda sem mapeamento (incluindo Paulinia)")

db.close()
