import express from "express";

import { errorHandler } from "./common/middlewares/errorHandler.ts";
import routes from "./routes/index.ts";

import type { Express, Request, Response } from "express";

const app: Express = express();

// JSON body parser middleware
app.use(express.json());

// Register routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

// Error handling middleware
app.use(errorHandler);

export default app;
