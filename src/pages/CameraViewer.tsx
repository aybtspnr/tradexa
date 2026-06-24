"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { X, ExternalLink, RefreshCw, MapPin, Camera, Maximize2 } from "lucide-react";

interface CameraViewerProps {
  camera: any | null;
  onClose: () => void;
  onLocate?: (lat: number, lng: number) => void;
}

const BRAND_RED = "#DC2626";

export function CameraViewer({ camera, onClose, onLocate }: CameraViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Normalize stream type — treat missing/"none" as "jpg" when feed_url exists
  const rawType = camera?.stream_type;
  const streamType: string = rawType === "hls" ? "hls"
    : rawType === "iframe" ? "iframe"
    : camera?.feed_url ? "jpg"
    : "none";

  const externalFeedUrl = camera?.external_url || camera?.feed_url;
  const externalOnly = Boolean(camera?.external_url && !camera?.feed_url && !camera?.stream_url);

  useEffect(() => {
    if (!camera) return;
    setLoading(true);
    setError(false);
    setImageUrl(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (externalOnly) {
      setLoading(false);
      return;
    }

    // HLS stream
    if (streamType === "hls" && camera.stream_url) {
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(camera.stream_url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError(true);
        });
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = camera.stream_url;
        videoRef.current.addEventListener("loadedmetadata", () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });
      }
      return;
    }

    // Iframe stream
    if (streamType === "iframe" && camera.stream_url) {
      setLoading(false);
      return;
    }

    // JPG — use feed_url directly, add cache-bust parameter
    if (camera.feed_url) {
      const sep = camera.feed_url.includes("?") ? "&" : "?";
      const url = `${camera.feed_url}${sep}_t=${Date.now()}`;
      setImageUrl(url);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [camera, refreshKey, streamType, externalOnly]);

  // Auto-refresh for JPG every 5 seconds
  useEffect(() => {
    if (streamType !== "jpg" || !camera?.feed_url) return;
    const iv = setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => clearInterval(iv);
  }, [camera?.feed_url, streamType]);

  if (!camera) return null;

  const handleLocate = () => {
    if (camera.lat && camera.lng) onLocate?.(camera.lat, camera.lng);
  };

  return (
    <div
      className={`fixed z-[500] transition-all ${
        fullscreen
          ? "inset-2 md:inset-4"
          : "bottom-[70px] left-2 right-2 md:bottom-6 md:right-6 md:left-auto md:w-[420px]"
      }`}
    >
      <div className="flex flex-col h-full rounded-xl border border-red-200 bg-white/98 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-gray-100 bg-white/90">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
            <Camera className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-[10px] md:text-[11px] font-semibold text-gray-900 truncate">
                {camera.name}
              </h3>
              <p className="text-[7px] text-gray-500">
                {camera.city}, {camera.country} · {camera.source}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {streamType === "jpg" && (
              <button onClick={() => setRefreshKey((k) => k + 1)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Refresh">
                <RefreshCw className="w-3 h-3 text-gray-400 hover:text-red-600" />
              </button>
            )}
            {camera.lat && camera.lng && (
              <button onClick={handleLocate} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Locate on map">
                <MapPin className="w-3 h-3 text-gray-400 hover:text-amber-600" />
              </button>
            )}
            <button onClick={() => setFullscreen(!fullscreen)} className="hidden md:block p-1.5 rounded hover:bg-gray-100 transition-colors" title="Fullscreen">
              <Maximize2 className="w-3 h-3 text-gray-400 hover:text-gray-700" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-red-50 transition-colors">
              <X className="w-4 h-4 md:w-3 md:h-3 text-gray-400 hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Camera Feed */}
        <div className={`relative bg-gray-100 ${fullscreen ? "flex-1" : "aspect-video max-h-[35vh] md:max-h-none"}`}>
          {/* Loading */}
          {loading && !error && !externalOnly && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-[9px] font-medium text-red-600 tracking-wider uppercase">Conectando...</span>
              </div>
            </div>
          )}

          {/* External only */}
          {externalOnly ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95">
              <div className="text-center px-6">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-[10px] font-semibold text-red-600 block mb-1">FEED EXTERNO</span>
                <span className="text-[8px] text-gray-500">Abrir no site de origem</span>
                {externalFeedUrl && (
                  <a href={externalFeedUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block mx-auto mt-3 px-4 py-1.5 text-[9px] font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ABRIR FEED
                  </a>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3 mx-auto">
                  <Camera className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 block mb-1">CÂMERA INDISPONÍVEL</span>
                <span className="text-[8px] text-gray-400">Offline ou com restrição de acesso</span>
                <button onClick={() => { setError(false); setRefreshKey((k) => k + 1); }}
                  className="inline-block mx-auto mt-3 px-4 py-1.5 text-[9px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  TENTAR NOVAMENTE
                </button>
              </div>
            </div>
          ) : streamType === "hls" ? (
            <video ref={videoRef} className={`w-full ${fullscreen ? "h-full object-contain" : "h-full object-cover"}`} autoPlay muted playsInline />
          ) : streamType === "iframe" && camera.stream_url ? (
            <iframe src={camera.stream_url} className="w-full h-full border-0" allow="autoplay; fullscreen" allowFullScreen />
          ) : imageUrl ? (
            <img key={refreshKey} src={imageUrl} alt={camera.name}
              className={`w-full ${fullscreen ? "h-full object-contain" : "h-full object-cover"}`}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          ) : null}

          {/* Live indicator */}
          {!error && !loading && !externalOnly && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[8px] font-semibold text-gray-700 uppercase">
                {streamType === "jpg" ? "SNAPSHOT AO VIVO" : "VÍDEO AO VIVO"}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 md:px-4 py-2 border-t border-gray-100 bg-white/90 flex items-center justify-between">
          <div className="text-[8px] text-gray-400 font-mono">
            {camera.lat?.toFixed(4)}, {camera.lng?.toFixed(4)}
          </div>
          <div className="flex gap-3">
            {(camera.feed_url || camera.external_url) && (
              <a href={camera.external_url || camera.feed_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[8px] font-semibold text-red-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> FEED
              </a>
            )}
            <a href={`https://www.google.com/maps/@${camera.lat},${camera.lng},17z`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[8px] font-semibold text-blue-600 hover:underline"
            >
              <MapPin className="w-3 h-3" /> MAPA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
