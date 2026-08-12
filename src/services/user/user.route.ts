import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import { UserController } from "./user.controller.js";

const router = Router();

/*
  ADMIN:
  Get all users
*/
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  UserController.getAllUsers
);

/*
  ADMIN:
  Block / Unblock user

  Keep specific route before
  generic /:id routes.
*/
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  UserController.updateUserStatus
);

/*
  Logged-in USER:
  View own account

  ADMIN:
  View any account
*/
router.get(
  "/:id",
  authMiddleware,
  UserController.getUserById
);

/*
  USER:
  Update own profile

  ADMIN:
  Can update another profile
*/
router.patch(
  "/:id",
  authMiddleware,
  UserController.updateUser
);

/*
  ADMIN only:
  Soft delete user
*/
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  UserController.deleteUser
);

export default router;