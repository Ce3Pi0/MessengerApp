import { Router } from "express";
import { getUsersController } from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController);

export default userRoutes;
