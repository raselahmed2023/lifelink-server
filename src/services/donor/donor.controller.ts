
import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { DonorService } from "./donor.service.js";
import {
  validateDonorProfile,
  validBloodGroup,
} from "../../utils/validation.js";

const createDonor = async (
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
      bloodGroup,
      district,
      area,
      lastDonation,
      isAvailable,
    } = req.body;

    if (!bloodGroup || !district) {
      return res.status(400).json({
        success: false,
        message: "Blood group and district are required",
        data: null,
      });
    }

    const validationError =
      validateDonorProfile(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
        data: null,
      });
    }

    const result =
      await DonorService.createDonor({
        userId: req.user.userId,
        bloodGroup,
        district,
        area,
        lastDonation,
        isAvailable,
      });

    return res.status(201).json({
      success: true,
      message: "Donor profile created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create donor profile",
      data: null,
    });
  }
};

const getAllDonors = async (
  req: AuthRequest,
  res: Response,
  includeUnavailable = false
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

    const result =
      await DonorService.getAllDonors(
        bloodGroup,
        district,
        !(
          includeUnavailable &&
          req.user?.role === "ADMIN"
        )
      );

    return res.status(200).json({
      success: true,
      message: "Donors retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve donors",
      data: null,
    });
  }
};

const getDonorById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result =
      await DonorService.getDonorById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      message: "Donor retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Donor not found",
      data: null,
    });
  }
};

const updateDonor = async (
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
    const validationError =
      validateDonorProfile(
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
      bloodGroup: req.body.bloodGroup,
      district: req.body.district,
      area: req.body.area,
      lastDonation: req.body.lastDonation,
      isAvailable: req.body.isAvailable,
    };

    const result =
      await DonorService.updateDonor(
        req.params.id as string,
        req.user.userId,
        req.user.role,
        payload
      );

    return res.status(200).json({
      success: true,
      message: "Donor profile updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update donor profile",
      data: null,
    });
  }
};

const deleteDonor = async (
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
    const result =
      await DonorService.deleteDonor(
        req.params.id as string,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Donor profile deactivated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to deactivate donor profile",
      data: null,
    });
  }
};

export const DonorController = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};
