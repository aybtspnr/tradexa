#!/usr/bin/env python3
"""
TradeMap Companies Bulk Downloader
Foco: Importadores + Exportadores do Brasil (57K x 2 = 114K)
Strategy: paralelização agressiva com threads + backoff + resumo
"""
import json, time, os, concurrent.futures, sys
from pathlib import Path
import requests

# ── Config ─────────────────────────────────────────────────────────
TOKEN   = os.environ.get("TM_TOKEN") or Path.home()/".hermes"/"cache"/"tm_token.txt"
TM      = "https://www.trademap.org/api/companies"
COUNTRY = "076"           # Brasil
OUT_DIR = Path("/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/data/trademap")
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Origin": "https://beta.trademap.org",
    "Referer": "https://beta.trademap.org/",
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

MAX_WORKERS = 25          # threads paralelas (TradeMap pode dar 429... testar)
PAGE_DELAY  = 0.05        # delay entre requisições por thread
BATCH_PAGES = 500         # checkpoint a cada N páginas

def num_pages(product, trade_flow):
    r = requests.get(TM, headers=HEADERS, params={
        "tradeFlow": trade_flow, "product": product, "productType": "p",
        "country": COUNTRY, "page": 1, "pageSize": 10,
    }, timeout=30)
    r.raise_for_status()
    data = r.json()
    return { "nbRecords": data["nbRecords"], "nbPages": data["nbPages"] }

def fetch_page(product, trade_flow, page):
    """Fetch a single page; returns list of records or raises."""
    r = requests.get(TM, headers=HEADERS, params={
        "tradeFlow": trade_flow, "product": product, "productType": "p",
        "country": COUNTRY, "page": page, "pageSize": 10,
    }, timeout=30)
    r.raise_for_status()
    data = r.json()
    recs = data.get("records", [])
    for rec in recs:
        rec["_source"] = {"country": COUNTRY, "flow": trade_flow, "product": product, "page": page}
        rec["_downloaded_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return recs

def save_jsonl(path, records):
    with open(path, "a", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

def work(product, trade_flow, start_page, end_page, out_path):
    """Worker that downloads pages [start_page, end_page]."""
    count, errors = 0, 0
    for page in range(start_page, end_page + 1):
        try:
            recs = fetch_page(product, trade_flow, page)
            if recs:
                save_jsonl(out_path, recs)
                count += len(recs)
        except Exception as e:
            errors += 1
            print(f"ERR page {page}: {e}", file=sys.stderr)
            time.sleep(0.5)
        if page % 100 == 0:
            print(f"  Worker {trade_flow}: page {page}/{end_page} — {count} saved", flush=True)
        time.sleep(PAGE_DELAY)
    return count, errors

def download_single(product, trade_flow):
    prefix = f"BRA_{trade_flow}_{product}"
    print(f"\n==== {prefix} ====")
    info = num_pages(product, trade_flow)
    total_rec, total_page = info["nbRecords"], info["nbPages"]
    print(f"  Total records: {total_rec}  →  {total_page} páginas")
    if total_page == 0:
        return 0

    out_file = OUT_DIR / f"{prefix}_raw.jsonl"
    out_file.parent.mkdir(parents=True, exist_ok=True)
    if out_file.exists():
        print(f"  Resume detectado: {out_file.stat().st_size} bytes")

    # Quebrar em batches para checkpoint
    total_batches = (total_page + BATCH_PAGES - 1) // BATCH_PAGES
    for batch in range(total_batches):
        start = batch * BATCH_PAGES + 1
        end   = min((batch + 1) * BATCH_PAGES, total_page)
        print(f"  Batch {batch + 1}/{total_batches}: pages {start}..{end}")

        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
            futures = {}
            step = max(1, (end - start + 1) // MAX_WORKERS)
            for i in range(MAX_WORKERS):
                s = start + i * step
                e = min(start + (i + 1) * step - 1, end)
                if s > e: continue
                future = ex.submit(work, product, trade_flow, s, e, out_file)
                futures[future] = (s, e)

            for future in concurrent.futures.as_completed(futures):
                s, e = futures[future]
                try:
                    cnt, err = future.result()
                    print(f"  → pages {s}-{e}: {cnt} saved, errors={err}")
                except Exception as e:
                    print(f"  → pages {s}-{e}: FAILED {e}", file=sys.stderr)

    total = 0
    if out_file.exists():
        with open(out_file) as f:
            for _ in f: total += 1
    print(f"  {prefix} FINAL: {total} registros em {out_file}")
    return total

def main():
    print("=" * 60)
    print("TradeMap Companies Downloader — Brasil (I + E)")
    print("=" * 60)
    t0 = time.time()

    grand_total = 0
    for flow, label in [("I", "Importadores"), ("E", "Exportadores")]:
        grand_total += download_single("ALL", flow)

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"CONCLUÍDO: {grand_total} registros em {elapsed/60:.1f} minutos")
    print(f"Arquivos em: {OUT_DIR}")

if __name__ == "__main__":
    main()
