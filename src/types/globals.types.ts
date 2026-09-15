export interface CityData {
  display_name: string;
  type: string;
  lat: string;
  lon: string;
  areaId: number | null;
  boundingbox: string[];
  name?: string;
  country?: string;
}

type NominatimAddress = {
  [key: string]: string | undefined;
  city_district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  country_code?: string;
};

export interface NominatimResponseData {
  display_name: string;
  osm_type: string;
  osm_id: number | null;
  boundingbox: string[];
  lat: string;
  lon: string;
  addresstype: string;
  address: NominatimAddress;
  name: string | undefined;
}

export interface ResponseRoadsMember {
  geometry: { lat: number; lon: number }[] | null;
  type: string;
  role: string;
  ref: number | null;
}

export interface ResponseRoads {
  roads: {
    type: string;
    coordinates: number[][];
    isClosed: boolean;
  }[];
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface ResponseRoadsData {
  elements: {
    type: string;
    id: number | null;
    tags: { [key: string]: string };
    geometry: { lat: number; lon: number }[] | null;
    members?: ResponseRoadsMember[];
    bounds?: {
      minLat: number;
      maxLat: number;
      minLon: number;
      maxLon: number;
    };
  }[];
}

export type DrawScene = {
  drawScene: () => void;
  drawSceneFull: () => void;
};

export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface CanvasCoords {
  x: number;
  y: number;
  scale: number;
}
