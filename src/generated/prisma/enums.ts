

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const BloodGroup = {
  A_POSITIVE: 'A_POSITIVE',
  A_NEGATIVE: 'A_NEGATIVE',
  B_POSITIVE: 'B_POSITIVE',
  B_NEGATIVE: 'B_NEGATIVE',
  AB_POSITIVE: 'AB_POSITIVE',
  AB_NEGATIVE: 'AB_NEGATIVE',
  O_POSITIVE: 'O_POSITIVE',
  O_NEGATIVE: 'O_NEGATIVE'
} as const

export type BloodGroup = (typeof BloodGroup)[keyof typeof BloodGroup]


export const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
} as const

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus]
