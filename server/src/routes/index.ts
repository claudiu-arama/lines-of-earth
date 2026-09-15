import { Router } from "express";

import citiesRoutes from "./cities.routes.ts";
import roadsRoutes from "./roads.routes.ts";

const router = Router();

router.use("/cities", citiesRoutes);
router.use("/roads", roadsRoutes);

export default router;
