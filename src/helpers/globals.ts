export interface CityDataInterface {
  display_name: string;
  type: string;
  lat: string;
  lon: string;
  areaId: number | null;
  boundingbox: string[];
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

export interface nominatimResponseInterface {
  display_name: string;
  osm_type: string;
  osm_id: number | null;
  boundingbox: string[];
  lat: string;
  lon: string;
  addresstype: string;
  address: NominatimAddress;
}

export interface responseRoadsIntefaceMember {
  geometry: { lat: number; lon: number }[] | null;
  type: string;
  role: string;
  ref: number | null;
}

export interface responseRoadsInteface {
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

export interface responseRoadsData {
  elements: {
    type: string;
    id: number | null;
    tags: { [key: string]: string };
    geometry: { lat: number; lon: number }[] | null;
    members?: responseRoadsIntefaceMember[];
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
