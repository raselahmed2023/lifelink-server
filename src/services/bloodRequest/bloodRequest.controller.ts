import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import type {
  BloodGroup,
  RequestStatus,
} from "../../generated/prisma/client.js";
import { BloodRequestService } from "./bloodRequest.service.js";

const createBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const result =
      await BloodRequestService.createBloodRequest({
        ...req.body,
        userId: req.user.userId,
      });

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create blood request",
      data: null,
    });
  }
};

const getAllBloodRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { bloodGroup, district, status } = req.query;

    const result =
      await BloodRequestService.getAllBloodRequests({
        bloodGroup: bloodGroup as BloodGroup | undefined,
        district: district as string | undefined,
        status: status as RequestStatus | undefined,
      });

    res.status(200).json({
      success: true,
      message: "Blood requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve blood requests",
      data: null,
    });
  }
};

const getBloodRequestById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const result =
      await BloodRequestService.getBloodRequestById(id);

    res.status(200).json({
      success: true,
      message: "Blood request retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Blood request not found",
      data: null,
    });
  }
};

const updateBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const id = req.params.id as string;

    const request =
      await BloodRequestService.getBloodRequestById(id);

    if (
      req.user.role !== "ADMIN" &&
      request.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update your own blood request",
        data: null,
      });
    }

    const result =
      await BloodRequestService.updateBloodRequest(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Blood request updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Update failed",
      data: null,
    });
  }
};

const deleteBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const id = req.params.id as string;

    const request =
      await BloodRequestService.getBloodRequestById(id);

    if (
      req.user.role !== "ADMIN" &&
      request.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own blood request",
        data: null,
      });
    }

    const result =
      await BloodRequestService.deleteBloodRequest(id);

    res.status(200).json({
      success: true,
      message: "Blood request deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Delete failed",
      data: null,
    });
  }
};

export const BloodRequestController = {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
};