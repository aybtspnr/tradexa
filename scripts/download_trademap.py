#!/usr/bin/env python3
"""
Download TradeMap companies API → JSON + insert into Supabase
Rate: ~1.4 req/s, 3 records/page. Saves checkpoint for resume.
"""

import json, time, requests, concurrent.futures, os
from pathlib import Path

TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlhNUzlTZ1FsdjBBUXFIN1VBMWRkRHciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE3NzgwODYwMTAsImV4cCI6MTc3ODA4NzgxMCwiaXNzIjoiaHR0cHM6Ly9pZHNlcnYubWFya2V0YW5hbHlzaXMuaW50cmFjZW4ub3JnIiwiYXVkIjoiVHJhZGVNYXAuQVBJIiwiY2xpZW50X2lkIjoiVHJhZGVNYXBfdjMiLCJzdWIiOiJkMDhjMzI3Ni1kMjZkLTRhMDEtYmU5NC0yNWI1M2NlYTAyMzAiLCJhdXRoX3RpbWUiOjE3NzgwODIzNjUsImlkcCI6ImxvY2FsIiwidXNlcl9pZCI6IjI0MjEyNTciLCJwcm9qZWN0IjoiMSIsImxpY2Vuc2UiOiI5IiwiaXNfZGV2ZWxvcGluZyI6IlRydWUiLCJwbGFuIjoiUHJvLUdyb3VwIGJhc2ljIiwidmFsaWRpdHkiOiIwNi8wNS8yMDI2IDE3OjQ2OjA2IiwicHJvamVjdC11c2FnZS1kb21haW5zIjoiMSIsInByb2plY3QtdXNhZ2UtdXNlcnMiOiIyMCIsImFkZC1vbnMiOiJjb21wYW55LGFuYWx5c2lzIiwiYWNjZXNzIjoiZnVsbCIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJUcmFkZU1hcC5BUEkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.FIj1fhcvOqA-fm1hAafOHetNA4zydDVLZg8fRCL2T68a1kNDWosLU9yB5PqAc-CbVIPmoWNlWaGxkrPtbcZ3yWYgFLcs4QjugPHEHoHQOet7VBkDL-CtGn9Q2vhUM7b29GSF7vvBbZ-3XKVDH7yhAqz9xL9q_hxWnDvT1gwDFBP68L3pfvZnrKSs85uSeXXmc7DDh6vzqh9a-PHI7ulMK077OQq8q4lDHjIY8mjEXs1tRwD02FD0qTXsSSTKRMWnAa7-Y2quSt-u793DawRRL4mH_DfHSVLOcYYFLlM2Ihk0-7vsrPR6h4T6h-7YI9m1bGmaJPCbWtSbXJMgxhHzzA"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Origin": "https://beta.trademap.org", "Referer": "https://beta.trademap.org/"}
BASE = "https://www.trademap.org/api/companies"
OUT = Path("/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/trademap_data.jsonl")
CKPT = Path("/mnt/d/dyad/TRADEXA-MARKET-INTELLIGENCE/trademap_checkpoint.json")

COUNTRY = "076"       # Brazil
COUNTRY_ISO = "BRA"
PRODUCT = "ALL"
TRADE_FLOW = "I"
MAX_PAGE = 19035      # all pages
CONCURRENCY = 12
BATCH_SIZE = 100      # pages per batch

def fetch_page(page_num, retries=3):
    """Fetch a single page with retry."""
    for attempt in range(retries):
        try:
            r = requests.get(BASE, headers=HEADERS, timeout=20, params={
                "tradeFlow": TRADE_FLOW, "product": PRODUCT, "productType": "p",
                "country": COUNTRY, "page": page_num, "pageSize": 10,
                "sortBy": "companyName", "sortDir": "asc"
            })
            if r.status_code == 200:
                return r.json()
            if r.status_code in {401, 403}:
                print(f"  [PAGE {page_num}] AUTH ERROR {r.status_code}")
                return None
            time.sleep(0.5 * (attempt + 1))
        except Exception as e:
            time.sleep(0.5 * (attempt + 1))
    print(f"  [PAGE {page_num}] FAILED after {retries} retries")
    return None

def load_checkpoint():
    if CKPT.exists():
        with open(CKPT) as f:
            return json.load(f)
    return {"last_page": 0, "total_companies": 0, "errors": 0}

def save_checkpoint(ckpt):
    with open(CKPT, "w") as f:
        json.dump(ckpt, f)

def main():
    ckpt = load_checkpoint()
    last_page = ckpt["last_page"]
    total_companies = ckpt["total_companies"]
    errors = ckpt["errors"]

    print(f"TradeMap downloader — starting from page {last_page + 1}/{MAX_PAGE}")
    print(f"Token expires at 17:46. Concurrent workers: {CONCURRENCY}")

    start_time = time.time()

    with open(OUT, "a" if last_page > 0 else "w") as f_out:
        while last_page < MAX_PAGE:
            batch_start = last_page + 1
            batch_end = min(last_page + BATCH_SIZE, MAX_PAGE)
            pages = list(range(batch_start, batch_end + 1))

            print(f"Batch {batch_start}-{batch_end} ({len(pages)} pages)...", end=" ", flush=True)

            batch_start_time = time.time()
            results = []
            with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
                future_to_page = {ex.submit(fetch_page, p): p for p in pages}
                for future in concurrent.futures.as_completed(future_to_page):
                    page = future_to_page[future]
                    try:
                        data = future.result()
                        if data and "records" in data:
                            records = data["records"]
                            results.append((page, records))
                        else:
                            errors += 1
                            print(f"  [ERR page {page}] bad response: {data}")
                    except Exception as e:
                        errors += 1
                        print(f"  [ERR page {page}] {e}")

            # Sort by page order before writing
            results.sort(key=lambda x: x[0])
            for page, records in results:
                for rec in records:
                    rec["_page"] = page
                    rec["_fetched_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    f_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    total_companies += 1

            last_page = batch_end
            el = time.time() - batch_start_time
            print(f"done in {el:.1f}s | total={total_companies} | errors={errors}")

            ckpt = {"last_page": last_page, "total_companies": total_companies, "errors": errors}
            save_checkpoint(ckpt)

            # Print rate every 10 batches
            elapsed = time.time() - start_time
            rate = total_companies / elapsed
            est_remaining = (19035 - last_page) * el / len(pages)
            print(f"  Rate: {rate:.1f} comp/s | Elapsed: {elapsed/60:.1f}min | Est remaining: {est_remaining/60:.1f}min")

    print(f"\nFinished! Total companies: {total_companies} | Errors: {errors}")

if __name__ == "__main__":
    main()
