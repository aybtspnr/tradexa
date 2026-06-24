import re

with open("/opt/tradexa-intel-api/api_intel.py", "r") as f:
    content = f.read()

# Replace the check_recof function with one that normalizes names
old_func = '''def check_recof(c, razao_social, nome_fantasia):
    \"\"\"Check if a company is habilitated for RECOF (special customs regime).\"\"\"
    names_to_check = []
    if razao_social and razao_social != 'N/I':
        names_to_check.append(razao_social.upper())
    if nome_fantasia and nome_fantasia != 'N/I':
        names_to_check.append(nome_fantasia.upper())
    for name in names_to_check:
        c.execute("SELECT data_habilitacao FROM recof_empresas WHERE razao_social = ?", (name,))
        row = c.fetchone()
        if row:
            return row[0]
    return None'''

new_func = '''def check_recof(c, razao_social, nome_fantasia):
    \"\"\"Check if a company is habilitated for RECOF (special customs regime).\"\"\"
    import re as _re
    def _norm(n):
        if not n: return ''
        n = n.upper()
        for a,b in [('Á','A'),('À','A'),('Ã','A'),('Â','A'),('Ä','A'),
                    ('É','E'),('È','E'),('Ê','E'),('Ë','E'),
                    ('Í','I'),('Ì','I'),('Î','I'),('Ï','I'),
                    ('Ó','O'),('Ò','O'),('Õ','O'),('Ô','O'),('Ö','O'),
                    ('Ú','U'),('Ù','U'),('Û','U'),('Ü','U'),
                    ('Ç','C'),('Ñ','N')]:
            n = n.replace(a,b)
        return _re.sub(r'[^A-Z0-9\\s/]', '', n).strip()
    
    names_to_check = []
    if razao_social and razao_social != 'N/I':
        names_to_check.append(_norm(razao_social))
    if nome_fantasia and nome_fantasia != 'N/I':
        names_to_check.append(_norm(nome_fantasia))
    for name in names_to_check:
        c.execute("SELECT data_habilitacao FROM recof_empresas WHERE razao_social = ?", (name,))
        row = c.fetchone()
        if row:
            return row[0]
    return None'''

if old_func in content:
    content = content.replace(old_func, new_func)
    print("check_recof function updated with normalization")
else:
    print("WARNING: Could not find old check_recof function")
    # Show what's there
    idx = content.find("def check_recof")
    if idx >= 0:
        print(f"Found at position {idx}")
        print(content[idx:idx+500])

with open("/opt/tradexa-intel-api/api_intel.py", "w") as f:
    f.write(content)
print("File saved")

# Also update RECOF table to store normalized names
import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Add normalized_name column if not exists
c.execute("PRAGMA table_info(recof_empresas)")
cols = [r[1] for r in c.fetchall()]
if 'nome_normalizado' not in cols:
    c.execute("ALTER TABLE recof_empresas ADD COLUMN nome_normalizado TEXT")
    c.execute("UPDATE recof_empresas SET nome_normalizado = razao_social")
    db.commit()
    print("Added nome_normalizado column")

# Now normalize all names
c.execute("SELECT rowid, razao_social FROM recof_empresas")
for rowid, name in c.fetchall():
    if name:
        n = name.upper()
        for a,b in [('Á','A'),('À','A'),('Ã','A'),('Â','A'),('Ä','A'),
                    ('É','E'),('È','E'),('Ê','E'),('Ë','E'),
                    ('Í','I'),('Ì','I'),('Î','I'),('Ï','I'),
                    ('Ó','O'),('Ò','O'),('Õ','O'),('Ô','O'),('Ö','O'),
                    ('Ú','U'),('Ù','U'),('Û','U'),('Ü','U'),
                    ('Ç','C'),('Ñ','N')]:
            n = n.replace(a,b)
        n = re.sub(r'[^A-Z0-9\s/]', '', n).strip()
        c.execute("UPDATE recof_empresas SET nome_normalizado = ? WHERE rowid = ?", (n, rowid))

db.commit()
c.execute("SELECT nome_normalizado FROM recof_empresas WHERE nome_normalizado LIKE '%LYCRA%'")
for r in c.fetchall():
    print(f"Normalizado: {r[0]}")
db.close()
print("RECOF names normalized!")
