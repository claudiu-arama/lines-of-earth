import style from "./CityHits.module.scss";

// TODO: replace `any` with proper types
export const CityHits = ({
  cityData,
  handleCitySelect
}: {
  cityData: any;
  handleCitySelect: any;
}) => {
  return (
    <>
      {cityData?.map((city: any, i: any) => (
        <div
          key={i}
          className={style.suggestionItem}
          onClick={() => handleCitySelect(city)}
          tabIndex={0}
        >
          <span className={style.cityName}>
            {city.display_name.split(",")[0]}
          </span>
          <span className={style.cityMeta}>{city.display_name}</span>
          <div className={style.infoPanelSecondary}>
            <span className={style.cityType}>{city.type}</span> <br />
            <span className={style.cityCoords}>
              Lat: {city.lat} / Lon: {city.lon}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};
