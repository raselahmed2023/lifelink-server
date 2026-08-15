import type { Response } from "express";

import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { BloodRequestService } from "./bloodRequest.service.js";

const createBloodRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized access",
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
        message:
          "Patient name, blood group, hospital, district, required date and phone are required",
        data: null,
      });
    }

    const result =
      await BloodRequestService.createBloodRequest(
        {
          userId:
            req.user.userId,

          patientName,
          bloodGroup,
          hospital,
          district,
          requiredDate,
          phone,
          message,
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Blood request submitted successfully and is waiting for admin approval",
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

    const status =
      typeof req.query.status ===
      "string"
        ? req.query.status
        : undefined;

    const result =
      await BloodRequestService.getAllBloodRequests(
        {
          bloodGroup,
          district,
          status,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Blood requests retrieved successfully",
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

const getBloodRequestById =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const id =
        req.params.id as string;

      const result =
        await BloodRequestService.getBloodRequestById(
          id
        );

      res.status(200).json({
        success: true,
        message:
          "Blood request retrieved successfully",
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

/*
  USER endpoint:
  update request information only.
*/
const updateMyBloodRequest =
  async (
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
        IMPORTANT:
        status is NOT included.
      */
      const payload = {
        patientName:
          req.body.patientName,

        bloodGroup:
          req.body.bloodGroup,

        hospital:
          req.body.hospital,

        district:
          req.body.district,

        requiredDate:
          req.body.requiredDate,

        phone:
          req.body.phone,

        message:
          req.body.message,
      };

      const result =
        await BloodRequestService.updateBloodRequestByOwner(
          id,
          req.user.userId,
          payload
        );

      res.status(200).json({
        success: true,
        message:
          "Blood request updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update blood request",
        data: null,
      });
    }
  };

/*
  ADMIN ONLY controller.
*/
const updateBloodRequestStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const id =
        req.params.id as string;

      const { status } =
        req.body;

      if (!status) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Status is required",
            data: null,
          });
      }

      const result =
        await BloodRequestService.updateBloodRequestStatus(
          id,
          status
        );

      res.status(200).json({
        success: true,
        message:
          "Blood request status updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update blood request status",
        data: null,
      });
    }
  };

const deleteBloodRequest =
  async (
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
        await BloodRequestService.deleteBloodRequest(
          id,
          req.user.userId,
          req.user.role
        );

      res.status(200).json({
        success: true,
        message:
          "Blood request deleted successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
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
  getBloodRequestById,
  updateMyBloodRequest,
  updateBloodRequestStatus,
  deleteBloodRequest,
};