import type { Response } from "express";

import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { DonorService } from "./donor.service.js";

const createDonor = async (
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

    const {
      bloodGroup,
      district,
      area,
      lastDonation,
      isAvailable,
    } = req.body;

    if (
      !bloodGroup ||
      !district
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Blood group and district are required",
          data: null,
        });
    }

    const result =
      await DonorService.createDonor(
        {
          userId:
            req.user.userId,

          bloodGroup,
          district,
          area,
          lastDonation,
          isAvailable,
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Donor profile created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
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
  res: Response
) => {
  try {
    const bloodGroup =
      typeof req.query
        .bloodGroup === "string"
        ? req.query.bloodGroup
        : undefined;

    const district =
      typeof req.query
        .district === "string"
        ? req.query.district
        : undefined;

    const result =
      await DonorService.getAllDonors(
        bloodGroup,
        district
      );

    res.status(200).json({
      success: true,
      message:
        "Donors retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
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
    const id =
      req.params.id as string;

    const result =
      await DonorService.getDonorById(
        id
      );

    res.status(200).json({
      success: true,
      message:
        "Donor retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
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
      Whitelist fields.

      userId / isDeleted etc.
      cannot be changed from body.
    */
    const payload = {
      bloodGroup:
        req.body.bloodGroup,

      district:
        req.body.district,

      area: req.body.area,

      lastDonation:
        req.body.lastDonation,

      isAvailable:
        req.body.isAvailable,
    };

    const result =
      await DonorService.updateDonor(
        id,
        req.user.userId,
        req.user.role,
        payload
      );

    res.status(200).json({
      success: true,
      message:
        "Donor profile updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
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

    const result =
      await DonorService.deleteDonor(
        id,
        req.user.userId,
        req.user.role
      );

    res.status(200).json({
      success: true,
      message:
        "Donor profile deactivated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
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