
import type {
  Request,
  Response,
  NextFunction,
} from "express";

const attempts = new Map<
  string,
  { count: number; expires: number }
>();

export const authRateLimit = (
  limit: number,
  windowMs: number
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const key = `${req.ip || "unknown"}:${req.path}`;
    const now = Date.now();
    const current = attempts.get(key);

    if (attempts.size > 10000) {
      for (const [k, v] of attempts) {
        if (v.expires <= now) {
          attempts.delete(k);
        }
      }
    }

    if (
      current &&
      current.expires > now &&
      current.count >= limit
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Try again later.",
        data: null,
      });
    }

    attempts.set(
      key,
      !current || current.expires <= now
        ? { count: 1, expires: now + windowMs }
        : {
            count: current.count + 1,
            expires: current.expires,
          }
    );

    next();
  };
};
