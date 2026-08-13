import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { DonorController } from "./donor.controller.js";

const router = Router();

/*
  Public:
  Browse donors
*/
router.get(
  "/",
  DonorController.getAllDonors
);

/*
  Protected:
  Become donor
*/
router.post(
  "/",
  authMiddleware,
  DonorController.createDonor
);

/*
  Public:
  Single donor
*/
router.get(
  "/:id",
  DonorController.getDonorById
);

/*
  Protected:
  Donor can update own profile.
  Admin can moderate donor profile.
*/
router.patch(
  "/:id",
  authMiddleware,
  DonorController.updateDonor
);

/*
  Protected:
  Soft deactivate donor profile.
*/
router.delete(
  "/:id",
  authMiddleware,
  DonorController.deleteDonor
);

export default router;