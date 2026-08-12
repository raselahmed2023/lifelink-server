import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);

router.get("/me", authMiddleware, AuthController.getMe);

export default router;