export type Category = "instrumentos" | "acessorios" | "luthier";
export type Subcategory =
  | "guitarra"
  | "baixo"
  | "bateria"
  | "teclado"
  | "violao"
  | "sopros"
  | "pedais"
  | "cabos"
  | "cordas"
  | "captadores"
  | "cases"
  | "palhetas"
  | "outros";

export type Condition =
  | "novo"
  | "como_novo"
  | "excelente"
  | "bom"
  | "desgastado"
  | "restauro";

export type Handedness = "destro" | "canhoto";
export type ListingType = "venda" | "troca" | "proposta";

export interface ProductImage {
  id: string;
  url: string;
  thumb: string;
  alt?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  title: string;
  description: string;
  category: Category;
  subcategory: Subcategory;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  condition: Condition;
  handedness?: Handedness;
  listingType: ListingType;
  price: number;
  acceptsTrade: boolean;
  acceptsProposal: boolean;
  shipping?: number;
  images: ProductImage[];
  city: string;
  state: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "sold" | "inactive" | "pending";
  views: number;
  favoritesCount: number;
}

export interface LuthierService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: "regulagem" | "eletrica" | "trastes" | "restauro" | "customizacao" | "outro";
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  createdAt: number;
}

export interface LuthierReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceId?: string;
  createdAt: number;
}

export interface Luthier {
  id: string;
  userId: string;
  name: string;
  photo?: string;
  bio: string;
  phone: string;
  city: string;
  state: string;
  specialties: string[];
  services: LuthierService[];
  portfolio: PortfolioItem[];
  reviews: LuthierReview[];
  averageRating: number;
  totalReviews: number;
  available: boolean;
  createdAt: number;
}

export interface Appointment {
  id: string;
  luthierId: string;
  luthierName: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  description: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  image?: string;
  createdAt: number;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  lastMessage?: string;
  lastMessageAt?: number;
  lastSenderId?: string;
  unreadCount: Record<string, number>;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  city?: string;
  state?: string;
  bio?: string;
  favorites: string[];
  createdAt: number;
  isAdmin?: boolean;
}

export interface Proposal {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "countered";
  counterAmount?: number;
  createdAt: number;
  updatedAt: number;
}

export type SortOption = "recentes" | "preco_asc" | "preco_desc" | "populares";

export interface ProductFilters {
  search?: string;
  category?: Category;
  subcategory?: Subcategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition[];
  handedness?: Handedness;
  city?: string;
  state?: string;
  listingType?: ListingType;
  sort?: SortOption;
  minYear?: number;
  maxYear?: number;
}
