import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resendRegistrationVerification,
  resetPassword,
  verifyRegistration,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/verify-email").get(verifyRegistration);
userRouter
  .route("/resend-verification-email")
  .post(resendRegistrationVerification);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password").post(resetPassword);
export default userRouter;
