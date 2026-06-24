/**
 * Vercel serverless — airlines lookup (static cargo-focused map)
 * Endpoint: /api/airlines
 * Maps ICAO codes to airline names for cargo flight display
 */

const ICAO_TO_NAME: Record<string, string> = {
  // Major cargo airlines
  "UPS": "UPS Airlines",
  "FDX": "FedEx Express",
  "GTI": "Atlas Air",
  "CKS": "Kalitta Air",
  "ABD": "Air Atlanta Icelandic",
  "SOO": "Southern Air",
  "GEC": "Lufthansa Cargo",
  "CLX": "Cargolux",
  "BOX": "Aerologic",
  "TAY": "ASL Airlines Belgium",
  "DHK": "DHL Air",
  "BCS": "European Air Transport",
  "MSR": "EgyptAir Cargo",
  "ELY": "El Al Cargo",
  "ETD": "Etihad Cargo",
  "EKA": "Emirates SkyCargo",
  "QTR": "Qatar Airways Cargo",
  "SVA": "Saudia Cargo",
  "THY": "Turkish Cargo",
  "KAL": "Korean Air Cargo",
  "AAR": "Asiana Cargo",
  "CPA": "Cathay Pacific Cargo",
  "AHK": "Air Hong Kong",
  "CAL": "China Airlines Cargo",
  "EVA": "EVA Air Cargo",
  "ANA": "ANA Cargo",
  "JAL": "JAL Cargo",
  "NCA": "Nippon Cargo Airlines",
  "SIA": "Singapore Airlines Cargo",
  "MAS": "MASkargo",
  "GIA": "Garuda Cargo",
  "THA": "Thai Cargo",
  "CSC": "Sichuan Airlines Cargo",
  "CCA": "Air China Cargo",
  "CES": "China Eastern Cargo",
  "CSN": "China Southern Cargo",
  "PAC": "Polar Air Cargo",
  "ABW": "AirBridgeCargo",
  "RGN": "Cygnus Air",
  "LAE": "LATAM Cargo",
  "TAM": "LATAM Cargo Brasil",
  "LAN": "LATAM Cargo Chile",
  "MPH": "Martinair Cargo",
  "ICE": "Icelandair Cargo",
  "ACL": "Air Charter Logistics",
  "AJK": "Amerijet International",
  "MGE": "Miami Air International",
  "ABX": "ABX Air",
  "ATN": "Air Transport International",
  "CJT": "Cargojet",
  "CFS": "Empire Airlines",
  "WGN": "Western Global Airlines",
  "NCR": "National Cargo",
  "CKK": "China Cargo Airlines",
  "BSC": "Biman Cargo",
  "DHL": "DHL Aviation",
};

export async function GET() {
  return Response.json(ICAO_TO_NAME);
}
