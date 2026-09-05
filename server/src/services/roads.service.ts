import { AppError } from "../common/errors/AppError.ts";
import { isNonEmptyArray } from "../helpers/arrayHelpers.ts";
import { buildRoadsQuery } from "../helpers/overpassHelpers.ts";
import { queryOverpass } from "../providers/spatial-queries/overpass.provider.ts";

import type {
  OverpassResponse,
  RoadsQueryTarget
} from "../types/roads.types.ts";

export async function fetchRoadsData(target: RoadsQueryTarget) {
  const query = buildRoadsQuery(target);
  const data = (await queryOverpass(query)) as OverpassResponse;

  if (!isNonEmptyArray(data?.elements)) {
    throw new AppError({
      statusCode: 404,
      errorCode: "ROADS_NOT_FOUND",
      message: "No road data found for the provided area."
    });
  }

  return data;
}
