import { Router } from "express";
import { DonorController } from "./donor.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, DonorController.createDonor);

router.get("/", DonorController.getAllDonors);

router.get("/:id", DonorController.getDonorById);

router.patch(
  "/:id",
  authMiddleware,
  DonorController.updateDonor
);

router.delete(
  "/:id",
  authMiddleware,
  DonorController.deleteDonor
);

export default router;