import { Router } from "express";

import nominatimRoutes from "./nominatim.routes.ts";

const router = Router();

router.use("/nominatim", nominatimRoutes);

export default router;
