import prisma from "../../lib/prisma.js";
import type {
  BloodGroup,
  RequestStatus,
} from "../../generated/prisma/client.js";

type CreateBloodRequestPayload = {
  userId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospital: string;
  district: string;
  requiredDate: string;
  phone: string;
  message?: string;
};

type UpdateBloodRequestPayload = {
  patientName?: string;
  bloodGroup?: BloodGroup;
  hospital?: string;
  district?: string;
  requiredDate?: string;
  phone?: string;
  message?: string | null;
  status?: RequestStatus;
};

const createBloodRequest = async (
  payload: CreateBloodRequestPayload
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.bloodRequest.create({
    data: {
      userId: payload.userId,
      patientName: payload.patientName,
      bloodGroup: payload.bloodGroup,
      hospital: payload.hospital,
      district: payload.district,
      requiredDate: new Date(payload.requiredDate),
      phone: payload.phone,
      message: payload.message,
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

const getAllBloodRequests = async (query: {
  bloodGroup?: BloodGroup;
  district?: string;
  status?: RequestStatus;
}) => {
  return prisma.bloodRequest.findMany({
    where: {
      isDeleted: false,
      bloodGroup: query.bloodGroup,
      status: query.status,
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

const getBloodRequestById = async (id: string) => {
  const request = await prisma.bloodRequest.findFirst({
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

  if (!request) {
    throw new Error("Blood request not found");
  }

  return request;
};

const updateBloodRequest = async (
  id: string,
  payload: UpdateBloodRequestPayload
) => {
  const existingRequest = await prisma.bloodRequest.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingRequest) {
    throw new Error("Blood request not found");
  }

  return prisma.bloodRequest.update({
    where: {
      id,
    },
    data: {
      patientName: payload.patientName,
      bloodGroup: payload.bloodGroup,
      hospital: payload.hospital,
      district: payload.district,
      requiredDate: payload.requiredDate
        ? new Date(payload.requiredDate)
        : undefined,
      phone: payload.phone,
      message: payload.message,
      status: payload.status,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const deleteBloodRequest = async (id: string) => {
  const existingRequest = await prisma.bloodRequest.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingRequest) {
    throw new Error("Blood request not found");
  }

  return prisma.bloodRequest.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const BloodRequestService = {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
};