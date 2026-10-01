
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import { DonorController } from "./donor.controller.js";

const router = Router();

router.get(
  "/",
  DonorController.getAllDonors
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("ADMIN"),
  (req, res) => {
    return DonorController.getAllDonors(
      req,
      res,
      true
    );
  }
);

router.post(
  "/",
  authMiddleware,
  DonorController.createDonor
);

router.get(
  "/:id",
  DonorController.getDonorById
);

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
