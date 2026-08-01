export interface CitySuggestion {
  place_id?: string;
  osm_id: number;
  city: string;
  country: string;
  geolocation: IGeolocation;
}

export interface IGeolocation {
  lat: number;
  lon: number;
}
