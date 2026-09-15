import { AppError } from "../errors/AppError.ts";

import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // App Error

  if (err instanceof AppError) {
    console.error(
      `[${err.statusCode}][${err.errorCode}] ${err.message}`,
      err.details ?? ""
    );

    res.status(err.statusCode).json({
      code: err.errorCode,
      message: err.expose ? err.message : "An unexpected error occurred",
      details: err.expose ? err.details : undefined
    });

    return;
  }

  // Internal Server Error

  console.error("[500][INTERNAL_SERVER_ERROR]", err);

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred"
  });
};
