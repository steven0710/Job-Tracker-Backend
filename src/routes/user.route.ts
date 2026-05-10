import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyEmail,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/verify-email").get(verifyEmail);
export default userRouter;
