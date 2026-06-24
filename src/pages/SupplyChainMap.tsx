"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CameraViewer } from "./CameraViewer";

// ── Types ──
export interface SelectedFeature {
  type: string;
  data: any;
}

interface Camera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city: string;
  country: string;
  feed_url?: string;
  stream_url?: string;
  stream_type?: "jpg" | "hls" | "iframe";
  external_url?: string;
  source: string;
  type?: string;
}

interface Props {
  ports: any[];
  airports: any[];
  chokepoints: any[];
  cargoFlights: any[];
  ships: any[];
  activeLayers: Set<string>;
  onFeatureClick: (feature: SelectedFeature) => void;
}

// ── Map style (light) ──
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// ── Popup styles ──
const POPUP_STYLE = "font-family:monospace;font-size:10px;color:#1a1a2e;background:#fff;border-radius:8px;padding:10px;min-width:200px;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.15);";

export const SupplyChainMap = forwardRef<any, Props>(function SupplyChainMap({ ports, airports, chokepoints, cargoFlights, ships, activeLayers, onFeatureClick }, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const iconsLoaded = useRef(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const mapReadyRef = useRef(false);
  const pendingData = useRef<Record<string, any[]>>({});

  // ── Additional data state ──
  const [activeCamera, setActiveCamera] = useState<any>(null);
  const [activeLiveNews, setActiveLiveNews] = useState<{url:string;name:string}|null>(null);
  const [isGlobe, setIsGlobe] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // ── Expose flyTo to parent ──
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom = 10) => {
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1500, essential: true });
    },
    flyToPreset: (center: [number, number], zoom: number, pitch?: number, bearing?: number) => {
      mapRef.current?.flyTo({ center, zoom, pitch: pitch ?? 0, bearing: bearing ?? 0, duration: 1500, essential: true });
    },
    getMap: () => mapRef.current,
  }), []);

  // ── Map initialization ──
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-50, -15],
      zoom: 3,
      minZoom: 1.5,
      maxZoom: 18,
      maxPitch: 85,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // Set map ref immediately so layer effects can queue data
    mapRef.current = map;

    map.on("load", () => {
      // === Custom-drawn circle icons (all 5 types, no emoji) ===
      const colors: Record<string, string> = { port: '#D80E16', airport: '#3b82f6', chokepoint: '#f59e0b', cargo: '#D80E16', ship: '#0891b2' };

      function drawIcon(key: string) {
        const c = document.createElement('canvas');
        c.width = 36; c.height = 36;
        const ctx = c.getContext('2d')!;
        const cx = 18, cy = 18, r = 15;

        // Colored circle background
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[key] || '#888';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // White drawing params
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (key === 'port') {
          // ⚓ Anchor
          ctx.beginPath();
          ctx.moveTo(cx, 8); ctx.lineTo(cx, 23);
          ctx.moveTo(cx - 5, 22); ctx.lineTo(cx + 5, 22);
          ctx.moveTo(cx - 5, 12); ctx.lineTo(cx + 5, 12);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, 6, 2.2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx-2, 26); ctx.lineTo(cx, 28); ctx.lineTo(cx+2, 26); ctx.fill();
        } else if (key === 'airport') {
          // 🏢 Building/tower
          ctx.fillRect(cx-4, cy-6, 8, 14);
          ctx.fillRect(cx-6, cy-5, 12, 3);
          ctx.fillRect(cx-6, cy+1, 12, 2);
          ctx.fillRect(cx-6, cy+5, 4, 3);
          ctx.fillRect(cx+2, cy+5, 4, 3);
          ctx.strokeRect(cx-4, cy-6, 8, 14);
          ctx.strokeRect(cx-6, cy-5, 12, 3);
        } else if (key === 'ship') {
          // 🚢 Ship
          ctx.beginPath();
          ctx.moveTo(cx-9, cy+5); ctx.lineTo(cx-6, cy-3); ctx.lineTo(cx+6, cy-3); ctx.lineTo(cx+9, cy+5); ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx-3, cy-3); ctx.lineTo(cx-3, cy-9);
          ctx.moveTo(cx+3, cy-3); ctx.lineTo(cx+3, cy-8);
          ctx.moveTo(cx-4, cy-9); ctx.lineTo(cx+4, cy-8);
          ctx.stroke();
          ctx.fillRect(cx-3, cy-10, 6, 3);
        } else if (key === 'cargo') {
          // ✈ Cargo plane
          ctx.beginPath();
          ctx.moveTo(cx, cy-6); ctx.lineTo(cx, cy+5);
          ctx.moveTo(cx-8, cy-1); ctx.quadraticCurveTo(cx, cy-4, cx+8, cy-1);
          ctx.moveTo(cx, cy-6); ctx.lineTo(cx+4, cy-3); ctx.lineTo(cx, cy-1);
          ctx.stroke();
          ctx.fillRect(cx-4, cy+3, 8, 5);
          ctx.strokeStyle = colors[key]; ctx.lineWidth = 1; ctx.strokeRect(cx-4, cy+3, 8, 5);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8;
        } else if (key === 'chokepoint') {
          // ⚠ Warning triangle
          ctx.beginPath();
          ctx.moveTo(cx, cy-7); ctx.lineTo(cx-7, cy+6); ctx.lineTo(cx+7, cy+6); ctx.closePath();
          ctx.fill();
          ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = colors[key]; ctx.fillText('!', cx, cy+1);
        }

        if (!map.hasImage(`${key}-icon`)) {
          map.addImage(`${key}-icon`, { width: 36, height: 36, data: new Uint8Array(ctx.getImageData(0, 0, 36, 36).data) });
        }
      }

      Object.keys(colors).forEach(drawIcon);
      iconsLoaded.current = true;

      // ── Setup globe projection ──
      try {
        (map as any).setProjection({ type: 'globe' });
        (map as any).setSky({
          'sky-color': '#04040A',
          'sky-horizon-blend': 0.5,
          'horizon-color': '#0a0a1a',
          'horizon-fog-blend': 0.3,
          'fog-color': '#04040A',
          'fog-ground-blend': 0.9,
        });
        map.easeTo({ pitch: 20, duration: 1200 });
      } catch (e) { console.warn('Globe projection not supported'); }

      // ── Initialize GeoJSON sources for additional data layers ──
      const sources = ['cctv', 'earthquakes', 'weather-events', 'fires', 'conflicts'];
      sources.forEach(s => {
        if (!map.getSource(s)) map.addSource(s, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      });

      // Mark map as ready so data fetching can begin
      mapReadyRef.current = true;
      setMapReady(true);

      // ── CCTV layer ──
      map.addLayer({ id: 'cctv-glow', type: 'circle', source: 'cctv', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,5, 5,8, 10,14],
        'circle-color': '#39FF14', 'circle-opacity': 0.08, 'circle-blur': 1,
      }});
      map.addLayer({ id: 'cctv-dots', type: 'circle', source: 'cctv', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,3, 5,5, 10,8],
        'circle-color': '#39FF14', 'circle-opacity': 0.8,
        'circle-stroke-width': 2, 'circle-stroke-color': '#39FF14', 'circle-stroke-opacity': 0.5,
      }});

      // ── Earthquakes layer ──
      map.addLayer({ id: 'eq-circles', type: 'circle', source: 'earthquakes', paint: {
        'circle-radius': ['interpolate',['linear'],['get','magnitude'], 2.5,4, 5,12, 7,24],
        'circle-color': ['interpolate',['linear'],['get','magnitude'], 2.5,'#FFD700', 4,'#FF9500', 6,'#FF1744'],
        'circle-opacity': 0.5, 'circle-blur': 0.3,
        'circle-stroke-width': 1, 'circle-stroke-color': '#FFD700', 'circle-stroke-opacity': 0.3,
      }});

      // ── Weather events ──
      map.addLayer({ id: 'weather-glow', type: 'circle', source: 'weather-events', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,8, 5,14, 10,22],
        'circle-color': '#E040FB', 'circle-opacity': 0.1, 'circle-blur': 1,
      }});
      map.addLayer({ id: 'weather-dots', type: 'circle', source: 'weather-events', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,4, 5,7, 10,11],
        'circle-color': ['match', ['get','icon'], 'cyclone','#E040FB', 'volcano','#FF1744', '#E040FB'],
        'circle-opacity': 0.75,
        'circle-stroke-width': 2, 'circle-stroke-color': '#E040FB', 'circle-stroke-opacity': 0.3,
      }});

      // ── Fires layer ──
      map.addLayer({ id: 'fires-heat', type: 'circle', source: 'fires', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,2, 5,4, 10,7],
        'circle-color': '#FF6B00', 'circle-opacity': 0.4, 'circle-blur': 0.5,
      }});

      // ── Conflicts layer ──
      map.addLayer({ id: 'conflict-dots', type: 'circle', source: 'conflicts', paint: {
        'circle-radius': ['interpolate',['linear'],['zoom'], 1,5, 5,9, 10,14],
        'circle-color': ['match', ['get','severity'], 'war','#FF1744', 'high','#FF9500', 'elevated','#FFD700', '#888'],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2, 'circle-stroke-color': '#fff', 'circle-stroke-opacity': 0.4,
      }});

      // ── Click handlers for new layers ──
      map.on('click', 'cctv-dots', (e: any) => {
        const p = e.features?.[0]?.properties;
        const coords = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && coords) {
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 13), duration: 1000 });
          setActiveCamera(p);
        }
      });

      map.on('click', 'eq-circles', (e: any) => {
        const p = e.features?.[0]?.properties;
        const coords = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && coords) {
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 6), duration: 1000 });
          new maplibregl.Popup({ offset: [0, -10], closeButton: true, maxWidth: '320px' })
            .setLngLat(coords)
            .setHTML(`<div style="${POPUP_STYLE}border:1px solid rgba(255,149,0,0.3);">
              <div style="color:#FF9500;font-size:14px;font-weight:700;margin-bottom:4px;">M${p.magnitude} EARTHQUAKE</div>
              <div style="font-size:9px;color:#E8E6E0;margin-bottom:8px;">${p.place||'Unknown'}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9px;">
                <div><span style="color:#666;">DEPTH</span><br/>${p.depth||'—'}km</div>
                <div><span style="color:#666;">ALERT</span><br/>${p.alert||'none'}</div>
              </div>
              ${p.tsunami ? '<div style="color:#FF1744;font-weight:700;margin-top:4px;">TSUNAMI WARNING</div>' : ''}
            </div>`)
            .addTo(map);
        }
      });

      map.on('click', 'weather-dots', (e: any) => {
        const p = e.features?.[0]?.properties;
        const coords = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && coords) {
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 5), duration: 1000 });
          new maplibregl.Popup({ offset: [0, -10], closeButton: true, maxWidth: '320px' })
            .setLngLat(coords)
            .setHTML(`<div style="${POPUP_STYLE}border:1px solid rgba(224,64,251,0.3);">
              <div style="color:#E040FB;font-size:14px;font-weight:700;margin-bottom:6px;">${p.type||'Event'}${p.icon==='cyclone'?' (Ciclone)':p.icon==='volcano'?' (Vulcao)':''}</div>
              <div style="font-size:10px;color:#E8E6E0;margin-bottom:8px;">${p.title||'Unknown'}</div>
              <div style="font-size:9px;color:#666;">Severity: <span style="color:${p.severity==='high'?'#FF1744':'#FFD700'};">${(p.severity||'low').toUpperCase()}</span></div>
            </div>`)
            .addTo(map);
        }
      });

      map.on('click', 'conflict-dots', (e: any) => {
        const p = e.features?.[0]?.properties;
        const coords = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && coords) {
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 5), duration: 1000 });
          const color = p.severity === 'war' ? '#FF1744' : p.severity === 'high' ? '#FF9500' : '#FFD700';
          new maplibregl.Popup({ offset: [0, -10], closeButton: true, maxWidth: '320px' })
            .setLngLat(coords)
            .setHTML(`<div style="${POPUP_STYLE}border:1px solid ${color}40;">
              <div style="color:${color};font-size:14px;font-weight:700;margin-bottom:6px;">${p.label}</div>
              <div style="font-size:10px;color:#E8E6E0;">Severity: <span style="color:${color};font-weight:700;">${(p.severity||'unknown').toUpperCase()}</span></div>
            </div>`)
            .addTo(map);
        }
      });

      // ── Hover effects for clickables ──
      ['cctv-dots','eq-circles','weather-dots','fires-heat','conflict-dots'].forEach(layer => {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      });

      mapRef.current = map;
    });

    // ── Keyboard shortcuts ──
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'g' && !e.ctrlKey && mapRef.current) {
        const proj = isGlobe ? 'mercator' : 'globe';
        setIsGlobe(!isGlobe);
        try {
          (mapRef.current as any).setProjection({ type: proj });
          if (proj === 'globe') {
            mapRef.current!.easeTo({ pitch: 20, duration: 800 });
            (mapRef.current as any).setSky({
              'sky-color': '#04040A', 'sky-horizon-blend': 0.5,
              'horizon-color': '#0a0a1a', 'horizon-fog-blend': 0.3,
              'fog-color': '#04040A', 'fog-ground-blend': 0.9,
            });
          } else {
            mapRef.current!.easeTo({ pitch: 0, duration: 800 });
          }
        } catch (e2) { console.warn('Projection switch failed', e2); }
      }
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      map.remove();
      mapRef.current = null;
      iconsLoaded.current = false;
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  // ── Helper: upsert GeoJSON layer ──
  const setGeo = useCallback((sourceId: string, features: any[]) => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'FeatureCollection', features });
    } else {
      // Queue data for when map loads
      pendingData.current[sourceId] = features;
    }
  }, []);

  // ── Flush pending data when map becomes ready ──
  useEffect(() => {
    if (!mapReadyRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    for (const [sourceId, features] of Object.entries(pendingData.current)) {
      const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (src && features.length > 0) {
        src.setData({ type: 'FeatureCollection', features });
      }
    }
    pendingData.current = {};
  }, [mapReady]); // flush when map becomes ready

  // ── Fetch & render new data layers ──
  useEffect(() => {
    // Fetch earthquakes
    fetch('/api/earthquakes').then(r => r.json()).then(d => {
      const features = (d.earthquakes || []).map((eq: any) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [eq.lng, eq.lat] },
        properties: { magnitude: eq.magnitude, place: eq.place, depth: eq.depth, tsunami: eq.tsunami, alert: eq.alert },
      }));
      setGeo('earthquakes', features);
    }).catch(() => {});

    // Fetch weather events
    fetch('/api/weather-events').then(r => r.json()).then(d => {
      const features = (d.events || []).map((w: any) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [w.lng, w.lat] },
        properties: { title: w.title, type: w.type, icon: w.icon, severity: w.severity, id: w.id },
      }));
      setGeo('weather-events', features);
    }).catch(() => {});

    // Fetch fires
    fetch('/api/fires').then(r => r.json()).then(d => {
      const features = (d.fires || []).map((f: any) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
        properties: { brightness: f.brightness },
      }));
      setGeo('fires', features);
    }).catch(() => {});

    // Fetch conflicts
    fetch('/api/conflicts').then(r => r.json()).then(d => {
      const features = (d.zones || []).map((z: any) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [z.lng, z.lat] },
        properties: { label: z.label, severity: z.severity },
      }));
      setGeo('conflicts', features);
    }).catch(() => {});

    // Fetch CCTV cameras
    fetch('/api/cctv').then(r => r.json()).then(d => {
      const features = (d.cameras || []).map((c: Camera) => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { ...c, type: 'cctv' },
      }));
      setGeo('cctv', features);
    }).catch(() => {});
  }, [setGeo]);

  // ── Ports layer (clustered) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const sourceId = "ports-source";
    if (!ports.length) return;

    const features = ports.map((p: any) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { name: p.name, country: p.country, index: p.index, type: 'port' },
    }));

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });
      return;
    }

    map.addSource(sourceId, {
      type: 'geojson', data: { type: 'FeatureCollection', features: [] },
      cluster: true, clusterMaxZoom: 11, clusterRadius: 45,
    });
    map.addLayer({
      id: 'ports-cluster', type: 'circle', source: sourceId, filter: ['has', 'point_count'],
      paint: { 'circle-color': '#D80E16', 'circle-radius': ['step', ['get', 'point_count'], 14, 10, 20, 50, 26, 200, 32], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
    });
    map.addLayer({
      id: 'ports-count', type: 'symbol', source: sourceId, filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 10 },
      paint: { 'text-color': '#fff' },
    });
    map.addLayer({
      id: 'ports-layer', type: 'symbol', source: sourceId, filter: ['!', ['has', 'point_count']],
      layout: { 'icon-image': 'port-icon', 'icon-size': 0.5, 'icon-allow-overlap': false },
    });

    map.on('click', 'ports-layer', (e: any) => {
      const props = e.features?.[0]?.properties;
      const coords = (e.features?.[0]?.geometry as any)?.coordinates;
      if (props) {
        if (coords) map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10), duration: 1000 });
        onFeatureClick({ type: 'port', data: props });
      }
    });
    map.on('click', 'ports-cluster', (e: any) => {
      const clusterId = e.features?.[0]?.properties?.cluster_id;
      if (clusterId) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).getClusterExpansionZoom(clusterId, (_err, zoom) => {
          if (zoom !== undefined) map.flyTo({ center: (e.features?.[0]?.geometry as any)?.coordinates, zoom: Math.min(zoom + 1, 14) });
        });
      }
    });

    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });

    // Ensure visibility matches activeLayers on creation
    const show = activeLayers.has('ports');
    ['ports-cluster', 'ports-count', 'ports-layer'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    });
  }, [ports, onFeatureClick, mapReady, activeLayers]);

  // ── Airports ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const sourceId = 'airports-source';
    if (!airports.length) return;

    const features = airports.map((a: any) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [a.lon ?? a.lng, a.lat] },
      properties: { name: a.name, iata: a.iata, country: a.country, type: 'airport' },
    }));

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });
      return;
    }
    map.addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'airports-layer', type: 'symbol', source: sourceId,
      layout: { 'icon-image': 'airport-icon', 'icon-size': 0.5, 'icon-allow-overlap': false },
    });
    map.on('click', 'airports-layer', (e: any) => {
      const props = e.features?.[0]?.properties;
      const coords = (e.features?.[0]?.geometry as any)?.coordinates;
      if (props) {
        if (coords) map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10), duration: 1000 });
        onFeatureClick({ type: 'airport', data: props });
      }
    });

    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });

    // Ensure visibility matches activeLayers on creation
    if (map.getLayer('airports-layer'))
      map.setLayoutProperty('airports-layer', 'visibility', activeLayers.has('airports') ? 'visible' : 'none');
  }, [airports, onFeatureClick, mapReady, activeLayers]);

  // ── Chokepoints ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!chokepoints.length) return;

    const sourceId = 'chokepoints-source';
    const riskColors: Record<string, string> = { LOW: '#22c55e', MODERATE: '#eab308', ELEVATED: '#f97316', HIGH: '#ef4444', CRITICAL: '#b91c1c' };
    const features = chokepoints.map((c: any) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: c.geometry?.coordinates || [0, 0] },
      properties: { ...c.properties, type: 'chokepoint' },
    }));

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });
      return;
    }

    map.addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'chokepoints-circle', type: 'circle', source: sourceId,
      paint: {
        'circle-color': ['match', ['get', 'risk'], 'LOW', riskColors.LOW, 'MODERATE', riskColors.MODERATE, 'ELEVATED', riskColors.ELEVATED, 'HIGH', riskColors.HIGH, 'CRITICAL', riskColors.CRITICAL, '#888'],
        'circle-radius': 8, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2, 'circle-opacity': 0.85,
      },
    });
    map.addLayer({
      id: 'chokepoints-icon', type: 'symbol', source: sourceId,
      layout: { 'icon-image': 'chokepoint-icon', 'icon-size': 0.45, 'icon-allow-overlap': true },
    });

    map.on('click', 'chokepoints-circle', (e: any) => {
      const props = e.features?.[0]?.properties;
      const coords = (e.features?.[0]?.geometry as any)?.coordinates;
      if (props) {
        if (coords) map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 6), duration: 1000 });
        onFeatureClick({ type: 'chokepoint', data: props });
      }
    });

    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });

    // Ensure visibility matches activeLayers on creation
    const show = activeLayers.has('chokepoints');
    ['chokepoints-circle', 'chokepoints-icon'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    });
  }, [chokepoints, onFeatureClick, mapReady, activeLayers]);

  // ── Cargo flights ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const sourceId = 'cargo-flights-source';
    if (!cargoFlights.length) return;

    const features = cargoFlights.map((f: any) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
      properties: { ...f, type: 'cargo_flight' },
    }));

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });
      return;
    }
    map.addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'cargo-flights-layer', type: 'symbol', source: sourceId,
      layout: { 'icon-image': 'cargo-icon', 'icon-size': 0.45, 'icon-rotate': ['get', 'heading'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true },
    });
    map.on('click', 'cargo-flights-layer', (e: any) => {
      const props = e.features?.[0]?.properties;
      const coords = (e.features?.[0]?.geometry as any)?.coordinates;
      if (props) {
        if (coords) map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10), duration: 1000 });
        onFeatureClick({ type: 'cargo_flight', data: props });
      }
    });

    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });

    // Ensure visibility matches activeLayers on creation
    if (map.getLayer('cargo-flights-layer'))
      map.setLayoutProperty('cargo-flights-layer', 'visibility', activeLayers.has('cargoFlights') ? 'visible' : 'none');
  }, [cargoFlights, onFeatureClick, mapReady, activeLayers]);

  // ── Ships (polling) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const sourceId = 'ships-source';
    if (!ships.length) return;

    const features = ships.map((s: any) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { ...s, type: 'maritime' },
    }));

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });
      return;
    }
    map.addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'ships-layer', type: 'symbol', source: sourceId,
      layout: { 'icon-image': 'ship-icon', 'icon-size': 0.45, 'icon-rotate': ['get', 'heading'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true },
    });
    map.on('click', 'ships-layer', (e: any) => {
      const props = e.features?.[0]?.properties;
      const coords = (e.features?.[0]?.geometry as any)?.coordinates;
      if (props) {
        if (coords) map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 8), duration: 1000 });
        onFeatureClick({ type: 'maritime', data: props });
      }
    });
    map.on('mouseenter', 'ships-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'ships-layer', () => { map.getCanvas().style.cursor = ''; });

    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features });

    // Ensure visibility matches activeLayers on creation
    if (map.getLayer('ships-layer'))
      map.setLayoutProperty('ships-layer', 'visibility', activeLayers.has('maritime') ? 'visible' : 'none');
  }, [ships, onFeatureClick, mapReady, activeLayers]);

  // ── Update active layers visibility ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const vis = (id: string, show: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    };
    vis('cctv-glow', activeLayers.has('cctv'));
    vis('cctv-dots', activeLayers.has('cctv'));
    vis('eq-circles', activeLayers.has('earthquakes'));
    vis('weather-glow', activeLayers.has('weather'));
    vis('weather-dots', activeLayers.has('weather'));
    vis('fires-heat', activeLayers.has('fires'));
    vis('conflict-dots', activeLayers.has('conflicts'));
    // Existing layers
    vis('ports-cluster', activeLayers.has('ports'));
    vis('ports-count', activeLayers.has('ports'));
    vis('ports-layer', activeLayers.has('ports'));
    vis('airports-layer', activeLayers.has('airports'));
    vis('chokepoints-circle', activeLayers.has('chokepoints'));
    vis('chokepoints-icon', activeLayers.has('chokepoints'));
    vis('cargo-flights-layer', activeLayers.has('cargoFlights'));
    vis('ships-layer', activeLayers.has('maritime'));
  }, [activeLayers, mapReady]);

  return (
    <div ref={mapContainer} className="w-full h-full relative">
      {/* Globe toggle button */}
      <button
        onClick={() => {
          const newProj = isGlobe ? 'mercator' : 'globe';
          setIsGlobe(!isGlobe);
          try {
            (mapRef.current as any)?.setProjection({ type: newProj });
            if (newProj === 'globe') mapRef.current?.easeTo({ pitch: 20, duration: 800 });
            else mapRef.current?.easeTo({ pitch: 0, duration: 800 });
          } catch (e) { console.warn(e); }
        }}
        className="absolute bottom-20 left-3 z-10 px-2 py-1.5 rounded bg-white/90 backdrop-blur border border-black/10 text-gray-700 text-[10px] font-mono hover:bg-white transition-colors shadow-sm"
        title="Tecla G para alternar globo/plano"
      >
        {isGlobe ? 'Globo' : 'Plano'}
      </button>

      {/* Camera Viewer */}
      {activeCamera && (
        <CameraViewer
          camera={activeCamera}
          onClose={() => setActiveCamera(null)}
          onLocate={(lat: number, lng: number) => {
            if (mapRef.current) mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
          }}
        />
      )}

      {/* Live News Viewer */}
      {activeLiveNews && (
        <div className="absolute inset-4 z-[500] bg-black/95 backdrop-blur-xl rounded-xl border border-white/10 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-mono font-bold text-white">{activeLiveNews.name}</span>
            <button onClick={() => setActiveLiveNews(null)} className="p-1.5 rounded hover:bg-white/10 text-white">X</button>
          </div>
          <iframe src={activeLiveNews.url} className="flex-1 border-0" allow="autoplay; fullscreen" allowFullScreen />
        </div>
      )}
    </div>
  );
});
