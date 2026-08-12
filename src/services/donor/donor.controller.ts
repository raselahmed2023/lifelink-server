import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import type { BloodGroup } from "../../generated/prisma/client.js";
import { DonorService } from "./donor.service.js";

const createDonor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const result = await DonorService.createDonor({
      ...req.body,
      userId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Donor profile created successfully",
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

const getAllDonors = async (req: AuthRequest, res: Response) => {
  try {
    const { bloodGroup, district } = req.query;

    const result = await DonorService.getAllDonors({
      bloodGroup: bloodGroup as BloodGroup | undefined,
      district: district as string | undefined,
    });

    res.status(200).json({
      success: true,
      message: "Donors retrieved successfully",
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

const getDonorById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await DonorService.getDonorById(id);

    res.status(200).json({
      success: true,
      message: "Donor retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Donor not found",
      data: null,
    });
  }
};

const updateDonor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const { id } = req.params;

    const donor = await DonorService.getDonorById(id);

    if (
      req.user.role !== "ADMIN" &&
      donor.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own donor profile",
        data: null,
      });
    }

    const result = await DonorService.updateDonor(id, req.body);

    res.status(200).json({
      success: true,
      message: "Donor profile updated successfully",
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

const deleteDonor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    const { id } = req.params;

    const donor = await DonorService.getDonorById(id);

    if (
      req.user.role !== "ADMIN" &&
      donor.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own donor profile",
        data: null,
      });
    }

    const result = await DonorService.deleteDonor(id);

    res.status(200).json({
      success: true,
      message: "Donor profile deleted successfully",
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

export const DonorController = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};