
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import { BloodRequestController } from "./bloodRequest.controller.js";

const router = Router();

router.get(
  "/",
  BloodRequestController.getAllBloodRequests
);

router.post(
  "/",
  authMiddleware,
  BloodRequestController.createBloodRequest
);

router.get(
  "/my",
  authMiddleware,
  BloodRequestController.getMyBloodRequests
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("ADMIN"),
  BloodRequestController.getAdminBloodRequests
);

router.get(
  "/:id/contact",
  authMiddleware,
  BloodRequestController.getBloodRequestContact
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  BloodRequestController.updateBloodRequestStatus
);

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
