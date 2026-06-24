import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Use the composite index idx_estab_cnae_uf to find Paulinia's RF code
# Query: establishments in SP with CNAE 1313800 (fiacao fibras artificiais)
c.execute("""
    SELECT e.municipio, e.nome_fantasia, e.cnpj_basico
    FROM estabelecimentos e
    WHERE e.cnae_fiscal_principal = '1313800'
      AND e.uf = 'SP'
      AND e.municipio IS NOT NULL
      AND e.municipio != ''
    LIMIT 20
""")
rows = c.fetchall()
print(f"Found {len(rows)} establishments in SP with CNAE 1313800")
seen_rf = {}
for r in rows:
    rf = r[0]
    name = r[2]
    if rf not in seen_rf:
        seen_rf[rf] = name
        # Look up this RF code in rf_municipios
        c.execute("SELECT ibge_code FROM rf_municipios WHERE rf_code=? AND uf='SP'", (rf,))
        ibge = c.fetchone()
        ibge_str = str(ibge[0]) if ibge else "NO_MAP"
        # Look up city name
        c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (ibge_str,))
        nome = c.fetchone()
        nome_str = nome[0] if nome else "?"
        print(f"  RF={rf} -> IBGE={ibge_str} -> {nome_str}")

db.close()
