"""Update RECOF companies list from Receita Federal website."""
import urllib.request
import sqlite3
import re
import json
import sys
from html.parser import HTMLParser

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.rows = []
        self.current_row = []
        self.current_cell = ""
        self.table_count = 0
    
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'table':
            self.in_table = True
            self.table_count += 1
        if self.in_table and tag == 'tr':
            self.in_tr = True
            self.current_row = []
        if self.in_tr and tag in ('td', 'th'):
            self.in_td = True
            self.current_cell = ""
    
    def handle_data(self, data):
        if self.in_td:
            self.current_cell += data.strip()
    
    def handle_endtag(self, tag):
        if self.in_td and tag in ('td', 'th'):
            self.in_td = False
            self.current_row.append(self.current_cell.strip())
        if self.in_tr and tag == 'tr':
            self.in_tr = False
            if len(self.current_row) >= 1:
                self.rows.append(self.current_row)
        if self.in_table and tag == 'table':
            self.in_table = False

def normalize(name):
    if not name: return ''
    name = name.upper()
    replacements = {
        'Á':'A','À':'A','Ã':'A','Â':'A','Ä':'A',
        'É':'E','È':'E','Ê':'E','Ë':'E',
        'Í':'I','Ì':'I','Î':'I','Ï':'I',
        'Ó':'O','Ò':'O','Õ':'O','Ô':'O','Ö':'O',
        'Ú':'U','Ù':'U','Û':'U','Ü':'U',
        'Ç':'C','Ñ':'N',
    }
    for a, b in replacements.items():
        name = name.replace(a, b)
    name = re.sub(r'[^A-Z0-9\s/]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

# Download RECOF page
url = "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/regimes-e-controles-especiais/regimes-aduaneiros-especiais/recof-sped/lista-de-empresas-habilitadas"
print(f"Baixando {url}...")
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=30)
    html = response.read().decode('utf-8', errors='replace')
    print(f"Baixado: {len(html)} bytes")
except Exception as e:
    print(f"Erro ao baixar: {e}")
    sys.exit(1)

# Parse
parser = TableParser()
parser.feed(html)

# Find the main table (should have Razão Social and Data)
companies = []
for row in parser.rows:
    if len(row) >= 2 and row[0] and not row[0].startswith('Razão') and not row[0].startswith('...'):
        companies.append((row[0].strip(), row[1].strip() if len(row) > 1 else ''))

print(f"Empresas encontradas: {len(companies)}")

# Store in database
DB_PATH = "/opt/tradexa-intel-api/tradexa_intel.db"
db = sqlite3.connect(DB_PATH)
c = db.cursor()

# Create table if needed
c.execute("""
    CREATE TABLE IF NOT EXISTS recof_empresas (
        razao_social TEXT PRIMARY KEY,
        data_habilitacao TEXT,
        nome_normalizado TEXT
    )
""")

# Clear and re-insert
c.execute("DELETE FROM recof_empresas")
inserted = 0
for name, date in companies:
    norm = normalize(name)
    try:
        c.execute(
            "INSERT INTO recof_empresas (razao_social, data_habilitacao, nome_normalizado) VALUES (?, ?, ?)",
            (name, date, norm)
        )
        inserted += 1
    except Exception as e:
        print(f"Erro ao inserir {name}: {e}")

db.commit()
db.close()
print(f"Atualizado: {inserted} empresas RECOF no banco")
