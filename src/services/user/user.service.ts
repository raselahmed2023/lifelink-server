import prisma from "../../lib/prisma.js";

type UpdateUserPayload = {
  name?: string;
  phone?: string;
};

type UserStatus =
  | "ACTIVE"
  | "BLOCKED";

const getAllUsers = async () => {
  const users =
    await prisma.user.findMany({
      where: {
        isDeleted: false,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        donorProfile: {
          where: {
            isDeleted: false,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return users;
};

const getUserById = async (
  id: string
) => {
  const user =
    await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        donorProfile: true,
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  return user;
};

const updateUser = async (
  id: string,
  payload: UpdateUserPayload
) => {
  const existingUser =
    await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!existingUser) {
    throw new Error(
      "User not found"
    );
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id,
      },

      data: {
        name:
          payload.name !== undefined
            ? payload.name.trim()
            : undefined,

        phone:
          payload.phone !== undefined
            ? payload.phone.trim()
            : undefined,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};

const updateUserStatus = async (
  id: string,
  status: UserStatus
) => {
  if (
    status !== "ACTIVE" &&
    status !== "BLOCKED"
  ) {
    throw new Error(
      "Invalid user status"
    );
  }

  const existingUser =
    await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!existingUser) {
    throw new Error(
      "User not found"
    );
  }

  /*
    Prevent one admin from
    blocking another admin.
  */
  if (
    existingUser.role === "ADMIN"
  ) {
    throw new Error(
      "Admin accounts cannot be blocked from this endpoint"
    );
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id,
      },

      data: {
        status,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};

const deleteUser = async (
  id: string
) => {
  const existingUser =
    await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!existingUser) {
    throw new Error(
      "User not found"
    );
  }

  if (
    existingUser.role === "ADMIN"
  ) {
    throw new Error(
      "Admin account cannot be deleted from this endpoint"
    );
  }

  const deletedUser =
    await prisma.user.update({
      where: {
        id,
      },

      data: {
        isDeleted: true,
        status: "BLOCKED",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isDeleted: true,
      },
    });

  return deletedUser;
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};