import { formatLatLon } from "helpers/mathHelpers";

import style from "./CityHits.module.scss";

import type { CityData } from "../types/globals.types";

export const CityHits = ({
  cityData,
  handleCitySelect
}: {
  cityData: CityData[];
  handleCitySelect: (city: CityData) => void;
}) => {
  return cityData?.map((city: CityData, i: number) => (
    <div
      key={i}
      className={style.suggestionItem}
      onClick={() => handleCitySelect(city)}
      tabIndex={0}
    >
      <span className={style.cityName}>{city.display_name.split(",")[0]}</span>
      <span className={style.cityMeta}>{city.display_name}</span>
      <div className={style.infoPanelSecondary}>
        <span className={style.cityType}>{city.type}</span> <br />
        <span className={style.cityCoords}>
          {formatLatLon(city.lat, city.lon, 4)}
        </span>
      </div>
    </div>
  ));
};
