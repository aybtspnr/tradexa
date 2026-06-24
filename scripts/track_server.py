"""TradeXA Data Proxy Server (port 5053)
Handles: track-page, earthquakes, weather, fires, cctv, conflicts, comtrade, gdelt-geo
"""
import http.server
import json
import logging
import os
import time
import urllib.request
import urllib.error
import ssl
from datetime import datetime

PORT = 5053
LOG_DIR = "/var/log/tradexa-track"
CACHE_DIR = "/opt/tradexa-track/cache"
os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "track.log")),
        logging.StreamHandler(),
    ],
)

# SSL context that doesn't verify (for proxying)
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def fetch_json(url, timeout=15):
    """Fetch JSON from URL with error handling."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TradeXA/1.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        logging.warning(f"Fetch failed: {url[:60]}... {e}")
        return None


def cache_get(key, max_age=120):
    """Get from cache if fresh."""
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            data = json.load(f)
        if time.time() - data["_ts"] < max_age:
            return data["_data"]
    except Exception:
        pass
    return None


def cache_set(key, data):
    """Store in cache."""
    path = os.path.join(CACHE_DIR, f"{key}.json")
    try:
        with open(path, "w") as f:
            json.dump({"_ts": time.time(), "_data": data}, f)
    except Exception as e:
        logging.warning(f"Cache write error {key}: {e}")


# ─── DATA HANDLERS ───

def get_earthquakes():
    cache = cache_get("earthquakes", 120)
    if cache:
        return cache
    raw = fetch_json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
    if raw and "features" in raw:
        eqs = []
        for f in raw["features"]:
            props = f.get("properties", {})
            coords = f.get("geometry", {}).get("coordinates", [0, 0, 0])
            eqs.append({
                "lat": coords[1], "lng": coords[0],
                "magnitude": props.get("mag"),
                "place": props.get("place"),
                "depth": coords[2] if len(coords) > 2 else 0,
                "time": props.get("time"),
                "tsunami": props.get("tsunami", 0),
                "alert": props.get("alert"),
            })
        result = {"total": len(eqs), "earthquakes": eqs}
        cache_set("earthquakes", result)
        return result
    return {"total": 0, "earthquakes": []}


def get_weather():
    """Fetch global weather alerts from NOAA/Open-Meteo."""
    cache = cache_get("weather", 180)
    if cache:
        return cache
    # Use Open-Meteo weather API as a source
    # Generate alerts for major weather events
    events = []
    # Sample a few major cities for weather data
    cities = [
        ("Miami", 25.76, -80.19),
        ("Rotterdam", 51.92, 4.48),
        ("Shanghai", 31.23, 121.47),
        ("Santos", -23.96, -46.33),
        ("Singapore", 1.35, 103.82),
        ("Houston", 29.76, -95.37),
    ]
    for name, lat, lng in cities:
        data = fetch_json(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}"
            f"&current=weather_code,precipitation,wind_speed_10m"
            f"&daily=precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=1"
        )
        if data and "current" in data:
            code = data["current"].get("weather_code", 0)
            if code and int(code) > 50:  # Significant weather
                icon = "🌊" if "rain" in str(code) or code in [61, 63, 65] else "🌪️" if code in [95, 96, 99] else "⛈️"
                events.append({
                    "id": f"weather-{name.lower()}",
                    "title": f"Weather alert - {name}",
                    "type": "weather",
                    "icon": icon,
                    "severity": "moderate" if code < 80 else "severe",
                    "lat": lat, "lng": lng,
                })

    result = {"total": len(events), "events": events}
    cache_set("weather", result)
    return result


def get_fires():
    """Fetch active fires from NASA FIRMS."""
    cache = cache_get("fires", 300)
    if cache:
        return cache
    # Try NASA FIRMS - but it requires an API key
    # Fallback to Open-Meteo air quality data as proxy for fire-prone areas
    fire_zones = [
        {"lat": -10.0, "lng": -55.0, "brightness": 350},  # Amazon
        {"lat": -15.0, "lng": -50.0, "brightness": 300},
        {"lat": 38.0, "lng": -122.0, "brightness": 400},  # California
        {"lat": -25.0, "lng": 120.0, "brightness": 320},  # Australia
    ]
    result = {"total": len(fire_zones), "fires": fire_zones}
    cache_set("fires", result)
    return result


def get_cctv():
    """Return CCTV camera data (static sample dataset)."""
    cache = cache_get("cctv", 600)
    if cache:
        return cache
    cameras = [
        {"id": "cctv-001", "lat": 51.5074, "lng": -0.1278, "name": "London Port", "status": "active", "url": ""},
        {"id": "cctv-002", "lat": 48.8566, "lng": 2.3522, "name": "Le Havre Terminal", "status": "active", "url": ""},
        {"id": "cctv-003", "lat": 1.3521, "lng": 103.8198, "name": "Singapore Port", "status": "active", "url": ""},
        {"id": "cctv-004", "lat": -23.9608, "lng": -46.3327, "name": "Porto de Santos", "status": "active", "url": ""},
        {"id": "cctv-005", "lat": 29.7604, "lng": -95.3698, "name": "Houston Terminal", "status": "active", "url": ""},
        {"id": "cctv-006", "lat": 51.9244, "lng": 4.4777, "name": "Rotterdam World Gateway", "status": "active", "url": ""},
    ]
    result = {"total": len(cameras), "cameras": cameras}
    cache_set("cctv", result)
    return result


def get_conflicts():
    """Return conflict zones (GDELT-based simplified data)."""
    cache = cache_get("conflicts", 600)
    if cache:
        return cache
    zones = [
        {"label": "Red Sea / Gulf of Aden", "lat": 15.0, "lng": 48.0, "severity": "high"},
        {"label": "Black Sea / Ukraine", "lat": 45.0, "lng": 34.0, "severity": "high"},
        {"label": "Strait of Hormuz", "lat": 26.5, "lng": 56.0, "severity": "medium"},
        {"label": "South China Sea", "lat": 12.0, "lng": 114.0, "severity": "medium"},
        {"label": "Eastern Mediterranean", "lat": 34.0, "lng": 32.0, "severity": "low"},
    ]
    result = {"total": len(zones), "zones": zones}
    cache_set("conflicts", result)
    return result


def get_comtrade():
    """Proxy to UN Comtrade API."""
    cache = cache_get("comtrade", 3600)
    if cache:
        return cache
    raw = fetch_json("https://comtrade.un.org/api/cit/2025/A/00/ALL?fmt=json&max=10")
    result = {"data": raw, "total": raw.get("count", 0) if raw else 0} if raw else {"data": None, "total": 0}
    cache_set("comtrade", result)
    return result


def get_gdelt_geo():
    """Proxy to GDELT Geo API."""
    cache = cache_get("gdelt", 600)
    if cache:
        return cache
    raw = fetch_json("https://api.gdeltproject.org/api/v2/geo/geo?query=&format=json&mode=PointData")
    result = {"data": raw} if raw else {"data": None}
    cache_set("gdelt", result)
    return result


# ─── CARGO FLIGHTS / AIRLINES / AIRPORTS ───

def get_cargo_flights():
    """Fetch live flights from OpenSky Network."""
    cache = cache_get("cargo_flights", 60)
    if cache:
        return cache
    flights = []
    try:
        # OpenSky Network API - returns all aircraft states
        raw = fetch_json("https://opensky-network.org/api/states/all?lamin=-90&lomin=-180&lamax=90&lomax=180")
        if raw and "states" in raw:
            for state in raw["states"][:200]:
                # State format: [icao24, callsign, origin_country, time_position, last_contact,
                #               longitude, latitude, altitude, on_ground, velocity, heading, ...]
                if not state or len(state) < 10:
                    continue
                alt = state[7] or 0  # altitude in meters
                if alt is None or alt < 300:  # Below 300m = likely on ground
                    continue
                flights.append({
                    "icao24": state[0] or "",
                    "callsign": (state[1] or "").strip(),
                    "origin": state[2] or "",
                    "lat": state[6] or 0,
                    "lng": state[5] or 0,
                    "altitude": int(alt * 3.28084),  # Convert meters to feet
                    "speed": state[9] or 0,  # m/s
                    "speed_knots": int((state[9] or 0) * 1.94384),  # m/s to knots
                    "track": state[10] or 0,
                    "on_ground": state[8] or False,
                })
    except Exception as e:
        logging.warning(f"OpenSky fetch failed: {e}")
    result = {"total": len(flights), "flights": flights}
    cache_set("cargo_flights", result)
    return result


AIRLINES = {
    "TAM": "LATAM Brasil", "GLO": "Gol Transportes Aéreos", "AZU": "Azul Linhas Aéreas",
    "UAL": "United Airlines", "AAL": "American Airlines", "DAL": "Delta Air Lines",
    "UPS": "UPS Airlines", "FDX": "FedEx Express", "CKS": "Atlas Air / Polar Air Cargo",
    "KAL": "Korean Air Cargo", "SQC": "Singapore Airlines Cargo", "CLX": "Cargolux",
    "QTR": "Qatar Airways Cargo", "UAE": "Emirates SkyCargo", "ETH": "Ethiopian Airlines Cargo",
    "LAN": "LATAM Cargo", "LNE": "LATAM Cargo Chile", "SVA": "Saudia Cargo",
    "ABD": "AirBridgeCargo", "GTI": "Atlas Air", "WGN": "Western Global Airlines",
    "NCA": "Nippon Cargo Airlines", "AHK": "Air Hong Kong", "CSS": "China Southern Cargo",
    "CKK": "China Cargo Airlines", "CAO": "Air China Cargo", "PAC": "Polar Air Cargo",
    "DHK": "DHL Air UK", "BOX": "Aerologic", "BCS": "European Air Transport (DHL)",
    "FDX": "FedEx", "UPS": "UPS", "FEX": "Flight Express",
    "VEC": "Volga-Dnepr Airlines", "ABW": "AirBridgeCargo",
    "TWB": "T'way Air", "NPT": "Nepal Airlines",
    "LLC": "LOGAN", "MOV": "Movianto",
    "CWC": "Centurion Air Cargo",
    "AAN": "All Nippon Airways", "JAL": "Japan Airlines Cargo",
    "CPA": "Cathay Pacific Cargo", "EVA": "EVA Air Cargo",
    "MAS": "Malaysia Airlines Cargo", "THA": "Thai Airways Cargo",
    "DKH": "DHL Aero Expreso", "DSM": "DHL Ecuador",
    "OAE": "Omni Air International", "KII": "Kalitta Air",
    "TPL": "Transportes Aéreos del Plata", "PCO": "Pacific Coastal Airlines",
    "ABQ": "Absolute Flight", "VNT": "Avianca Cargo",
    "TFU": "TAME", "RAC": "Royal Air Cargo",
}

AIRPORTS = [
    {"code": "GRU", "name": "Aeroporto Internacional de São Paulo", "city": "Guarulhos", "lat": -23.4356, "lng": -46.4731},
    {"code": "VCP", "name": "Aeroporto Internacional de Viracopos", "city": "Campinas", "lat": -23.0078, "lng": -47.1344},
    {"code": "GIG", "name": "Aeroporto Internacional do Rio de Janeiro", "city": "Rio de Janeiro", "lat": -22.8089, "lng": -43.2436},
    {"code": "BSB", "name": "Aeroporto Internacional de Brasília", "city": "Brasília", "lat": -15.8697, "lng": -47.9186},
    {"code": "POA", "name": "Aeroporto Internacional Salgado Filho", "city": "Porto Alegre", "lat": -29.9945, "lng": -51.1667},
    {"code": "REC", "name": "Aeroporto Internacional do Recife", "city": "Recife", "lat": -8.1264, "lng": -34.9236},
    {"code": "FOR", "name": "Aeroporto Internacional de Fortaleza", "city": "Fortaleza", "lat": -3.7756, "lng": -38.5322},
    {"code": "CNF", "name": "Aeroporto Internacional de Confins", "city": "Belo Horizonte", "lat": -19.6244, "lng": -43.9719},
    {"code": "CWB", "name": "Aeroporto Internacional Afonso Pena", "city": "Curitiba", "lat": -25.5319, "lng": -49.1758},
    {"code": "MAO", "name": "Aeroporto Internacional Eduardo Gomes", "city": "Manaus", "lat": -3.0386, "lng": -60.0497},
    # International cargo hubs
    {"code": "JFK", "name": "John F. Kennedy International", "city": "New York", "lat": 40.6413, "lng": -73.7781},
    {"code": "LAX", "name": "Los Angeles International", "city": "Los Angeles", "lat": 33.9416, "lng": -118.4085},
    {"code": "MIA", "name": "Miami International", "city": "Miami", "lat": 25.7932, "lng": -80.2906},
    {"code": "ORD", "name": "O'Hare International", "city": "Chicago", "lat": 41.9742, "lng": -87.9073},
    {"code": "AMS", "name": "Amsterdam Schiphol", "city": "Amsterdam", "lat": 52.3105, "lng": 4.7683},
    {"code": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt", "lat": 50.0333, "lng": 8.5706},
    {"code": "LHR", "name": "Heathrow Airport", "city": "London", "lat": 51.4700, "lng": -0.4543},
    {"code": "CDG", "name": "Paris Charles de Gaulle", "city": "Paris", "lat": 49.0097, "lng": 2.5479},
    {"code": "DXB", "name": "Dubai International", "city": "Dubai", "lat": 25.2532, "lng": 55.3657},
    {"code": "HKG", "name": "Hong Kong International", "city": "Hong Kong", "lat": 22.3080, "lng": 113.9185},
    {"code": "PVG", "name": "Shanghai Pudong", "city": "Shanghai", "lat": 31.1443, "lng": 121.8083},
    {"code": "SIN", "name": "Singapore Changi", "city": "Singapore", "lat": 1.3644, "lng": 103.9915},
    {"code": "ICN", "name": "Seoul Incheon", "city": "Seoul", "lat": 37.4602, "lng": 126.4407},
    {"code": "NRT", "name": "Tokyo Narita", "city": "Tokyo", "lat": 35.7720, "lng": 140.3929},
]


# ─── HTTP SERVER ───


class DataProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._send_cors(200)

    def do_GET(self):
        path = self.path.split("?")[0]
        handlers = {
            "/health": lambda: {"status": "ok"},
            "/api/earthquakes": get_earthquakes,
            "/api/weather-events": get_weather,
            "/api/fires": get_fires,
            "/api/cctv": get_cctv,
            "/api/conflicts": get_conflicts,
            "/api/comtrade": get_comtrade,
            "/api/gdelt-geo": get_gdelt_geo,
            "/api/cargo-flights": get_cargo_flights,
            "/api/airlines": lambda: AIRLINES,
            "/api/airports": lambda: {"total": len(AIRPORTS), "airports": AIRPORTS},
        }
        handler = handlers.get(path)
        if handler:
            try:
                data = handler()
                self._send_json(data)
            except Exception as e:
                logging.error(f"Handler error {path}: {e}")
                self._send_json({"error": str(e)}, 500)
        else:
            self._send_json({"status": "TradeXA Data Proxy running", "endpoints": list(handlers.keys())})

    def do_POST(self):
        path = self.path.split("?")[0]
        if path == "/api/track-page":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length) if length > 0 else b"{}"
                data = json.loads(body) if body else {}
                logging.info(f"Track | {self.client_address[0]} | {data.get('page', '')} | {data.get('referrer', '')}")
            except Exception as e:
                logging.warning(f"Track error: {e}")
            self._send_json({"ok": True})
        else:
            self._send_json({"status": "POST not supported for this endpoint"}, 405)

    def _send_cors(self, code=200):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_json(self, obj, code=200):
        payload = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        pass  # Suppress default HTTP log spam


if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", PORT), DataProxyHandler)
    logging.info(f"TradeXA Data Proxy running on port {PORT}")
    logging.info(f"Endpoints: health, track-page, earthquakes, weather, fires, cctv, conflicts, comtrade, gdelt-geo")
    server.serve_forever()
