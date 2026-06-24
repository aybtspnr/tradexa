import sqlite3, sys

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Get all SP cities from comex_municipios with 34xxxxx codes
c.execute("SELECT cod_mun, nome_mun FROM comex_municipios WHERE uf='SP' AND cod_mun LIKE '34%'")
wrong_cities = c.fetchall()
print(f"Cidades SP com codigo 34xxxxx: {len(wrong_cities)}")

fixed = 0
not_found = 0
inserted = 0
already_exists = 0

for wrong_code, nome in wrong_cities:
    # Calculate correct code (34xxxxx -> 35xxxxx)
    correct_code = int("35" + wrong_code[2:])
    
    # Check if correct_code exists in rf_municipios
    c.execute("SELECT rf_code FROM rf_municipios WHERE ibge_code=? AND uf='SP'", (correct_code,))
    r = c.fetchone()
    
    if r:
        rf_code = r[0]
        fixed += 1
        # Check if wrong_code mapping already exists
        c.execute("SELECT rf_code FROM rf_municipios WHERE ibge_code=? AND uf='SP'", (int(wrong_code),))
        existing = c.fetchone()
        if existing:
            already_exists += 1
        else:
            # Insert the missing mapping
            c.execute("INSERT INTO rf_municipios (rf_code, uf, ibge_code, nome) VALUES (?, 'SP', ?, ?)",
                      (rf_code, int(wrong_code), nome))
            inserted += 1
    else:
        not_found += 1

db.commit()
print(f"\nResultados:")
print(f"  Corrigidos (adicionados): {inserted}")
print(f"  Ja existiam: {already_exists}")
print(f"  Nao encontrados (35xxxxx ausente em rf_municipios): {not_found}")
print(f"  Total processados: {len(wrong_cities)}")

# Count total SP entries now
c.execute("SELECT COUNT(*) FROM rf_municipios WHERE uf='SP'")
total_sp = c.fetchone()[0]
print(f"\nTotal SP em rf_municipios apos correcao: {total_sp}")

db.close()
