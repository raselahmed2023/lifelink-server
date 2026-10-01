
import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { BloodRequestService } from "./bloodRequest.service.js";
import {
  validateBloodRequest,
  validBloodGroup,
} from "../../utils/validation.js";

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

    const {
      patientName,
      bloodGroup,
      hospital,
      district,
      requiredDate,
      phone,
      message,
    } = req.body;

    if (
      !patientName ||
      !bloodGroup ||
      !hospital ||
      !district ||
      !requiredDate ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        data: null,
      });
    }

    const validationError = validateBloodRequest(
      req.body
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
        data: null,
      });
    }

    const result =
      await BloodRequestService.createBloodRequest({
        userId: req.user.userId,
        patientName,
        bloodGroup,
        hospital,
        district,
        requiredDate,
        phone,
        message,
      });

    return res.status(201).json({
      success: true,
      message: "Blood request submitted for admin approval",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
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
    const bloodGroup =
      typeof req.query.bloodGroup === "string"
        ? req.query.bloodGroup
        : undefined;

    const district =
      typeof req.query.district === "string"
        ? req.query.district
        : undefined;

    if (
      bloodGroup &&
      !validBloodGroup(bloodGroup)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
        data: null,
      });
    }

    const data =
      await BloodRequestService.getPublicBloodRequests({
        bloodGroup,
        district,
      });

    return res.status(200).json({
      success: true,
      message: "Public blood requests",
      data,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load public requests",
      data: null,
    });
  }
};

const getAdminBloodRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const data =
      await BloodRequestService.getAllBloodRequests();

    return res.status(200).json({
      success: true,
      message: "Blood requests retrieved",
      data,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blood requests",
      data: null,
    });
  }
};

const getMyBloodRequests = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  try {
    const data =
      await BloodRequestService.getMyBloodRequests(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "My blood requests",
      data,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load your requests",
      data: null,
    });
  }
};

const contactLookups = new Map<
  string,
  { count: number; reset: number }
>();

const getBloodRequestContact = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const now = Date.now();
  const key = req.user.userId;
  const state = contactLookups.get(key);

  if (
    state &&
    state.reset > now &&
    state.count >= 10
  ) {
    return res.status(429).json({
      success: false,
      message: "Too many contact lookups",
      data: null,
    });
  }

  contactLookups.set(
    key,
    !state || state.reset <= now
      ? {
          count: 1,
          reset: now + 60 * 60 * 1000,
        }
      : {
          count: state.count + 1,
          reset: state.reset,
        }
  );

  try {
    const data =
      await BloodRequestService.getBloodRequestContact(
        req.params.id as string,
        key
      );

    return res.status(200).json({
      success: true,
      message: "Request contact",
      data,
    });
  } catch {
    return res.status(403).json({
      success: false,
      message: "Request not found or access denied",
      data: null,
    });
  }
};

const getBloodRequestById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const data =
      await BloodRequestService.getPublicBloodRequestById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      message: "Blood request retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Blood request not found",
      data: null,
    });
  }
};

const updateMyBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      data: null,
    });
  }

  try {
    const validationError = validateBloodRequest(
      req.body,
      true
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
        data: null,
      });
    }

    const payload = {
      patientName: req.body.patientName,
      bloodGroup: req.body.bloodGroup,
      hospital: req.body.hospital,
      district: req.body.district,
      requiredDate: req.body.requiredDate,
      phone: req.body.phone,
      message: req.body.message,
    };

    const data =
      await BloodRequestService.updateBloodRequestByOwner(
        req.params.id as string,
        req.user.userId,
        payload
      );

    return res.status(200).json({
      success: true,
      message: "Blood request updated successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update blood request",
      data: null,
    });
  }
};

const updateBloodRequestStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
        data: null,
      });
    }

    const data =
      await BloodRequestService.updateBloodRequestStatus(
        req.params.id as string,
        status
      );

    return res.status(200).json({
      success: true,
      message: "Blood request status updated successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update blood request status",
      data: null,
    });
  }
};

const deleteBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      data: null,
    });
  }

  try {
    const data =
      await BloodRequestService.deleteBloodRequest(
        req.params.id as string,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Blood request deleted successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete blood request",
      data: null,
    });
  }
};

export const BloodRequestController = {
  createBloodRequest,
  getAllBloodRequests,
  getAdminBloodRequests,
  getMyBloodRequests,
  getBloodRequestContact,
  getBloodRequestById,
  updateMyBloodRequest,
  updateBloodRequestStatus,
  deleteBloodRequest,
};
