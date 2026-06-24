import sqlite3

db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check rf_municipios for SP
c.execute('SELECT rf_code, ibge_code FROM rf_municipios WHERE uf = ? ORDER BY ibge_code', ('SP',))
all_sp = c.fetchall()
print('Total SP em rf_municipios:', len(all_sp))

# Check if any SP municipality near Paulinia (3436505) exists
nearby = [r for r in all_sp if str(r[1]).startswith('3436')]
print('Proximos a 3436505:')
for r in nearby:
    print(f'  RF={r[0]} -> IBGE={r[1]}')

# Check comex_municipios for Paulinia
c.execute('SELECT cod_mun, nome_mun FROM comex_municipios WHERE uf=? AND nome_mun LIKE ?', ('SP', '%PAULIN%'))
for r in c.fetchall():
    print(f'Em comex_municipios: {r[0]} - {r[1]}')
    c.execute('SELECT rf_code FROM rf_municipios WHERE ibge_code = ?', (int(r[0]),))
    rf = c.fetchone()
    if rf:
        print(f'  -> RF code: {rf[0]} (ENCONTRADO)')
    else:
        print(f'  -> RF code: NAO ENCONTRADO!')

# Now check the estabelecimentos table for Paulinia
# First check what tables have NCM-level data
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%ncm%' ORDER BY name")
ncm_tables = [r[0] for r in c.fetchall()]
print('Tabelas NCM:', ncm_tables[:5])

# Check one ncm table structure
if ncm_tables:
    c.execute(f'SELECT * FROM {ncm_tables[0]} LIMIT 1')
    cols = [desc[0] for desc in c.description]
    print(f'{ncm_tables[0]} colunas: {cols}')

db.close()
