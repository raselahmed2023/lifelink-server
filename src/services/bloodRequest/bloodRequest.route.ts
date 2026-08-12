import { Router } from "express";
import { BloodRequestController } from "./bloodRequest.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  BloodRequestController.createBloodRequest
);

router.get(
  "/",
  BloodRequestController.getAllBloodRequests
);

router.get(
  "/:id",
  BloodRequestController.getBloodRequestById
);

router.patch(
  "/:id",
  authMiddleware,
  BloodRequestController.updateBloodRequest
);

router.delete(
  "/:id",
  authMiddleware,
  BloodRequestController.deleteBloodRequest
);

export default router;