import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

import { BloodRequestController } from "./bloodRequest.controller.js";

const router = Router();

/*
  Public:
  create নয়, শুধু browse.
*/
router.get(
  "/",
  BloodRequestController.getAllBloodRequests
);

/*
  Logged-in user:
  submit request.
*/
router.post(
  "/",
  authMiddleware,
  BloodRequestController.createBloodRequest
);

/*
  ADMIN ONLY:
  Status change.

  Important:
  specific /status route
  comes before /:id
*/
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  BloodRequestController.updateBloodRequestStatus
);

/*
  USER:
  Edit own pending request details.

  status change এখানে possible না।
*/
router.patch(
  "/:id",
  authMiddleware,
  BloodRequestController.updateMyBloodRequest
);

router.get(
  "/:id",
  BloodRequestController.getBloodRequestById
);

router.delete(
  "/:id",
  authMiddleware,
  BloodRequestController.deleteBloodRequest
);

export default router;