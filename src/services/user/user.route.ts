import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  UserController.getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  UserController.getUserById
);

router.patch(
  "/:id",
  authMiddleware,
  UserController.updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  UserController.deleteUser
);

export default router;