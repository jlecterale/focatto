import {
  doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs,
  query, where, orderBy, deleteDoc, Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import type { ProductData, ProductStatus } from "./roles";

export async function createProduct(
  userId: string,
  userEmail: string,
  userName: string,
  data: Omit<ProductData, "id" | "userId" | "userEmail" | "userName" | "status" | "adminNotes" | "reviewedBy" | "createdAt" | "updatedAt" | "reviewedAt" | "photos">,
  photoFiles: File[],
): Promise<string> {
  const photoURLs: string[] = [];
  for (let i = 0; i < photoFiles.length; i++) {
    const fileRef = ref(storage, `products/${userId}/${Date.now()}_${i}`);
    await uploadBytes(fileRef, photoFiles[i]);
    const url = await getDownloadURL(fileRef);
    photoURLs.push(url);
  }

  const productData: Omit<ProductData, "id"> = {
    userId,
    userEmail,
    userName,
    ...data,
    photos: photoURLs,
    status: "pending",
    adminNotes: "",
    reviewedBy: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    reviewedAt: 0,
  };

  const docRef = await addDoc(collection(db, "products"), productData);
  return docRef.id;
}

export async function getPendingProducts(): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function getAllProducts(): Promise<ProductData[]> {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function getUserProducts(userId: string): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function getProductsByCategories(categories: string[]): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "in", categories),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function reviewProduct(
  productId: string,
  status: "approved" | "rejected",
  adminNotes: string,
  adminUid: string,
) {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, {
    status,
    adminNotes,
    reviewedBy: adminUid,
    reviewedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, "products", productId));
}
