#!/usr/bin/env python3
"""Importa todos os arquivos .xls (HTML com tabelas) para o Supabase.
Usa apenas bibliotecas padrão — sem dependências externas.
"""

import os, re, json, time, sys, urllib.request, urllib.error
from pathlib import Path

SUPABASE_URL = "https://ocivkbocmywinwqmaqac.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jaXZrYm9jbXl3aW53cW1hcWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1OTM3NSwiZXhwIjoyMDkxMzM1Mzc1fQ.tTXhlhOWwZElMd200j4vHtjFyRWi1ujnkcLlqg7_WI8"

DOWNLOADS = Path("/mnt/c/Users/Nuh TAŞPINAR/Downloads")
BATCH_SIZE = 500

def supabase_insert(table: str, records: list[dict]):
    """Insere registros via Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal, resolution=merge-duplicates",
    }
    data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body
    except Exception as e:
        return 0, str(e)

def extract_records(content: str, hs_chapter: str, category: str) -> list[dict]:
    tr_pattern = re.compile(r'<tr[^>]*align="right"[^>]*>(.*?)</tr>', re.DOTALL)
    td_pattern = re.compile(r'<td[^>]*>([^<]*(?:<[^>]*>[^<]*</[^>]*>)?[^<]*)</td>', re.DOTALL)
    
    records = []
    seen = set()
    
    for tr in tr_pattern.findall(content):
        tds = td_pattern.findall(tr)
        tds = [re.sub(r'<[^>]+>', '', td).strip().strip('"').strip() for td in tds]
        
        if len(tds) != 6:
            continue
        
        name, products, employees, turnover, country, city = tds
        if not name or name == 'Company name':
            continue
        
        name = name.strip()
        country = country.strip()
        city = city.strip()
        
        key = f"{name.lower()}|{country.lower()}|{city.lower()}"
        if key in seen:
            continue
        seen.add(key)
        
        try:
            products_count = int(products) if products.strip() else None
        except:
            products_count = None
        
        try:
            employees_count = int(employees) if employees.strip() else None
        except:
            employees_count = None
        
        records.append({
            "company_name": name,
            "hs_chapter": hs_chapter,
            "category": category,
            "products_count": products_count,
            "employees": employees_count,
            "country": country,
            "city": city,
            "source": "tradexa_intelligence",
        })
    
    return records

def main():
    folders = sorted(DOWNLOADS.iterdir())
    total_inserted = 0
    total_skipped = 0
    total_errors = 0
    
    for folder in folders:
        if not folder.is_dir():
            continue
        
        hs_chapter = folder.name.zfill(2)
        xls_files = sorted(folder.glob("*.xls"))
        
        if not xls_files:
            continue
        
        print(f"\n📁 HS {hs_chapter} ({len(xls_files)} arquivo(s)):")
        
        folder_records = []
        for file in xls_files:
            content = file.read_text(encoding='utf-8', errors='replace')
            m = re.search(r'Product category\s*:\s*([^<]+)', content)
            category = m.group(1).strip() if m else file.stem
            
            records = extract_records(content, hs_chapter, category)
            folder_records.extend(records)
            print(f"   📄 {file.name}: {len(records):,} registros")
        
        # Deduplica
        seen = set()
        deduped = []
        for r in folder_records:
            key = f"{r['company_name'].lower()}|{r['country'].lower()}|{r['city'].lower()}"
            if key not in seen:
                seen.add(key)
                deduped.append(r)
        
        skipped = len(folder_records) - len(deduped)
        total_skipped += skipped
        
        # Insere em batch
        inserted = 0
        errors = 0
        for i in range(0, len(deduped), BATCH_SIZE):
            batch = deduped[i:i+BATCH_SIZE]
            status, err_body = supabase_insert("importers", batch)
            
            if status in (200, 201):
                inserted += len(batch)
            else:
                errors += len(batch)
                print(f"   ⚠️ Erro batch {i}: HTTP {status} — {err_body[:100] if err_body else 'unknown'}")
            
            time.sleep(0.3)  # rate limit
        
        total_inserted += inserted
        total_errors += errors
        print(f"   ✅ Inserido: {inserted:,} | Removidos: {skipped:,} | Erros: {errors}")
    
    print(f"\n🏁 TOTAL: {total_inserted:,} empresas importadas")
    print(f"🏁 Duplicados removidos: {total_skipped:,}")
    print(f"🏁 Erros: {total_errors:,}")

if __name__ == "__main__":
    main()
