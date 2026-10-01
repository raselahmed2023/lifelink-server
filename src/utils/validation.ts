
export const bloodGroups = new Set([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);

export const nonEmpty = (
  value: unknown,
  max = 150
): value is string => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max
  );
};

export const optionalText = (
  value: unknown,
  max = 1000
) => {
  return (
    value === undefined ||
    value === null ||
    (
      typeof value === "string" &&
      value.length <= max
    )
  );
};

export const validBloodGroup = (
  value: unknown
): value is string => {
  return (
    typeof value === "string" &&
    bloodGroups.has(value)
  );
};

export const validDate = (
  value: unknown,
  allowNull = false
) => {
  return (
    (
      allowNull &&
      value === null
    ) ||
    (
      typeof value === "string" &&
      value.length <= 40 &&
      !Number.isNaN(
        new Date(value).getTime()
      )
    )
  );
};

export const validBDPhone = (
  value: unknown
): value is string => {
  return (
    typeof value === "string" &&
    /^(?:\+?880|0)1[3-9]\d{8}$/.test(
      value.replace(/[ -]/g, "")
    )
  );
};

export const validateBloodRequest = (
  payload: Record<string, unknown>,
  partial = false
) => {
  const required: Record<
    string,
    (value: unknown) => boolean
  > = {
    patientName: (value) =>
      nonEmpty(value, 100),

    bloodGroup: validBloodGroup,

    hospital: (value) =>
      nonEmpty(value, 150),

    district: (value) =>
      nonEmpty(value, 100),

    requiredDate: (value) =>
      validDate(value),

    phone: validBDPhone,
  };

  for (
    const [field, check]
    of Object.entries(required)
  ) {
    if (
      !partial ||
      payload[field] !== undefined
    ) {
      if (!check(payload[field])) {
        return `${field} is invalid or missing`;
      }
    }
  }

  if (!optionalText(payload.message, 1500)) {
    return "message is invalid";
  }

  return null;
};

export const validateDonorProfile = (
  payload: Record<string, unknown>,
  partial = false
) => {
  if (
    (
      !partial ||
      payload.bloodGroup !== undefined
    ) &&
    !validBloodGroup(payload.bloodGroup)
  ) {
    return "Invalid blood group";
  }

  if (
    (
      !partial ||
      payload.district !== undefined
    ) &&
    !nonEmpty(payload.district, 100)
  ) {
    return "Invalid district";
  }

  if (!optionalText(payload.area, 100)) {
    return "Invalid area";
  }

  if (
    payload.lastDonation !== undefined &&
    !validDate(payload.lastDonation, true)
  ) {
    return "Invalid last donation date";
  }

  if (
    payload.lastDonation &&
    new Date(
      payload.lastDonation as string
    ).getTime() > Date.now()
  ) {
    return "Last donation cannot be in future";
  }

  if (
    payload.isAvailable !== undefined &&
    typeof payload.isAvailable !== "boolean"
  ) {
    return "Availability must be boolean";
  }

  return null;
};
