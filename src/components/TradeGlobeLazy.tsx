import { lazy } from "react";
import type { MapCity, MapCountry, CityCountryArc, CityCompanyInfo, CityCountryInfo, MapPort } from "./TradeGlobe";

export const TradeGlobe = lazy(() =>
  import("./TradeGlobe").then((m) => ({ default: m.TradeGlobe }))
);

export type { MapCity, MapCountry, CityCountryArc, CityCompanyInfo, CityCountryInfo, MapPort };
