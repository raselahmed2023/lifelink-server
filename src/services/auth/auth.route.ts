
import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authRateLimit } from "../../middlewares/authRateLimit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimit(5, 60 * 60 * 1000),
  AuthController.registerUser
);

router.post(
  "/login",
  authRateLimit(15, 15 * 60 * 1000),
  AuthController.loginUser
);

router.get(
  "/me",
  authMiddleware,
  AuthController.getMe
);

export default router;
