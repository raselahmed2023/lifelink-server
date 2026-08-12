import prisma from "../../lib/prisma.js";
import type { RequestStatus } from "../../generated/prisma/client.js";

type CreateContactRequestPayload = {
  requesterId: string;
  donorId: string;
  message?: string;
};

type UpdateContactRequestPayload = {
  status?: RequestStatus;
  message?: string | null;
};

const createContactRequest = async (
  payload: CreateContactRequestPayload
) => {
  const requester = await prisma.user.findFirst({
    where: {
      id: payload.requesterId,
      isDeleted: false,
    },
  });

  if (!requester) {
    throw new Error("Requester not found");
  }

  const donor = await prisma.donorProfile.findFirst({
    where: {
      id: payload.donorId,
      isDeleted: false,
      isAvailable: true,
    },
  });

  if (!donor) {
    throw new Error("Donor not found or unavailable");
  }

  if (donor.userId === payload.requesterId) {
    throw new Error("You cannot send a contact request to yourself");
  }

  return prisma.contactRequest.create({
    data: {
      requesterId: payload.requesterId,
      donorId: payload.donorId,
      message: payload.message,
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      donor: {
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
      },
    },
  });
};

const getAllContactRequests = async () => {
  return prisma.contactRequest.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      donor: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getContactRequestById = async (id: string) => {
  const contactRequest = await prisma.contactRequest.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      requester: true,
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!contactRequest) {
    throw new Error("Contact request not found");
  }

  return contactRequest;
};

const updateContactRequest = async (
  id: string,
  payload: UpdateContactRequestPayload
) => {
  const existingRequest = await prisma.contactRequest.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingRequest) {
    throw new Error("Contact request not found");
  }

  return prisma.contactRequest.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
      message: payload.message,
    },
  });
};

const deleteContactRequest = async (id: string) => {
  const existingRequest = await prisma.contactRequest.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingRequest) {
    throw new Error("Contact request not found");
  }

  return prisma.contactRequest.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const ContactRequestService = {
  createContactRequest,
  getAllContactRequests,
  getContactRequestById,
  updateContactRequest,
  deleteContactRequest,
};