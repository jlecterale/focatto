import {
  doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs,
  query, where, orderBy, deleteDoc, Timestamp, increment, limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import type { ProductData, ProductStatus, FavoriteData, ProposalData } from "./roles";
import { createNotification } from "./notificationService";


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
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(500));
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

export async function getUserApprovedProducts(userId: string): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("userId", "==", userId),
      where("status", "==", "approved"),
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
      where("status", "==", "approved"),
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
      where("status", "==", "approved"),
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

export async function getProductById(productId: string): Promise<ProductData | null> {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ProductData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getApprovedProducts(): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductData));
  } catch {
    return [];
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const productRef = doc(db, "products", productId);
  try {
    const snap = await getDoc(productRef);
    if (snap.exists()) {
      const data = snap.data();
      const photos = data.photos || [];
      for (const url of photos) {
        try {
          const imgRef = ref(storage, url);
          await deleteObject(imgRef);
        } catch (err) {
          console.error("Erro ao deletar imagem associada no Storage:", err);
        }
      }
    }
  } catch (err) {
    console.error("Erro ao buscar produto para exclusão:", err);
  }
  await deleteDoc(productRef);
}

export async function incrementProductViews(productId: string): Promise<void> {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

export async function isProductFavorited(productId: string, userId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "favorites"),
      where("productId", "==", productId),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}

export async function toggleFavoriteProduct(
  productId: string,
  productTitle: string,
  userId: string,
  userName: string,
  userEmail: string,
  sellerId: string
): Promise<{ favorited: boolean }> {
  const q = query(
    collection(db, "favorites"),
    where("productId", "==", productId),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Delete existing favorite
    const docId = snap.docs[0].id;
    await deleteDoc(doc(db, "favorites", docId));
    return { favorited: false };
  } else {
    // Add new favorite
    const favData: Omit<FavoriteData, "id"> = {
      productId,
      productTitle,
      userId,
      userName,
      userEmail,
      sellerId,
      createdAt: Date.now(),
    };
    await addDoc(collection(db, "favorites"), favData);

    // Create a real-time notification if the favoriting user is not the owner/seller
    if (userId !== sellerId) {
      try {
        await createNotification(
          sellerId,
          userId,
          userName,
          "favorite",
          "Anúncio Favoritado",
          `${userName} favoritou seu anúncio "${productTitle}".`,
          productId,
          productTitle
        );
      } catch (err) {
        console.error("Error creating favorite notification:", err);
      }
    }

    return { favorited: true };
  }
}

export async function getSellerProductsFavorites(sellerId: string): Promise<FavoriteData[]> {
  try {
    const q = query(
      collection(db, "favorites"),
      where("sellerId", "==", sellerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FavoriteData));
  } catch {
    return [];
  }
}

export async function getUserFavorites(userId: string): Promise<FavoriteData[]> {
  try {
    const q = query(
      collection(db, "favorites"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FavoriteData));
  } catch {
    return [];
  }
}


export async function createProposal(
  productId: string,
  productTitle: string,
  sellerId: string,
  sellerName: string,
  receiverId: string,
  receiverName: string,
  receiverEmail: string,
  type: "value" | "trade",
  value: number,
  message: string,
  senderId: string,
  tradeDescription?: string,
  tradeCategory?: string,
  tradeCondition?: string,
  tradePhotoFiles?: File[],
  tradeValue?: number,
): Promise<string> {
  let tradePhotos: string[] = [];

  if (tradePhotoFiles && tradePhotoFiles.length > 0) {
    for (let i = 0; i < tradePhotoFiles.length; i++) {
      const fileRef = ref(storage, `proposals/${receiverId}/${Date.now()}_${i}`);
      await uploadBytes(fileRef, tradePhotoFiles[i]);
      const url = await getDownloadURL(fileRef);
      tradePhotos.push(url);
    }
  }

  const proposalData: Omit<ProposalData, "id"> = {
    productId,
    productTitle,
    sellerId,
    sellerName,
    senderId,
    receiverId,
    receiverName,
    receiverEmail,
    type,
    value,
    message,
    ...(type === "trade" && {
      tradeDescription,
      tradeCategory,
      tradeCondition,
      tradePhotos: tradePhotos.length > 0 ? tradePhotos : undefined,
      tradeValue,
    }),
    status: "pending",
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "proposals"), proposalData);

  // Notify the receiver about the proposal
  try {
    const proposalTypeLabel = type === "trade" ? "Proposta de Troca" : "Proposta de Valor";
    await createNotification(
      receiverId,
      senderId,
      sellerName,
      "proposal",
      proposalTypeLabel,
      `${sellerName} enviou uma ${proposalTypeLabel.toLowerCase()} para o anúncio "${productTitle}".`,
      productId,
      productTitle
    );
  } catch (err) {
    console.error("Error creating proposal notification:", err);
  }

  return docRef.id;
}

export async function getSentProposals(userId: string): Promise<ProposalData[]> {
  try {
    const q = query(
      collection(db, "proposals"),
      where("senderId", "==", userId)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProposalData));
    return data.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function getReceivedProposals(userId: string): Promise<ProposalData[]> {
  try {
    const q = query(
      collection(db, "proposals"),
      where("receiverId", "==", userId)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProposalData));
    return data.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function updateProposalStatus(
  proposalId: string,
  status: "accepted" | "rejected"
): Promise<void> {
  const proposalRef = doc(db, "proposals", proposalId);
  await updateDoc(proposalRef, { status });
}
