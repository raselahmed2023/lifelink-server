import type { Response } from "express";

import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { UserService } from "./user.service.js";

const getAllUsers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result =
      await UserService.getAllUsers();

    res.status(200).json({
      success: true,
      message:
        "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve users",
      data: null,
    });
  }
};

const getUserById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Unauthorized access",
          data: null,
        });
    }

    const id =
      req.params.id as string;

    /*
      Normal USER can only
      view own profile.

      ADMIN can view anyone.
    */
    if (
      req.user.role !== "ADMIN" &&
      req.user.userId !== id
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "You can only view your own profile",
          data: null,
        });
    }

    const result =
      await UserService.getUserById(
        id
      );

    res.status(200).json({
      success: true,
      message:
        "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "User not found",
      data: null,
    });
  }
};

const updateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Unauthorized access",
          data: null,
        });
    }

    const id =
      req.params.id as string;

    /*
      User can update own account.
      Admin can update other user.
    */
    if (
      req.user.role !== "ADMIN" &&
      req.user.userId !== id
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "You can only update your own profile",
          data: null,
        });
    }

    /*
      Only allow profile fields.
      Never allow role/status
      through normal update.
    */
    const payload = {
      name: req.body.name,
      phone: req.body.phone,
    };

    const result =
      await UserService.updateUser(
        id,
        payload
      );

    res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update user",
      data: null,
    });
  }
};

const updateUserStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Unauthorized access",
          data: null,
        });
    }

    const id =
      req.params.id as string;

    const { status } =
      req.body;

    if (
      status !== "ACTIVE" &&
      status !== "BLOCKED"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Status must be ACTIVE or BLOCKED",
          data: null,
        });
    }

    /*
      Prevent admin from
      accidentally blocking self.
    */
    if (
      req.user.userId === id
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "You cannot change your own admin status",
          data: null,
        });
    }

    const result =
      await UserService.updateUserStatus(
        id,
        status
      );

    res.status(200).json({
      success: true,

      message:
        status === "BLOCKED"
          ? "User blocked successfully"
          : "User activated successfully",

      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update user status",
      data: null,
    });
  }
};

const deleteUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Unauthorized access",
          data: null,
        });
    }

    const id =
      req.params.id as string;

    if (
      req.user.userId === id
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "You cannot delete your own admin account",
          data: null,
        });
    }

    const result =
      await UserService.deleteUser(
        id
      );

    res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete user",
      data: null,
    });
  }
};

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};