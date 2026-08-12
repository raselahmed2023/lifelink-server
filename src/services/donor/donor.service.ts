import prisma from "../../lib/prisma.js";
import type { BloodGroup } from "../../generated/prisma/client.js";

type CreateDonorPayload = {
  userId: string;
  bloodGroup: BloodGroup;
  district: string;
  area?: string;
  lastDonation?: string;
  isAvailable?: boolean;
};

type UpdateDonorPayload = {
  bloodGroup?: BloodGroup;
  district?: string;
  area?: string;
  lastDonation?: string | null;
  isAvailable?: boolean;
};

const createDonor = async (payload: CreateDonorPayload) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      isDeleted: false,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const existingDonor = await prisma.donorProfile.findUnique({
    where: {
      userId: payload.userId,
    },
  });

  if (existingDonor) {
    throw new Error("Donor profile already exists");
  }

  return prisma.donorProfile.create({
    data: {
      userId: payload.userId,
      bloodGroup: payload.bloodGroup,
      district: payload.district,
      area: payload.area,
      lastDonation: payload.lastDonation
        ? new Date(payload.lastDonation)
        : undefined,
      isAvailable: payload.isAvailable ?? true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

const getAllDonors = async (query: {
  bloodGroup?: BloodGroup;
  district?: string;
}) => {
  return prisma.donorProfile.findMany({
    where: {
      isDeleted: false,
      isAvailable: true,
      bloodGroup: query.bloodGroup,
      district: query.district
        ? {
            contains: query.district,
            mode: "insensitive",
          }
        : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getDonorById = async (id: string) => {
  const donor = await prisma.donorProfile.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!donor) {
    throw new Error("Donor not found");
  }

  return donor;
};

const updateDonor = async (
  id: string,
  payload: UpdateDonorPayload
) => {
  const existingDonor = await prisma.donorProfile.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingDonor) {
    throw new Error("Donor not found");
  }

  return prisma.donorProfile.update({
    where: {
      id,
    },
    data: {
      bloodGroup: payload.bloodGroup,
      district: payload.district,
      area: payload.area,
      lastDonation:
        payload.lastDonation === null
          ? null
          : payload.lastDonation
          ? new Date(payload.lastDonation)
          : undefined,
      isAvailable: payload.isAvailable,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

const deleteDonor = async (id: string) => {
  const existingDonor = await prisma.donorProfile.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingDonor) {
    throw new Error("Donor not found");
  }

  return prisma.donorProfile.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      isAvailable: false,
    },
  });
};

export const DonorService = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};