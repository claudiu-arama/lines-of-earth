export const getRoadsQuery = (city) => `[timeout:2700][out:json];area(${city?.areaId})->.searchArea; (way["highway"](area.searchArea);way["junction"="roundabout"](area.searchArea););out geom;`;
 