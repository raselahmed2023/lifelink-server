import prisma from "../../lib/prisma.js";

const getAllUsers = async () => {
  return prisma.user.findMany({
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
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
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUser = async (
  id: string,
  payload: {
    name?: string;
    phone?: string;
  }
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      name: payload.name,
      phone: payload.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isDeleted: true,
    },
  });
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};