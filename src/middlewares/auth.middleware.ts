
import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      data: null,
    });
  }

  const token = authorization.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "JWT_SECRET is not configured",
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    if (
      !decoded ||
      typeof decoded.userId !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: null,
      });
    }

    const activeUser = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isDeleted: false,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!activeUser) {
      return res.status(401).json({
        success: false,
        message: "Account is no longer active",
        data: null,
      });
    }

    req.user = {
      userId: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
    };

    next();
  } catch (error) {
    if (
      error instanceof Error &&
      ![
        "TokenExpiredError",
        "JsonWebTokenError",
        "NotBeforeError",
      ].includes(error.name)
    ) {
      return next(error);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
  }
};
