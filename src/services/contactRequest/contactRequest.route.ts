import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/authorize.middleware.js";
import { ContactRequestController } from "./contactRequest.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  ContactRequestController.createContactRequest
);

/*
  Important:
  /my routes MUST stay before /:id
*/

router.get(
  "/my/incoming",
  authMiddleware,
  ContactRequestController.getIncomingRequests
);

router.get(
  "/my/outgoing",
  authMiddleware,
  ContactRequestController.getOutgoingRequests
);

/*
  Admin can ONLY monitor all requests.
  Admin cannot approve/reject.
*/

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

export default router;