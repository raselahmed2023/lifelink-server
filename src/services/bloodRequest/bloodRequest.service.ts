
import prisma from "../../lib/prisma.js";

type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

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
};

const createBloodRequest = async (
  payload: CreateBloodRequestPayload
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      isDeleted: false,
      status: "ACTIVE",
    },
  });

  if (!user) {
    throw new Error(
      "User account not found or inactive"
    );
  }

  return prisma.bloodRequest.create({
    data: {
      userId: payload.userId,
      patientName: payload.patientName.trim(),
      bloodGroup: payload.bloodGroup,
      hospital: payload.hospital.trim(),
      district: payload.district.trim(),
      requiredDate: new Date(payload.requiredDate),
      phone: payload.phone.trim(),
      message: payload.message?.trim() || null,
      status: "PENDING",
    },
  });
};

const publicRequestSelect = {
  id: true,
  bloodGroup: true,
  hospital: true,
  district: true,
  requiredDate: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getPublicBloodRequests = async (
  filters?: {
    bloodGroup?: string;
    district?: string;
  }
) => {
  return prisma.bloodRequest.findMany({
    where: {
      isDeleted: false,
      status: "APPROVED",
      ...(filters?.bloodGroup
        ? {
            bloodGroup:
              filters.bloodGroup as BloodGroup,
          }
        : {}),
      ...(filters?.district
        ? {
            district: {
              contains: filters.district,
              mode: "insensitive" as const,
            },
          }
        : {}),
    },
    select: publicRequestSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMyBloodRequests = async (
  userId: string
) => {
  return prisma.bloodRequest.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPublicBloodRequestById = async (
  id: string
) => {
  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        status: "APPROVED",
        isDeleted: false,
      },
      select: publicRequestSelect,
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  return request;
};

const getBloodRequestContact = async (
  id: string,
  userId: string
) => {
  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        status: "APPROVED",
        isDeleted: false,
      },
      select: {
        id: true,
        phone: true,
        userId: true,
      },
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  if (request.userId !== userId) {
    const donor =
      await prisma.donorProfile.findFirst({
        where: {
          userId,
          isDeleted: false,
          isAvailable: true,
        },
        select: {
          id: true,
        },
      });

    if (!donor) {
      throw new Error(
        "An available donor profile is required to view contact information"
      );
    }
  }

  return {
    phone: request.phone,
  };
};

const getAllBloodRequests = async (
  filters?: {
    bloodGroup?: string;
    district?: string;
    status?: string;
  }
) => {
  return prisma.bloodRequest.findMany({
    where: {
      isDeleted: false,
      ...(filters?.bloodGroup
        ? {
            bloodGroup:
              filters.bloodGroup as BloodGroup,
          }
        : {}),
      ...(filters?.district
        ? {
            district: {
              contains: filters.district,
              mode: "insensitive",
            },
          }
        : {}),
      ...(filters?.status
        ? {
            status:
              filters.status as RequestStatus,
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getBloodRequestById = async (
  id: string
) => {
  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  return request;
};

const updateBloodRequestByOwner = async (
  id: string,
  userId: string,
  payload: UpdateBloodRequestPayload
) => {
  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  if (request.userId !== userId) {
    throw new Error(
      "You can only update your own blood request"
    );
  }

  if (request.status !== "PENDING") {
    throw new Error(
      "Only pending blood requests can be edited"
    );
  }

  return prisma.bloodRequest.update({
    where: {
      id,
    },
    data: {
      patientName:
        payload.patientName !== undefined
          ? payload.patientName.trim()
          : undefined,

      bloodGroup: payload.bloodGroup,

      hospital:
        payload.hospital !== undefined
          ? payload.hospital.trim()
          : undefined,

      district:
        payload.district !== undefined
          ? payload.district.trim()
          : undefined,

      requiredDate:
        payload.requiredDate !== undefined
          ? new Date(payload.requiredDate)
          : undefined,

      phone:
        payload.phone !== undefined
          ? payload.phone.trim()
          : undefined,

      message:
        payload.message !== undefined
          ? payload.message?.trim() || null
          : undefined,
    },
  });
};

const updateBloodRequestStatus = async (
  id: string,
  status: RequestStatus
) => {
  const allowedStatuses: RequestStatus[] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      "Invalid blood request status"
    );
  }

  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  return prisma.bloodRequest.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const deleteBloodRequest = async (
  id: string,
  userId: string,
  role: string
) => {
  const request =
    await prisma.bloodRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!request) {
    throw new Error(
      "Blood request not found"
    );
  }

  if (
    role !== "ADMIN" &&
    request.userId !== userId
  ) {
    throw new Error(
      "You cannot delete this blood request"
    );
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
  getPublicBloodRequests,
  getMyBloodRequests,
  getPublicBloodRequestById,
  getBloodRequestContact,
  getAllBloodRequests,
  getBloodRequestById,
  updateBloodRequestByOwner,
  updateBloodRequestStatus,
  deleteBloodRequest,
};
