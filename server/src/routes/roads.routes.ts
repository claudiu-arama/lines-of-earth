import { Router } from "express";

import { AppError } from "../common/errors/AppError.ts";
import { isNonEmptyString } from "../helpers/stringHelpers.ts";
import { fetchRoadsData } from "../services/roads.service.ts";
import { OSM_TYPES } from "../types/osm.types.ts";

import type { OsmType } from "../types/osm.types.ts";
import type { RoadsQueryTarget } from "../types/roads.types.ts";

const router = Router();

const isOsmType = (value: unknown): value is OsmType =>
  typeof value === "string" && (OSM_TYPES as readonly string[]).includes(value);

router.get("/", async (req, res) => {
  const { osm_id, osm_type, bounding_box } = req.query;

  const osmId = Number(osm_id);

  if (!isNonEmptyString(osm_id) || !Number.isInteger(osmId)) {
    throw new AppError({
      statusCode: 400,
      errorCode: "INVALID_QUERY_PARAMETER",
      message: "Query parameter 'osm_id' must be a valid integer."
    });
  }

  if (!isOsmType(osm_type)) {
    throw new AppError({
      statusCode: 400,
      errorCode: "INVALID_QUERY_PARAMETER",
      message:
        "Query parameter 'osm_type' must be one of 'node', 'way', or 'relation'."
    });
  }

  // A node has no derivable Overpass area, so a bounding box is required as
  // a fallback. Way/relation results can derive an area from osm_id alone.
  let boundingbox: [string, string, string, string] | undefined;

  if (osm_type === "node") {
    if (!isNonEmptyString(bounding_box)) {
      throw new AppError({
        statusCode: 400,
        errorCode: "INVALID_QUERY_PARAMETER",
        message:
          "Query parameter 'bounding_box' is required when 'osm_type' is 'node'."
      });
    }

    const boundingBoxParts = bounding_box.split(",").map((part) => part.trim());

    if (
      boundingBoxParts.length !== 4 ||
      boundingBoxParts.some((part) => part === "")
    ) {
      throw new AppError({
        statusCode: 400,
        errorCode: "INVALID_QUERY_PARAMETER",
        message:
          "Query parameter 'bounding_box' must contain exactly 4 comma-separated values."
      });
    }

    boundingbox = boundingBoxParts as [string, string, string, string];
  }

  const target: RoadsQueryTarget = {
    osm_id: osmId,
    osm_type,
    boundingbox
  };

  const data = await fetchRoadsData(target);
  res.json(data);
});

export default router;
