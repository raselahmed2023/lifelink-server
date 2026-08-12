import { Router } from "express";
import { ContactRequestController } from "./contactRequest.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  ContactRequestController.createContactRequest
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  ContactRequestController.getAllContactRequests
);

router.get(
  "/:id",
  authMiddleware,
  ContactRequestController.getContactRequestById
);

router.patch(
  "/:id",
  authMiddleware,
  ContactRequestController.updateContactRequest
);

router.delete(
  "/:id",
  authMiddleware,
  ContactRequestController.deleteContactRequest
);

export default router;