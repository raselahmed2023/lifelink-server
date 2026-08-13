import prisma from "../../lib/prisma.js";

type CreateDonorPayload = {
  userId: string;
  bloodGroup:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";

  district: string;
  area?: string;
  lastDonation?: string | null;
  isAvailable?: boolean;
};

type UpdateDonorPayload = {
  bloodGroup?:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";

  district?: string;
  area?: string | null;
  lastDonation?: string | null;
  isAvailable?: boolean;
};

const createDonor = async (
  payload: CreateDonorPayload
) => {
  const user =
    await prisma.user.findFirst({
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

  const existingDonor =
    await prisma.donorProfile.findFirst({
      where: {
        userId: payload.userId,
        isDeleted: false,
      },
    });

  if (existingDonor) {
    throw new Error(
      "You already have a donor profile"
    );
  }

  const donor =
    await prisma.donorProfile.create({
      data: {
        userId: payload.userId,
        bloodGroup:
          payload.bloodGroup,

        district:
          payload.district.trim(),

        area:
          payload.area?.trim() ||
          null,

        lastDonation:
          payload.lastDonation
            ? new Date(
                payload.lastDonation
              )
            : null,

        isAvailable:
          payload.isAvailable ??
          true,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return donor;
};

const getAllDonors = async (
  bloodGroup?: string,
  district?: string
) => {
  const donors =
    await prisma.donorProfile.findMany({
      where: {
        isDeleted: false,

        user: {
          isDeleted: false,
          status: "ACTIVE",
        },

        ...(bloodGroup
          ? {
              bloodGroup:
                bloodGroup as
                  | "A_POSITIVE"
                  | "A_NEGATIVE"
                  | "B_POSITIVE"
                  | "B_NEGATIVE"
                  | "AB_POSITIVE"
                  | "AB_NEGATIVE"
                  | "O_POSITIVE"
                  | "O_NEGATIVE",
            }
          : {}),

        ...(district
          ? {
              district: {
                contains:
                  district,
                mode: "insensitive",
              },
            }
          : {}),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return donors;
};

const getDonorById = async (
  id: string
) => {
  const donor =
    await prisma.donorProfile.findFirst({
      where: {
        id,
        isDeleted: false,

        user: {
          isDeleted: false,
          status: "ACTIVE",
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  if (!donor) {
    throw new Error(
      "Donor not found"
    );
  }

  return donor;
};

const updateDonor = async (
  id: string,
  userId: string,
  role: string,
  payload: UpdateDonorPayload
) => {
  const donor =
    await prisma.donorProfile.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!donor) {
    throw new Error(
      "Donor profile not found"
    );
  }

  /*
    Donor can update own profile.
    Admin can also moderate it.
  */
  if (
    role !== "ADMIN" &&
    donor.userId !== userId
  ) {
    throw new Error(
      "You can only update your own donor profile"
    );
  }

  if (
    payload.district !==
      undefined &&
    !payload.district.trim()
  ) {
    throw new Error(
      "District cannot be empty"
    );
  }

  const updatedDonor =
    await prisma.donorProfile.update({
      where: {
        id,
      },

      data: {
        bloodGroup:
          payload.bloodGroup,

        district:
          payload.district !==
          undefined
            ? payload.district.trim()
            : undefined,

        area:
          payload.area !==
          undefined
            ? payload.area?.trim() ||
              null
            : undefined,

        lastDonation:
          payload.lastDonation !==
          undefined
            ? payload.lastDonation
              ? new Date(
                  payload.lastDonation
                )
              : null
            : undefined,

        isAvailable:
          payload.isAvailable,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return updatedDonor;
};

const deleteDonor = async (
  id: string,
  userId: string,
  role: string
) => {
  const donor =
    await prisma.donorProfile.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

  if (!donor) {
    throw new Error(
      "Donor profile not found"
    );
  }

  if (
    role !== "ADMIN" &&
    donor.userId !== userId
  ) {
    throw new Error(
      "You can only delete your own donor profile"
    );
  }

  const result =
    await prisma.donorProfile.update({
      where: {
        id,
      },

      data: {
        isDeleted: true,
        isAvailable: false,
      },
    });

  return result;
};

export const DonorService = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};