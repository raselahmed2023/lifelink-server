
import prisma from "../../lib/prisma.js";

type CreateContactRequestPayload = {
  requesterId: string;
  donorId: string;
  message?: string;
};

type ContactStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

const createContactRequest = async (
  payload: CreateContactRequestPayload
) => {
  const requester =
    await prisma.user.findFirst({
      where: {
        id: payload.requesterId,
        isDeleted: false,
        status: "ACTIVE",
      },
    });

  if (!requester) {
    throw new Error(
      "Requester account not found"
    );
  }

  const donor =
    await prisma.donorProfile.findFirst({
      where: {
        id: payload.donorId,
        isDeleted: false,
        isAvailable: true,
      },
      include: {
        user: true,
      },
    });

  if (!donor) {
    throw new Error(
      "Donor is not available"
    );
  }

  if (donor.userId === payload.requesterId) {
    throw new Error(
      "You cannot send a contact request to yourself"
    );
  }

  const existingRequest =
    await prisma.contactRequest.findFirst({
      where: {
        requesterId: payload.requesterId,
        donorId: payload.donorId,
        status: "PENDING",
        isDeleted: false,
      },
    });

  if (existingRequest) {
    throw new Error(
      "You already have a pending request for this donor"
    );
  }

  return prisma.contactRequest.create({
    data: {
      requesterId: payload.requesterId,
      donorId: payload.donorId,
      message: payload.message?.trim(),
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

const getIncomingRequests = async (
  userId: string
) => {
  return prisma.contactRequest.findMany({
    where: {
      isDeleted: false,
      donor: {
        userId,
        isDeleted: false,
      },
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
        select: {
          id: true,
          bloodGroup: true,
          district: true,
          area: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOutgoingRequests = async (
  userId: string
) => {
  const requests =
    await prisma.contactRequest.findMany({
      where: {
        requesterId: userId,
        isDeleted: false,
      },
      include: {
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

  return requests.map((request) => ({
    id: request.id,
    requesterId: request.requesterId,
    donorId: request.donorId,
    message: request.message,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,

    donor: {
      id: request.donor.id,
      bloodGroup: request.donor.bloodGroup,
      district: request.donor.district,
      area: request.donor.area,
      name: request.donor.user.name,
    },

    donorContact:
      request.status === "APPROVED"
        ? {
            email: request.donor.user.email,
            phone: request.donor.user.phone,
          }
        : null,
  }));
};

const getContactRequestById = async (
  id: string,
  viewerId: string,
  role: string
) => {
  const request =
    await prisma.contactRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        requesterId: true,
        donorId: true,
        status: true,
        message: true,
        createdAt: true,
        updatedAt: true,

        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        donor: {
          select: {
            userId: true,
            id: true,
            bloodGroup: true,
            district: true,
            area: true,

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

  if (
    !request ||
    (
      role !== "ADMIN" &&
      request.requesterId !== viewerId &&
      request.donor.userId !== viewerId
    )
  ) {
    throw new Error(
      "Contact request not found or access denied"
    );
  }

  const showDonorContact =
    role === "ADMIN" ||
    request.donor.userId === viewerId ||
    request.status === "APPROVED";

  const showRequesterContact =
    role === "ADMIN" ||
    request.donor.userId === viewerId ||
    request.requesterId === viewerId;

  return {
    ...request,

    requester: {
      ...request.requester,
      email: showRequesterContact
        ? request.requester.email
        : null,
      phone: showRequesterContact
        ? request.requester.phone
        : null,
    },

    donor: {
      ...request.donor,

      user: {
        ...request.donor.user,
        email: showDonorContact
          ? request.donor.user.email
          : null,
        phone: showDonorContact
          ? request.donor.user.phone
          : null,
      },
    },
  };
};

const updateContactRequestStatus = async (
  id: string,
  userId: string,
  status: ContactStatus
) => {
  if (
    status !== "APPROVED" &&
    status !== "REJECTED"
  ) {
    throw new Error(
      "Status must be APPROVED or REJECTED"
    );
  }

  const request =
    await prisma.contactRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        donor: true,
      },
    });

  if (!request) {
    throw new Error(
      "Contact request not found"
    );
  }

  if (request.donor.userId !== userId) {
    throw new Error(
      "Only the donor can approve or reject this contact request"
    );
  }

  if (request.status !== "PENDING") {
    throw new Error(
      "This contact request has already been reviewed"
    );
  }

  return prisma.contactRequest.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const deleteContactRequest = async (
  id: string
) => {
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
  getIncomingRequests,
  getOutgoingRequests,
  getContactRequestById,
  updateContactRequestStatus,
  deleteContactRequest,
};
