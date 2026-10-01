
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

    if (
      typeof req.body.donorId !== "string" ||
      req.body.donorId.length > 60 ||
      (
        req.body.message !== undefined &&
        (
          typeof req.body.message !== "string" ||
          req.body.message.length > 1000
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request",
        data: null,
      });
    }

    const result =
      await ContactRequestService.createContactRequest({
        requesterId: req.user.userId,
        donorId: req.body.donorId,
        message: req.body.message,
      });

    return res.status(201).json({
      success: true,
      message: "Contact request sent successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
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

    return res.status(200).json({
      success: true,
      message: "Contact requests retrieved successfully",
      data: result,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact requests",
      data: null,
    });
  }
};

const getIncomingRequests = async (
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
      await ContactRequestService.getIncomingRequests(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Incoming contact requests retrieved",
      data: result,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve incoming requests",
      data: null,
    });
  }
};

const getOutgoingRequests = async (
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
      await ContactRequestService.getOutgoingRequests(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Outgoing contact requests retrieved",
      data: result,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve outgoing requests",
      data: null,
    });
  }
};

const getContactRequestById = async (
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
    const result =
      await ContactRequestService.getContactRequestById(
        req.params.id as string,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Contact request retrieved successfully",
      data: result,
    });
  } catch {
    return res.status(404).json({
      success: false,
      message: "Contact request not found",
      data: null,
    });
  }
};

const updateContactRequest = async (
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
    const { status } = req.body;

    const result =
      await ContactRequestService.updateContactRequestStatus(
        req.params.id as string,
        req.user.userId,
        status
      );

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "Contact request approved"
          : "Contact request rejected",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update contact request",
      data: null,
    });
  }
};

export const ContactRequestController = {
  createContactRequest,
  getAllContactRequests,
  getIncomingRequests,
  getOutgoingRequests,
  getContactRequestById,
  updateContactRequest,
};
