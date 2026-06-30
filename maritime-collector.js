/**
 * TradeXA Maritime Collector — AISstream WebSocket → HTTP API
 * 
 * Connects to aisstream.io via WebSocket, filters for cargo vessels,
 * and serves ship positions via a lightweight HTTP API on port 5052.
 * 
 * API Key: 43bd3751678e20ce23d6047d12fc10785623444f
 */

const http = require('http');
const PORT = 5052;

// ─── AISstream configuration ───
const AISSTREAM_KEY = process.env.AISSTREAM_KEY || '43bd3751678e20ce23d6047d12fc10785623444f';
const WS_URL = 'wss://stream.aisstream.io/v0/stream';

// ─── In-memory state ───
let ships = [];
let shipMap = new Map(); // mmsi → ship (for deduplication)
let lastUpdated = new Date().toISOString();

// ─── Bounding box filter (global, pre-filter on server side via subscription) ───
const BBOX = [[-90, -180], [90, 180]]; // whole world

// ─── AIS Connection (requires Node 18+ with built-in WebSocket) ───
let ws = null;
let reconnectTimer = null;
let reconnectDelay = 1000;

function connectAIS() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  console.log(`[maritime] Connecting to AISstream...`);

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[maritime] AISstream WebSocket connected');
      reconnectDelay = 1000;

      // Subscribe to all ship position messages
      const subscriptionMsg = {
        APIKey: AISSTREAM_KEY,
        BoundingBoxes: [BBOX],
        FiltersShipMMSI: [],
        FilterMessageTypes: ['PositionReport']
      };

      ws.send(JSON.stringify(subscriptionMsg));
      console.log('[maritime] Subscribed to PositionReports (global)');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // AISstream sends wrapped messages
        const meta = msg.MetaData || msg.MetaData;
        const positionReport = msg.Message?.PositionReport;

        if (!positionReport || !meta) return;

        const mmsi = meta.MMSI;
        const shipType = positionReport.ShipType;
        const lat = positionReport.Latitude;
        const lon = positionReport.Longitude;
        const sog = positionReport.Sog; // Speed over ground (knots)
        const heading = positionReport.TrueHeading;
        const shipName = (meta.ShipName || '').trim();

        // Skip invalid positions (0,0)
        if (!lat || !lon || (lat === 0 && lon === 0)) return;

        // Filter: only cargo vessels (shipType 70-79)
        if (shipType !== undefined && (shipType < 70 || shipType >= 80)) return;

        shipMap.set(mmsi, {
          mmsi,
          name: shipName || `Vessel ${mmsi}`,
          lat,
          lng: lon,
          heading: heading || 0,
          speed: sog || 0,
          shipType: shipType || 0,
          updatedAt: new Date().toISOString()
        });

      } catch (err) {
        // Silently skip malformed messages
      }
    };

    ws.onclose = (event) => {
      console.log(`[maritime] WebSocket closed (code=${event.code}). Reconnecting in ${reconnectDelay}ms...`);
      ws = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectAIS, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000); // exponential backoff, max 30s
    };

    ws.onerror = (err) => {
      console.error('[maritime] WebSocket error:', err.message || err);
      if (ws) ws.close();
    };

  } catch (err) {
    console.error('[maritime] Failed to create WebSocket:', err.message);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectAIS, Math.min(reconnectDelay * 2, 30000));
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  }
}

// ─── Periodic cleanup ───
// Convert shipMap to array (capped at 5000 ships, sorted by most recent)
function refreshShipArray() {
  const now = Date.now();
  const arr = [];

  for (const [mmsi, ship] of shipMap) {
    const updatedAt = new Date(ship.updatedAt).getTime();
    // Remove ships older than 15 minutes (likely out of range)
    if (now - updatedAt > 15 * 60 * 1000) {
      shipMap.delete(mmsi);
      continue;
    }
    arr.push(ship);
  }

  // Sort by most recently updated
  arr.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Cap at 5000 to keep payload reasonable
  ships = arr.slice(0, 5000);
  lastUpdated = new Date().toISOString();
}

// Run cleanup every 10 seconds
setInterval(refreshShipArray, 10000);

// ─── HTTP Server ───
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/ships' || req.url === '/ships') {
    res.end(JSON.stringify({
      ships,
      total: ships.length,
      updatedAt: lastUpdated
    }));
  } else if (req.url === '/health' || req.url === '/') {
    res.end(JSON.stringify({
      status: 'ok',
      ships: ships.length,
      updatedAt: lastUpdated,
      aisConnected: ws?.readyState === WebSocket.OPEN
    }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[maritime] HTTP collector running on port ${PORT}`);
  // Start AIS connection
  connectAIS();
});
