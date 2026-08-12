import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export const authorizeRoles =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
        data: null,
      });
    }

    next();
  };