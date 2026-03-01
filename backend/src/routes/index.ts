import { Router } from "express";
import authRoutes from "./auth.route";
import serverStatusRoutes from "./serverStatus.route";
import chatRoutes from "./chat.route";
import userRoutes from "./user.route";
import messageRoutes from "./message.route";

const router = Router();
router.use("/server", serverStatusRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/message", messageRoutes);
router.use("/users", userRoutes);

export default router;
