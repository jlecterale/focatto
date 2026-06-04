import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  setDoc,
  onSnapshot,
  DocumentReference,
  CollectionReference,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { db, storage } from "./firebase";
import type {
  Product,
  ProductImage,
  Luthier,
  Chat,
  ChatMessage,
  UserProfile,
  Appointment,
  Proposal,
  ProductFilters,
} from "@/types";

function getFirestore() {
  if (!db) throw new Error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  return db;
}

function getFirebaseStorage() {
  if (!storage) throw new Error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  return storage;
}

const COLLECTIONS = {
  products: "products",
  luthiers: "luthiers",
  chats: "chats",
  messages: "messages",
  users: "users",
  appointments: "appointments",
  proposals: "proposals",
} as const;

function dataToProduct(id: string, data: DocumentData): Product {
  return { id, ...data } as Product;
}

function dataToLuthier(id: string, data: DocumentData): Luthier {
  return { id, ...data } as Luthier;
}

function dataToChat(id: string, data: DocumentData): Chat {
  return { id, ...data } as Chat;
}

function dataToMessage(id: string, data: DocumentData): ChatMessage {
  return { id, ...data } as ChatMessage;
}

function dataToUser(id: string, data: DocumentData): UserProfile {
  return { uid: id, ...data } as UserProfile;
}

function dataToAppointment(id: string, data: DocumentData): Appointment {
  return { id, ...data } as Appointment;
}

function dataToProposal(id: string, data: DocumentData): Proposal {
  return { id, ...data } as Proposal;
}

function docData(d: any): DocumentData {
  return d.data() as DocumentData;
}

function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function getProducts(filters?: ProductFilters, lastDoc?: QueryDocumentSnapshot, pageSize = 20) {
  let q: any = collection(getFirestore(), COLLECTIONS.products);
  const constraints: any[] = [where("status", "==", "active")];

  if (filters?.category) constraints.push(where("category", "==", filters.category));
  if (filters?.subcategory) constraints.push(where("subcategory", "==", filters.subcategory));
  if (filters?.brand) constraints.push(where("brand", "==", filters.brand));
  if (filters?.condition?.length) constraints.push(where("condition", "in", filters.condition));
  if (filters?.handedness) constraints.push(where("handedness", "==", filters.handedness));
  if (filters?.listingType) constraints.push(where("listingType", "==", filters.listingType));
  if (filters?.minPrice !== undefined) constraints.push(where("price", ">=", filters.minPrice));
  if (filters?.maxPrice !== undefined) constraints.push(where("price", "<=", filters.maxPrice));

  const sortField = filters?.sort === "preco_asc" ? "price" :
    filters?.sort === "preco_desc" ? "price" :
    filters?.sort === "populares" ? "favoritesCount" : "createdAt";
  const sortDir = filters?.sort === "preco_asc" ? "asc" : "desc";

  constraints.push(orderBy(sortField, sortDir));
  constraints.push(limit(pageSize));

  if (lastDoc) constraints.push(startAfter(lastDoc));

  q = query(collection(getFirestore(), COLLECTIONS.products), ...constraints);
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => dataToProduct(d.id, docData(d) as DocumentData));
  return { products, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getFirestore(), COLLECTIONS.products, id));
  if (!snap.exists()) return null;
  return dataToProduct(snap.id, snap.data());
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.products),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToProduct(d.id, docData(d)));
}

export async function createProduct(data: Omit<Product, "id">): Promise<string> {
  const docRef = await addDoc(collection(getFirestore(), COLLECTIONS.products), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    favoritesCount: 0,
  });
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.products, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.products, id), { status: "inactive" });
}

export async function incrementProductViews(id: string) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.products, id), { views: increment(1) });
}

export function listenProduct(id: string, callback: (product: Product | null) => void) {
  return onSnapshot(doc(getFirestore(), COLLECTIONS.products, id), (snap) => {
    callback(snap.exists() ? dataToProduct(snap.id, snap.data()) : null);
  });
}

export function listenProducts(filters?: ProductFilters, callback?: (products: Product[]) => void) {
  let constraints: any[] = [where("status", "==", "active"), orderBy("createdAt", "desc"), limit(50)];
  if (filters?.category) constraints.push(where("category", "==", filters.category));
  if (filters?.subcategory) constraints.push(where("subcategory", "==", filters.subcategory));

  const q = query(collection(getFirestore(), COLLECTIONS.products), ...constraints);
  return onSnapshot(q, (snap) => {
    const products = snap.docs.map((d) => dataToProduct(d.id, docData(d)));
    callback?.(products);
  });
}

export async function uploadProductImages(
  productId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<ProductImage[]> {
  const images: ProductImage[] = [];
  const fileLimit = Math.min(files.length, 7);

  for (let i = 0; i < fileLimit; i++) {
    const file = files[i];
    const imageId = `${Date.now()}_${i}`;
    const storageRef = ref(getFirebaseStorage(), `products/${productId}/${imageId}`);

    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);

    images.push({ id: imageId, url, thumb: url });
    onProgress?.(Math.round(((i + 1) / fileLimit) * 100));
  }

  return images;
}

