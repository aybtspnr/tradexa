// CCTV camera data sources — aggregated from OSIRIS project
// All cameras have public feed URLs. No API keys needed.

// ── Helper: Windy webcam URLs ──
function windy(id) {
  return {
    stream_url: `https://www.windy.com/webcams/${id}/embed`,
    stream_type: 'iframe',
    feed_url: `https://images-webcams.windy.com/37/${id}/current/full/${id}.jpg`,
    external_url: `https://www.windy.com/webcams/${id}`,
    source: 'Windy',
  };
}

// ── Static cameras (curated, verified public feeds) ──
const STATIC_CAMERAS = [
  // ── TURKEY ──
  { id:'tr-makaza-1',lat:41.295,lng:24.137,name:'Makaza Border',city:'Komotini',country:'Turkey',stream_url:'https://www.youtube.com/embed/pnr0lhrqRAc?autoplay=1&mute=1',stream_type:'iframe',external_url:'https://weather-webcam.eu/',source:'YouTube/GKPP' },
  { id:'tr-makaza-2',lat:41.294,lng:24.139,name:'Makaza Border 2',city:'Komotini',country:'Turkey',stream_url:'https://www.youtube.com/embed/YXN19ZEpIkc?autoplay=1&mute=1',stream_type:'iframe',external_url:'https://weather-webcam.eu/',source:'YouTube/GKPP' },
  // Windy iframes blocked by CSP — use JPG fallback only
  { id:'tr-kapikule',lat:41.717,lng:26.33,name:'Kapikule Customs',city:'Edirne',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1375653055/current/full/1375653055.jpg',external_url:'https://www.windy.com/webcams/1375653055',source:'Windy' },
  { id:'tr-hamzabeyli',lat:41.97,lng:26.388,name:'Hamzabeyli Border',city:'Edirne',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1639080445/current/full/1639080445.jpg',external_url:'https://www.windy.com/webcams/1639080445',source:'Windy' },
  { id:'tr-tekirdag-1',lat:40.983,lng:27.515,name:'Tekirdag Cumhuriyet',city:'Tekirdag',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1641362068/current/full/1641362068.jpg',external_url:'https://www.windy.com/webcams/1641362068',source:'Windy' },
  { id:'tr-tekirdag-2',lat:40.978,lng:27.508,name:'Tekirdag Center',city:'Tekirdag',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1610814488/current/full/1610814488.jpg',external_url:'https://www.windy.com/webcams/1610814488',source:'Windy' },
  { id:'tr-istanbul-galata',lat:41.019,lng:28.974,name:'Istanbul Galata Bridge',city:'Istanbul',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1573888456/current/full/1573888456.jpg',external_url:'https://www.windy.com/webcams/1573888456',source:'Windy' },
  { id:'tr-istanbul-sultanahmet',lat:41.009,lng:28.977,name:'Istanbul Sultanahmet',city:'Istanbul',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1573537594/current/full/1573537594.jpg',external_url:'https://www.windy.com/webcams/1573537594',source:'Windy' },
  { id:'tr-istanbul-bosphorus',lat:41.042,lng:29.009,name:'Istanbul Bosphorus',city:'Istanbul',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1511515262/current/full/1511515262.jpg',external_url:'https://www.windy.com/webcams/1511515262',source:'Windy' },
  { id:'tr-istanbul-yavuz',lat:41.202,lng:29.121,name:'Istanbul Yavuz Bridge',city:'Istanbul',country:'Turkey',feed_url:'https://images-webcams.windy.com/37/1601452975/current/full/1601452975.jpg',external_url:'https://www.windy.com/webcams/1601452975',source:'Windy' },

  // ── BULGARIA ──
  { id:'bg-sofia-tsarigradsko',lat:42.662,lng:23.376,name:'Tsarigradsko Shose',city:'Sofia',country:'Bulgaria',feed_url:'https://cdn.uab.org/images/cctv/images/cctv/cctv_103/cctv.jpg',source:'UAB/KAMEPA' },
  { id:'bg-burgas-center',lat:42.497,lng:27.47,name:'Burgas Center (HLS)',city:'Burgas',country:'Bulgaria',stream_url:'https://pics.smartburgas.eu/m3u8/burgas_town_Center.m3u8',stream_type:'hls',external_url:'https://www.weather-webcam.eu/',source:'Smart Burgas' },

  // ── GREECE ──
  { id:'gr-thessaloniki',lat:40.640,lng:22.944,name:'Thessaloniki Center',city:'Thessaloniki',country:'Greece',stream_url:'https://www.youtube.com/embed/7V0IRFbzRFI?autoplay=1&mute=1',stream_type:'iframe',external_url:'https://www.webcameras.gr/',source:'meteothes.gr' },
  // click2stream blocked by X-Frame-Options — use external only
  { id:'gr-kavala',lat:40.939,lng:24.408,name:'Kavala City View',city:'Kavala',country:'Greece',external_url:'https://www.webcameras.gr/',source:'click2stream' },

  // ── US EAST (Ohio, Florida) ──
  { id:'us-oh-hamilton',lat:39.399,lng:-84.560,name:'Hamilton OH',city:'Hamilton',country:'US',feed_url:'https://gsccam.butlersheriff.org/axis-cgi/jpg/image.cgi',external_url:'https://gsccam.butlersheriff.org/',source:'Butler County OH' },
  { id:'us-oh-129',lat:39.381,lng:-84.438,name:'OH-129 at 747',city:'Butler County',country:'US',feed_url:'https://towercam.butlersheriff.org/axis-cgi/jpg/image.cgi',external_url:'https://towercam.butlersheriff.org/',source:'Butler County OH' },
  { id:'us-cincinnati-earthcam',lat:39.091,lng:-84.510,name:'Cincinnati Covington',city:'Covington',country:'US',external_url:'https://www.earthcam.com/usa/kentucky/covington/?cam=covington',source:'EarthCam' },

  // ── CANADA (Ottawa curated) ──
  { id:'ca-ott-parliament',lat:45.4215,lng:-75.6972,name:'Parliament Hill',city:'Ottawa',country:'Canada',feed_url:'https://traffic.ottawa.ca/map/camera?id=1',source:'Ottawa Traffic' },
  { id:'ca-ott-rideau',lat:45.4231,lng:-75.6831,name:'Rideau/Sussex',city:'Ottawa',country:'Canada',feed_url:'https://traffic.ottawa.ca/map/camera?id=2',source:'Ottawa Traffic' },
  { id:'ca-ott-bank',lat:45.4195,lng:-75.7009,name:'Bank/Sparks',city:'Ottawa',country:'Canada',feed_url:'https://traffic.ottawa.ca/map/camera?id=3',source:'Ottawa Traffic' },
  { id:'ca-ott-kingedward',lat:45.4249,lng:-75.6950,name:'King Edward/Rideau',city:'Ottawa',country:'Canada',feed_url:'https://traffic.ottawa.ca/map/camera?id=4',source:'Ottawa Traffic' },
  { id:'ca-tor-yonge',lat:43.653,lng:-79.383,name:'Yonge/Dundas Square',city:'Toronto',country:'Canada',external_url:'https://511on.ca/map/',source:'511 Ontario' },
  { id:'ca-tor-cn',lat:43.643,lng:-79.387,name:'CN Tower/Lakeshore',city:'Toronto',country:'Canada',external_url:'https://511on.ca/map/',source:'511 Ontario' },

  // ── SERBIA ──
  { id:'rs-belgrade-brankov',lat:44.815,lng:20.450,name:'Brankov Most',city:'Belgrade',country:'Serbia',feed_url:'https://kamere.amss.org.rs/CCTV/brankov_most_01.jpg',source:'AMSS' },
  { id:'rs-belgrade-gazela',lat:44.802,lng:20.440,name:'Gazela Bridge',city:'Belgrade',country:'Serbia',feed_url:'https://kamere.amss.org.rs/CCTV/gazela_01.jpg',source:'AMSS' },

  // ── MACEDONIA ──
  { id:'mk-skopje-center',lat:41.998,lng:21.426,name:'Skopje Center',city:'Skopje',country:'Macedonia',feed_url:'https://skopjeinfo.mk/web_cameras/centar.jpg',source:'SkopjeInfo' },

  // ── ROMANIA ──
  { id:'ro-bucharest-piata',lat:44.436,lng:26.102,name:'Piata Unirii',city:'Bucharest',country:'Romania',feed_url:'https://cctvpn.romatsa.ro/camera/camera01.jpg',source:'ROMATSA' },
  { id:'ro-bucharest-victoriei',lat:44.452,lng:26.086,name:'Calea Victoriei',city:'Bucharest',country:'Romania',feed_url:'https://cctvpn.romatsa.ro/camera/camera02.jpg',source:'ROMATSA' },

  // ── LIVE NEWS FEEDS (channel map pins) ──
  { id:'news-sky',lat:51.500,lng:-0.118,name:'Sky News',city:'London',country:'UK',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCoMdktPbSTixAyNGwb-UYkQ&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-france24',lat:48.830,lng:2.280,name:'France 24 EN',city:'Paris',country:'France',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCQfwfsi5VrQ8yKZ-UWmAEFg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-dw',lat:52.508,lng:13.376,name:'DW News',city:'Berlin',country:'Germany',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-aljazeera',lat:25.286,lng:51.534,name:'Al Jazeera EN',city:'Doha',country:'Qatar',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-trt',lat:41.008,lng:28.978,name:'TRT World',city:'Istanbul',country:'Turkey',stream_url:'https://www.youtube.com/embed/live_stream?channel=UC7fWeaHZQg1p9-4v98L1D1A&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-cna',lat:1.290,lng:103.852,name:'CNA 24/7',city:'Singapore',country:'Singapore',stream_url:'https://www.youtube.com/embed/live_stream?channel=UC83jt4dlz1Gjl58fzQrrKZg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-nhk',lat:35.690,lng:139.692,name:'NHK World',city:'Tokyo',country:'Japan',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCSPEjw8F2nQDtmUKPFNF7_A&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-wion',lat:28.614,lng:77.209,name:'WION',city:'New Delhi',country:'India',stream_url:'https://www.youtube.com/embed/live_stream?channel=UC_gUM8rL-Lrg6O3adPW9K1g&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-euronews',lat:45.764,lng:4.836,name:'Euronews',city:'Lyon',country:'France',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCtUbOIRGKZkW7555n6x6qg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-telesur',lat:10.491,lng:-66.902,name:'teleSUR EN',city:'Caracas',country:'Venezuela',stream_url:'https://www.youtube.com/embed/live_stream?channel=UCmuTmpLY35O3csvhyA6vrkg&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
  { id:'news-abc-au',lat:-33.867,lng:151.207,name:'ABC Australia',city:'Sydney',country:'Australia',stream_url:'https://www.youtube.com/embed/live_stream?channel=UC5iLnYoF4Ryb63YdGD9RfWQ&autoplay=1&mute=1',stream_type:'iframe',source:'YouTube',type:'live_news' },
];

// ── API-based camera fetchers ──
export async function fetchTfLCameras() {
  try {
    const res = await fetch('https://api.tfl.gov.uk/Place/Type/JamCam', { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(cam => {
      const imgProp = cam.additionalProperties?.find(p => p.key === 'imageUrl');
      const camId = cam.id?.replace('JamCams_', '') || '';
      return {
        id: `tfl-${cam.id}`, lat: cam.lat, lng: cam.lon,
        name: cam.commonName || 'London JamCam', city: 'London', country: 'UK',
        feed_url: imgProp?.value || `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/${camId}.jpg`,
        source: 'TfL',
      };
    }).filter(c => c.lat && c.lng);
  } catch { return []; }
}

export async function fetchWSDOTCameras() {
  try {
    const res = await fetch('https://data.wsdot.wa.gov/log/public/cameras.json', { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(cam => ({
      id: `wsdot-${cam.CameraID}`, lat: cam.CameraLocation?.Latitude, lng: cam.CameraLocation?.Longitude,
      name: cam.Title || 'WSDOT Camera', city: 'Washington', country: 'US',
      feed_url: cam.ImageURL || '', source: 'WSDOT',
    })).filter(c => c.lat && c.lng && c.feed_url);
  } catch { return []; }
}

export async function fetchCaltransCameras() {
  const all = [];
  for (const dist of ['d03','d04','d05','d06','d07','d08','d10','d11','d12']) {
    try {
      const res = await fetch(`https://cwwp2.dot.ca.gov/data/${dist}/cctv/cctvStatus${dist.toUpperCase()}.json`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      for (const cam of (data?.data || [])) {
        const lat = parseFloat(cam.location?.latitude);
        const lng = parseFloat(cam.location?.longitude);
        const url = cam.cctv?.imageData?.static?.currentImageURL;
        if (!lat || !lng || !url) continue;
        all.push({ id:`cal-${all.length}`,lat,lng,name:cam.location?.locationName||'Caltrans',city:'California',country:'US',feed_url:url,source:'Caltrans' });
      }
    } catch { /* skip */ }
  }
  return all;
}

export async function fetchCanadaCameras() {
  const cams = [];
  // Ontario 511
  try {
    const res = await fetch('https://511on.ca/api/v2/get/cameras', { signal: AbortSignal.timeout(10000), headers:{'Accept':'application/json'} });
    if (res.ok) {
      const data = await res.json();
      for (const cam of (data || []).slice(0, 200)) {
        if (!cam.latitude || !cam.longitude) continue;
        cams.push({ id:`on-${cam.id||cams.length}`,lat:cam.latitude,lng:cam.longitude,name:cam.description||cam.name||'Ontario Camera',city:'Ontario',country:'Canada',feed_url:cam.imageUrl||cam.url||'',source:'511 Ontario' });
      }
    }
  } catch { /* skip */ }
  return cams.filter(c => c.lat && c.lng);
}

export async function fetchFloridaCameras() {
  try {
    const res = await fetch('https://fl511.com/api/v2/cameras', { signal: AbortSignal.timeout(8000), headers:{'Accept':'application/json'} });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, 400).map(cam => ({
      id:`fl-${cam.id||Math.random()}`,lat:cam.latitude,lng:cam.longitude,
      name:cam.description||'FL Camera',city:'Florida',country:'US',
      feed_url:cam.imageUrl||'',source:'FL-511'
    })).filter(c => c.lat && c.lng);
  } catch { return []; }
}

export async function fetchEuropeCameras() {
  const cams = [];
  // Netherlands RWS
  try {
    const res = await fetch('https://opendata.ndw.nu/cameras.json', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      for (const cam of (data || []).slice(0, 400)) {
        if (!cam.lat || !cam.lng) continue;
        cams.push({ id:`nl-${cams.length}`,lat:cam.lat,lng:cam.lng,name:cam.name||'NL Camera',city:'Netherlands',country:'NL',feed_url:cam.imageUrl||'',source:'RWS' });
      }
    }
  } catch { /* skip */ }
  return cams;
}

export async function fetchSingaporeCameras() {
  try {
    const res = await fetch('https://api.data.gov.sg/v1/transport/traffic-images', { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items?.[0]?.cameras || []).map(cam => ({
      id:`sin-${cam.camera_id}`,lat:cam.location?.latitude,lng:cam.location?.longitude,
      name:`Camera ${cam.camera_id}`,city:'Singapore',country:'Singapore',
      feed_url:cam.image,source:'LTA Singapore'
    })).filter(c => c.lat && c.lng);
  } catch { return []; }
}

export { STATIC_CAMERAS };
