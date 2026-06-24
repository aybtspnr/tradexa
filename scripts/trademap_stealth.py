#!/usr/bin/env python3
"""
TradeMap Single-Thread Stealth Downloader
Baixa em modo sequencial lento para evitar 403 do Cloudflare.
Checkoint a cada 50 páginas.
"""
import json, time, os, sys
from pathlib import Path
import requests

TOKEN  = os.environ.get("TM_TOKEN","").strip()
TM     = "https://www.trademap.org/api/companies"
COUNTRY= "076"
OUT    = Path("/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/data/trademap/BRA_I_stealth.jsonl")
CKPT   = Path("/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/data/trademap/stealth_checkpoint.json")
HEADERS= {
    "Authorization": f"Bearer {TOKEN}",
    "Origin": "https://beta.trademap.org",
    "Referer": "https://beta.trademap.org/",
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/147.0.0.0",
}

def load_ckpt():
    if CKPT.exists():
        with open(CKPT) as f: return json.load(f)
    return {"page":0,"saved":0}

def save_ckpt(c):
    with open(CKPT,"w") as f: json.dump(c,f)

def fetch(page):
    for attempt in range(5):
        try:
            r = requests.get(TM, headers=HEADERS, timeout=20, params={
                "tradeFlow":"I","product":"ALL","productType":"p",
                "country":COUNTRY,"page":page,"pageSize":10,
                "sortBy":"companyName","sortDir":"asc"
            })
            if r.status_code == 200:
                return r.json()
            if r.status_code == 403:
                wait = 2 ** attempt
                print(f"  403 page {page}, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  {r.status_code} page {page}: {r.text[:120]}")
                time.sleep(1)
        except Exception as e:
            print(f"  ERR page {page}: {e}")
            time.sleep(2)
    return None

def main(max_pages=None):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    ckpt = load_ckpt()
    start_page = ckpt["page"] + 1
    if OUT.exists():
        print(f"Resuming from page {start_page}. File: {OUT.stat().st_size/1024:.0f}KB")
    else:
        print(f"Starting fresh. Output: {OUT}")

    # Primeira chamada para saber total
    info = fetch(1)
    if not info:
        print("Token expirado ou API bloqueada.")
        sys.exit(1)
    total_pages = info.get("nbPages", 19035)
    print(f"Total pages: {total_pages} | Starting from page {start_page}")

    t0 = time.time()
    with open(OUT, "a") as fh:
        for page in range(start_page, total_pages + 1):
            data = fetch(page)
            if not data: continue
            recs = data.get("records", [])
            if not recs:
                print(f"Empty page {page}. Done?")
                break
            for rec in recs:
                rec["_page"] = page
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            ckpt["page"] = page
            ckpt["saved"] += len(recs)
            save_ckpt(ckpt)
            elapsed = time.time() - t0
            rate = ckpt["saved"] / elapsed if elapsed > 0 else 0
            print(f"Page {page}/{total_pages} | Saved: {ckpt['saved']} | Rate: {rate:.1f} rec/s | Elapsed: {elapsed/60:.1f}min")
            if max_pages and page >= max_pages:
                print("Max pages reached.")
                break
            time.sleep(0.4)

    print(f"Done! {ckpt['saved']} registros em {OUT}")

if __name__ == "__main__":
    main(max_pages=1500)   # primeiras 1500 páginas = ~4500 registros demo
