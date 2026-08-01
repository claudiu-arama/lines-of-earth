import { Router } from "express";

import { AppError } from "../common/errors/AppError.ts";

const router = Router();

router.get("/", async (req, res) => {
  const osm_id = req.query.osm_id;
  const osm_type = req.query.osm_type;
  const bounding_box = req.query.bounding_box;

  // Validate required query parameters
  if (!osm_id || !osm_type || !bounding_box) {
    throw new AppError({
      statusCode: 400,
      errorCode: "MISSING_QUERY_PARAMETERS",
      message:
        "Query parameters 'osm_id', 'osm_type', and 'bounding_box' are required."
    });
  }
});

export default router;
