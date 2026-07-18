import { Router } from "express";

import citiesRoutes from "./cities.routes.ts";

const router = Router();

router.use("/cities", citiesRoutes);

export default router;
