import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { ContactRequestService } from "./contactRequest.service.js";

const createContactRequest = async (
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
      await ContactRequestService.createContactRequest({
        ...req.body,
        requesterId: req.user.userId,
      });

    res.status(201).json({
      success: true,
      message: "Contact request created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create contact request",
      data: null,
    });
  }
};

const getAllContactRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result =
      await ContactRequestService.getAllContactRequests();

    res.status(200).json({
      success: true,
      message: "Contact requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve contact requests",
      data: null,
    });
  }
};

const getContactRequestById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const result =
      await ContactRequestService.getContactRequestById(id);

    res.status(200).json({
      success: true,
      message: "Contact request retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Contact request not found",
      data: null,
    });
  }
};

const updateContactRequest = async (
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

    const contactRequest =
      await ContactRequestService.getContactRequestById(id);

    const donorOwnerId = contactRequest.donor.userId;

    if (
      req.user.role !== "ADMIN" &&
      donorOwnerId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the donor or an admin can update this contact request",
        data: null,
      });
    }

    const result =
      await ContactRequestService.updateContactRequest(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Contact request updated successfully",
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

const deleteContactRequest = async (
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

    const contactRequest =
      await ContactRequestService.getContactRequestById(id);

    const donorOwnerId = contactRequest.donor.userId;

    if (
      req.user.role !== "ADMIN" &&
      contactRequest.requesterId !== req.user.userId &&
      donorOwnerId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this contact request",
        data: null,
      });
    }

    const result =
      await ContactRequestService.deleteContactRequest(id);

    res.status(200).json({
      success: true,
      message: "Contact request deleted successfully",
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

export const ContactRequestController = {
  createContactRequest,
  getAllContactRequests,
  getContactRequestById,
  updateContactRequest,
  deleteContactRequest,
};