import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import authRoutes from "./services/auth/auth.route.js";
import userRoutes from "./services/user/user.route.js";
import donorRoutes from "./services/donor/donor.route.js";
import bloodRequestRoutes from "./services/bloodRequest/bloodRequest.route.js";
import contactRequestRoutes from "./services/contactRequest/contactRequest.route.js";

import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Life-Link API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/contact-requests", contactRequestRoutes);


app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;