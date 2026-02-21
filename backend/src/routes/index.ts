import { Router } from "express";
import authRoutes from "./auth.route";
import serverStatusRoutes from "./serverStatus.route";

const router = Router();
router.use("/server", serverStatusRoutes);
router.use("/auth", authRoutes);

export default router;
