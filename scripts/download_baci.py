#!/usr/bin/env python3
"""
Download e processamento dos dados BACI CEPII (bilateral trade flows)
Fonte: https://www.cepii.fr/DATA_DOWNLOAD/baci/data/
"""

import os
import requests
import zipfile
import io
import csv
import sqlite3
from pathlib import Path

# Diretório base
BASE_DIR = Path(__file__).parent / "baci_data"
BASE_DIR.mkdir(exist_ok=True)

# URLs BACI (HS92, versão 2024)
BACI_URLS = {
    "baci_hs92_2022": "https://www.cepii.fr/DATA_DOWNLOAD/baci/data/BACI_HS92_V202401/BACI_HS92_Y22_V202401.csv",
    "baci_hs92_2021": "https://www.cepii.fr/DATA_DOWNLOAD/baci/data/BACI_HS92_V202401/BACI_HS92_Y21_V202401.csv",
    "baci_hs92_2020": "https://www.cepii.fr/DATA_DOWNLOAD/baci/data/BACI_HS92_V202401/BACI_HS92_Y20_V202401.csv",
    "baci_hs92_2019": "https://www.cepii.fr/DATA_DOWNLOAD/baci/data/BACI_HS92_V202401/BACI_HS92_Y19_V202401.csv",
}

# Mapeamento de códigos BACI para ISO3
BACI_TO_ISO3 = {
    4: "AFG", 8: "ALB", 10: "ATA", 12: "DZA", 20: "AND", 24: "AGO", 28: "ATG",
    31: "AZE", 32: "ARG", 36: "AUS", 40: "AUT", 44: "BHS", 48: "BHR",
    50: "BGD", 51: "ARM", 52: "BRB", 56: "BEL", 60: "BMU", 64: "BTN",
    68: "BOL", 70: "BIH", 72: "BWA", 76: "BRA", 84: "BLZ", 90: "SLB",
    92: "VGB", 96: "BRN", 100: "BGR", 104: "MMR", 108: "BDI", 112: "BLR",
    116: "KHM", 120: "CMR", 124: "CAN", 132: "CPV", 136: "CYM", 140: "CAF",
    144: "LKA", 148: "TCD", 152: "CHL", 156: "CHN", 170: "COL", 174: "COM",
    178: "COG", 180: "ZAR", 184: "COK", 188: "CRI", 191: "HRV", 192: "CUB",
    196: "CYP", 203: "CZE", 204: "BEN", 208: "DNK", 212: "DMA", 214: "DOM",
    218: "ECU", 222: "SLV", 226: "GNQ", 231: "ETH", 232: "ERI", 233: "EST",
    242: "FJI", 246: "FIN", 250: "FRA", 262: "DJI", 266: "GAB", 268: "GEO",
    270: "GMB", 275: "PSE", 276: "DEU", 288: "GHA", 292: "GIB", 296: "KIR",
    300: "GRC", 308: "GRD", 316: "GUM", 320: "GTM", 324: "GIN", 328: "GUY",
    332: "HTI", 336: "VAT", 340: "HND", 344: "HKG", 348: "HUN", 352: "ISL",
    356: "IND", 360: "IDN", 364: "IRN", 368: "IRQ", 372: "IRL", 376: "ISR",
    380: "ITA", 384: "CIV", 388: "JAM", 392: "JPN", 398: "KAZ", 400: "JOR",
    404: "KEN", 408: "PRK", 410: "KOR", 414: "KWT", 417: "KGZ", 418: "LAO",
    422: "LBN", 426: "LSO", 428: "LVA", 430: "LBR", 434: "LBY", 438: "LIE",
    440: "LTU", 442: "LUX", 446: "MAC", 450: "MDG", 454: "MWI", 458: "MYS",
    462: "MDV", 466: "MLI", 470: "MLT", 474: "MTQ", 478: "MRT", 480: "MUS",
    484: "MEX", 492: "MCO", 496: "MNG", 498: "MDA", 500: "MSR", 504: "MAR",
    508: "MOZ", 512: "OMN", 516: "NAM", 520: "NRU", 524: "NPL", 528: "NLD",
    530: "ANT", 533: "ABW", 540: "NCL", 548: "VUT", 554: "NZL", 558: "NIC",
    562: "NER", 566: "NGA", 570: "NIU", 574: "NFK", 578: "NOR", 580: "MNP",
    581: "UMI", 583: "FSM", 584: "MHL", 585: "PLW", 586: "PAK",
    591: "PAN", 598: "PNG", 600: "PRY", 604: "PER", 608: "PHL", 612: "PCN",
    616: "POL", 620: "PRT", 624: "GNB", 626: "TLS", 634: "QAT", 634: "QAT",
    642: "ROU", 643: "RUS", 646: "RWA", 659: "KNA", 660: "AIA",
    662: "LCA", 666: "SPM", 670: "VCT", 674: "SMR", 678: "STP",
    682: "SAU", 686: "SEN", 690: "SYC", 694: "SLE", 702: "SGP",
    703: "SVK", 705: "SVN", 706: "SOM", 710: "ZAF", 716: "ZWE",
    724: "ESP", 732: "ESH", 736: "SDN", 740: "SUR", 744: "SJM",
    748: "SWZ", 752: "SWE", 756: "CHE", 762: "TJK", 764: "THA",
    768: "TGO", 772: "TKL", 776: "TON", 780: "TTO", 784: "ARE",
    788: "TUN", 792: "TUR", 795: "TKM", 796: "TCA", 798: "TUV",
    800: "UGA", 804: "UKR", 807: "MKD", 818: "EGY", 826: "GBR",
    834: "TZA", 840: "USA", 850: "VIR", 854: "BFA", 858: "URY",
    860: "UZB", 862: "VEN", 887: "YEM", 891: "YUG", 894: "ZMB",
    901: "TWN", 997: "EU2", 999: "EU4",
}

