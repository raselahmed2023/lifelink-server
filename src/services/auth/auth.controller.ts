import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Registration failed",
      data: null,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
      data: null,
    });
  }
};

export const AuthController = {
  registerUser,
  loginUser,
};