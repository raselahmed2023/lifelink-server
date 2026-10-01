
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma.js";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const registerUser = async (
  payload: RegisterPayload
) => {
  const { name, email, password, phone } = payload;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    password.length > 128 ||
    (
      phone !== undefined &&
      typeof phone !== "string"
    )
  ) {
    throw new Error(
      "Enter a valid name, email and password (8+ characters)"
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error(
      "User already exists with this email"
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (
  payload: LoginPayload
) => {
  const { email, password } = payload;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    throw new Error(
      "Email and password are required"
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user || user.isDeleted) {
    throw new Error(
      "Invalid email or password"
    );
  }

  if (user.status === "BLOCKED") {
    throw new Error(
      "Your account has been blocked"
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not defined"
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
