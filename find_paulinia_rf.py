import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Find Paulinia's RF code by searching for known companies there
# Look for companies with specific names that might be in Paulinia
for name_pattern in ['REPSOL', 'RHODIA', 'PAULIN', 'EXXONMOBIL']:
    c.execute("SELECT e.municipio, e.nome_fantasia, e.uf, e.cnae_fiscal_principal FROM estabelecimentos e WHERE e.nome_fantasia LIKE ? AND e.uf='SP' LIMIT 5",
              ('%' + name_pattern + '%',))
    rows = c.fetchall()
    if rows:
        for r in rows:
            # Check if this RF code has mapping
            c.execute("SELECT ibge_code FROM rf_municipios WHERE rf_code=? AND uf='SP'", (r[0],))
            ibge = c.fetchone()
            ibge_str = f"IBGE={ibge[0]}" if ibge else f"NOT IN rf_municipios"
            c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (str(ibge[0]) if ibge else '0',))
            nome = c.fetchone()
            nome_str = f"({nome[0]})" if nome else ''
            print(f"  {name_pattern}: RF={r[0]}, nome={r[1]}, {ibge_str} {nome_str}")

db.close()