export async function getLuthiers(city?: string, state?: string) {
  let constraints: any[] = [where("available", "==", true)];
  if (city) constraints.push(where("city", "==", city));
  if (state) constraints.push(where("state", "==", state));
  constraints.push(orderBy("averageRating", "desc"));

  const q = query(collection(getFirestore(), COLLECTIONS.luthiers), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToLuthier(d.id, docData(d)));
}

export async function getLuthierById(id: string): Promise<Luthier | null> {
  const snap = await getDoc(doc(getFirestore(), COLLECTIONS.luthiers, id));
  if (!snap.exists()) return null;
  return dataToLuthier(snap.id, snap.data());
}

export function listenLuthier(id: string, callback: (luthier: Luthier | null) => void) {
  return onSnapshot(doc(getFirestore(), COLLECTIONS.luthiers, id), (snap) => {
    callback(snap.exists() ? dataToLuthier(snap.id, snap.data()) : null);
  });
}

export async function createOrUpdateLuthier(id: string, data: Partial<Luthier>) {
  await setDoc(doc(getFirestore(), COLLECTIONS.luthiers, id), data, { merge: true });
}

export async function createAppointment(data: Omit<Appointment, "id">): Promise<string> {
  const docRef = await addDoc(collection(getFirestore(), COLLECTIONS.appointments), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAppointmentsByUser(userId: string): Promise<Appointment[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.appointments),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToAppointment(d.id, docData(d)));
}

export async function getAppointmentsByLuthier(luthierId: string): Promise<Appointment[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.appointments),
    where("luthierId", "==", luthierId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToAppointment(d.id, docData(d)));
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.appointments, id), { status });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirestore(), COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  return dataToUser(snap.id, snap.data());
}

export async function createOrUpdateUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(getFirestore(), COLLECTIONS.users, uid), data, { merge: true });
}

export function listenUserProfile(uid: string, callback: (user: UserProfile | null) => void) {
  return onSnapshot(doc(getFirestore(), COLLECTIONS.users, uid), (snap) => {
    callback(snap.exists() ? dataToUser(snap.id, snap.data()) : null);
  });
}

export async function addFavorite(uid: string, productId: string) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.users, uid), {
    favorites: arrayUnion(productId),
  });
}

export async function removeFavorite(uid: string, productId: string) {
  await updateDoc(doc(getFirestore(), COLLECTIONS.users, uid), {
    favorites: arrayRemove(productId),
  });
}

export async function getFavoriteProducts(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const products: Product[] = [];
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const q = query(collection(getFirestore(), COLLECTIONS.products), where("__name__", "in", batch));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => products.push(dataToProduct(d.id, docData(d))));
  }
  return products;
}

export async function createChat(chat: Omit<Chat, "id">): Promise<string> {
  const docRef = await addDoc(collection(getFirestore(), COLLECTIONS.chats), chat);
  return docRef.id;
}

export async function getChatsByUser(uid: string): Promise<Chat[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.chats),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToChat(d.id, docData(d)));
}

export function listenChats(uid: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(getFirestore(), COLLECTIONS.chats),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => dataToChat(d.id, docData(d))));
  });
}

export function listenMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesRef = collection(getFirestore(), COLLECTIONS.chats, chatId, COLLECTIONS.messages);
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => dataToMessage(d.id, docData(d))));
  });
}

export async function sendMessage(chatId: string, message: Omit<ChatMessage, "id">) {
  const messagesRef = collection(getFirestore(), COLLECTIONS.chats, chatId, COLLECTIONS.messages);
  await addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(getFirestore(), COLLECTIONS.chats, chatId), {
    lastMessage: message.text,
    lastMessageAt: serverTimestamp(),
    lastSenderId: message.senderId,
    [`unreadCount.${message.senderId}`]: 0,
  });
}

export async function createProposal(data: Omit<Proposal, "id">): Promise<string> {
  const docRef = await addDoc(collection(getFirestore(), COLLECTIONS.proposals), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProposalsByUser(uid: string): Promise<Proposal[]> {
  const sent = query(
    collection(getFirestore(), COLLECTIONS.proposals),
    where("senderId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const received = query(
    collection(getFirestore(), COLLECTIONS.proposals),
    where("receiverId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const [sentSnap, receivedSnap] = await Promise.all([getDocs(sent), getDocs(received)]);
  return [
    ...sentSnap.docs.map((d) => dataToProposal(d.id, docData(d))),
    ...receivedSnap.docs.map((d) => dataToProposal(d.id, docData(d))),
  ].sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateProposalStatus(id: string, status: Proposal["status"], counterAmount?: number) {
  const update: any = { status, updatedAt: serverTimestamp() };
  if (counterAmount !== undefined) update.counterAmount = counterAmount;
  await updateDoc(doc(getFirestore(), COLLECTIONS.proposals, id), update);
}

export async function getPendingProducts(): Promise<Product[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.products),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => dataToProduct(d.id, docData(d)));
}

export async function moderateProduct(id: string, status: "active" | "inactive") {
  await updateDoc(doc(getFirestore(), COLLECTIONS.products, id), { status, updatedAt: serverTimestamp() });
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const q = query(
    collection(getFirestore(), COLLECTIONS.products),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  const term = searchTerm.toLowerCase();
  return snap.docs
    .map((d) => dataToProduct(d.id, docData(d)))
    .filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.model.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
    );
}
