export type UserRole = "admin" | "user";

export const ROLES = {
  ADMIN: "admin" as UserRole,
  USER: "user" as UserRole,
} as const;

export const ADMIN_EMAILS = [
  "jfreire.comercial@gmail.com",
];

export interface UserAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  cpfCnpj: string;
  photoURL: string;
  bio: string;
  address: UserAddress;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentPhoto: string;
  facePhoto: string;
  status: VerificationStatus;
  adminNotes: string;
  reviewedBy: string;
  submittedAt: number;
  reviewedAt: number;
}