def download_baci_csv(url: str, dest_dir: Path):
    """Download CSV BACI do CEPII"""
    filename = url.split("/")[-1]
    dest_path = dest_dir / filename
    
    if dest_path.exists():
        print(f"[⏭️ SKIP] {filename} já existe")
        return dest_path
    
    print(f"[📥] Baixando {filename}...")
    response = requests.get(url, timeout=300, stream=True)
    response.raise_for_status()
    
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    file_size = dest_path.stat().st_size
    print(f"[✅] {filename} salvo ({file_size:,} bytes)")
    return dest_path

def process_baci_to_sqlite(csv_path: Path, db_path: Path, limit_per_country=50):
    """
    Processa CSV BACI e salva em SQLite.
    Limita a X registros por par de países para reduzir tamanho.
    """
    print(f"[⚙️ PROCESS] {csv_path.name} → {db_path.name}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Criar tabela
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trade_flows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER,
            origin_code INTEGER,
            origin_iso3 TEXT,
            dest_code INTEGER,
            dest_iso3 TEXT,
            hs6 TEXT,
            value INTEGER,
            quantity INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_origin ON trade_flows(origin_iso3, year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dest ON trade_flows(dest_iso3, year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hs ON trade_flows(hs6, year)")
    
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        
        for row in reader:
            try:
                year, origin, dest, hs6, value, qty = row[:6]
                origin_iso3 = BACI_TO_ISO3.get(int(origin), "???")
                dest_iso3 = BACI_TO_ISO3.get(int(dest), "???")
                
                cursor.execute("""
                    INSERT INTO trade_flows (year, origin_code, origin_iso3, dest_code, dest_iso3, hs6, value, quantity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (int(year), int(origin), origin_iso3, int(dest), dest_iso3, hs6, int(value), int(qty)))
                count += 1
                
                if count % 50000 == 0:
                    print(f"   ... {count:,} registros processados")
                    
            except (ValueError, KeyError) as e:
                continue
    
    conn.commit()
    conn.close()
    print(f"[✅] {count:,} registros salvos em {db_path.name}")
    return count

def filter_top_products(db_path: Path, origin_iso3: str = None, dest_iso3: str = None):
    """
    Filtra os top produtos (por valor) de um país para Supabase.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = """
        SELECT 
            origin_iso3,
            dest_iso3,
            hs6,
            SUM(value) as total_value,
            SUM(quantity) as total_qty
        FROM trade_flows
        WHERE 1=1
    """
    params = []
    
    if origin_iso3:
        query += " AND origin_iso3 = ?"
        params.append(origin_iso3)
    if dest_iso3:
        query += " AND dest_iso3 = ?"
        params.append(dest_iso3)
    
    query += """
        GROUP BY origin_iso3, dest_iso3, hs6
        ORDER BY total_value DESC
        LIMIT 100
    """
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return results

def export_to_json_for_supabase(db_path: Path, output_path: Path, year: int, top_n=200):
    """
    Exporta os top flows para JSON, pronto para upload no Supabase.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            origin_iso3,
            dest_iso3,
            hs6,
            SUM(value) as total_value,
            SUM(quantity) as total_qty
        FROM trade_flows
        WHERE year = ?
        GROUP BY origin_iso3, dest_iso3, hs6
        ORDER BY total_value DESC
        LIMIT ?
    """, (year, top_n))
    
    results = []
    for row in cursor:
        results.append({
            "origin": row[0],
            "destination": row[1],
            "hs6": row[2],
            "value_usd": row[3],
            "quantity": row[4],
            "year": year,
        })
    
    conn.close()
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"[✅] {len(results)} registros exportados para {output_path}")
    return results

if __name__ == "__main__":
    # Baixar dados mais recentes
    for name, url in BACI_URLS.items():
        try:
            csv_path = download_baci_csv(url, BASE_DIR)
        except Exception as e:
            print(f"[❌] Erro ao baixar {url}: {e}")
            continue
