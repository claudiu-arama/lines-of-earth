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
