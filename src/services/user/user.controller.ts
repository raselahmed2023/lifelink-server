import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { UserService } from "./user.service.js";

const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await UserService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
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

const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    if (req.user.role !== "ADMIN" && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile",
        data: null,
      });
    }

    const result = await UserService.getUserById(id);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "User not found",
      data: null,
    });
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    if (req.user.role !== "ADMIN" && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
        data: null,
      });
    }

    const result = await UserService.updateUser(id, req.body);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Update failed",
      data: null,
    });
  }
};

const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const result = await UserService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Delete failed",
      data: null,
    });
  }
};

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};