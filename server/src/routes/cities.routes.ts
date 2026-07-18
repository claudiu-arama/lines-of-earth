import { Router } from "express";

import { AppError } from "../common/errors/AppError.ts";
import { isNonEmptyString } from "../helpers/stringHelpers.ts";
import { fetchCitySuggestions } from "../services/cities.service.ts";

const router = Router();

router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!isNonEmptyString(query)) {
    throw new AppError({
      statusCode: 400,
      errorCode: "INVALID_QUERY_PARAMETER",
      message: "Query parameter 'q' is required and must be a non-empty string."
    });
  }

  const suggestions = await fetchCitySuggestions(query);
  res.json(suggestions);
});

export default router;
