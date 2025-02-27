import express from "express";
import authController from "../controllers/authController.js";
import verifyEmailController from "../controllers/verifyEmailController.js";
import userAuth from "../middleware/userAuth.js";
const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/send-reset-otp", authController.sendResetOtp);
authRouter.post("/reset-passwordusingOtp", authController.resetPassword);
authRouter.post("/send-forgotpwdinemail",authController.forgetPassword);

authRouter.post("/resetPasswordLink",authController.resetPasswordLink);

authRouter.post("/send-verify-otp", userAuth,verifyEmailController.sendVerifyOtp);
authRouter.post("/verify-account", userAuth,verifyEmailController.verifyEmail);
authRouter.get("/is-auth", userAuth,verifyEmailController.isAuthenticated);

export default authRouter;
