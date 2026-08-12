import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import authRoutes from "./services/auth/auth.route.js";
import userRoutes from "./services/user/user.route.js";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Life-Link API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;