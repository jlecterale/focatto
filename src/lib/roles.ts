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

export type ProductStatus = "pending" | "approved" | "rejected";

export interface ProductData {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  city: string;
  state: string;
  photos: string[];
  status: ProductStatus;
  adminNotes: string;
  reviewedBy: string;
  createdAt: number;
  updatedAt: number;
  reviewedAt: number;
  views?: number;
}

export interface TeacherData {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  bio: string;
  city: string;
  state: string;
  neighborhood: string;
  photoURL?: string;
  rating?: number;
  specialties: string[];
  pricePerHour?: number;
  levels?: string[];
  modalities?: string[];
  targetAudience?: string[];
  omb?: string;
  status?: VerificationStatus;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LuthierData {
  id?: string;
  userId: string;
  userEmail: string;
  name: string;
  phone: string;
  bio: string;
  city: string;
  state: string;
  neighborhood: string;
  photo?: string;
  averageRating?: number;
  specialties: string[];
  status?: VerificationStatus;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}


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
  isProfessional: boolean;
  isTeacher?: boolean;
  verificationStatus: VerificationStatus;
  luthierStatus?: VerificationStatus;
  teacherStatus?: VerificationStatus;
  sellerAbout?: string;
  sellerMusic?: string;
  sellerHobbies?: string;
  sellerFunFacts?: string;
  createdAt: number;
  updatedAt: number;
  isPremium?: boolean;
  premiumTier?: string;
  premiumBilling?: "monthly" | "yearly";
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

export interface RatingData {
  id?: string;
  productId?: string;
  sellerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface SellerStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
}

export interface FavoriteData {
  id?: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  sellerId: string;
  createdAt: number;
}

export interface ProposalData {
  id?: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  sellerName: string;
  senderId: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  value: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
}
