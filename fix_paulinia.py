import sqlite3

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# 1. Check if 3536505 (correct IBGE for Paulinia/SP) exists in rf_municipios
c.execute("SELECT rf_code, ibge_code, uf FROM rf_municipios WHERE ibge_code=3536505")
r = c.fetchone()
print("3536505 em rf_municipios:", r)

# 2. Check what IBGE codes the export data actually uses for Paulinia
c.execute("SELECT DISTINCT CO_MUN FROM comex_exp_2026_mun WHERE SH4='5402' AND SG_UF_MUN='SP'")
mun_codes = [r[0] for r in c.fetchall()]
print(f"\nIBGE codes de SP em export SH4 5402:")
for code in mun_codes:
    c.execute("SELECT nome_mun FROM comex_municipios WHERE cod_mun=? AND uf='SP'", (code,))
    name = c.fetchone()
    name_str = name[0] if name else "?"
    print(f"  {code} - {name_str}")
    # Check if in rf_municipios
    c.execute("SELECT rf_code FROM rf_municipios WHERE ibge_code=?", (int(code),))
    rf = c.fetchone()
    if rf:
        print(f"    -> RF code: {rf[0]} ✅")
    else:
        print(f"    -> RF code: NAO ENCONTRADO ❌")

# 3. Count how many IBGE codes are wrong (have state prefix that doesn't match UF)
c.execute("SELECT cod_mun, nome_mun, uf FROM comex_municipios WHERE uf='SP' AND cod_mun NOT LIKE '35%'")
wrong = c.fetchall()
print(f"\nCódigos IBGE incorretos para SP em comex_municipios: {len(wrong)}")
for r in wrong[:10]:
    print(f"  {r[0]} - {r[1]} (deveria comecar com 35)")

db.close()
