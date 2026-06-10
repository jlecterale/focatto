import {
  doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs,
  query, where, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { RatingData, SellerStats } from "./roles";

// Add profile rating (defaults to status: "pending")
export async function addRating(
  sellerId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string,
): Promise<string> {
  const docRef = await addDoc(collection(db, "ratings"), {
    sellerId,
    userId,
    userName,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment,
    status: "pending",
    createdAt: Date.now(),
  });
  return docRef.id;
}

// Get all approved ratings for a seller
export async function getSellerRatings(sellerId: string): Promise<RatingData[]> {
  try {
    const q = query(
      collection(db, "ratings"),
      where("sellerId", "==", sellerId)
    );
    const snap = await getDocs(q);
    const allRatings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RatingData));
    return allRatings
      .filter((r) => r.status === "approved")
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Error in getSellerRatings:", err);
    return [];
  }
}

// Check if a user has already rated a seller
export async function getUserRatingForSeller(sellerId: string, userId: string): Promise<RatingData | null> {
  try {
    const q = query(
      collection(db, "ratings"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const found = snap.docs.find((d) => d.data().sellerId === sellerId);
    if (!found) return null;
    return { id: found.id, ...found.data() } as RatingData;
  } catch (err) {
    console.error("Error in getUserRatingForSeller:", err);
    return null;
  }
}

// Get seller statistics based on approved ratings
export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const ratings = await getSellerRatings(sellerId);
  if (ratings.length === 0) {
    return { averageRating: 0, totalRatings: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of ratings) {
    sum += r.rating;
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  }
  return {
    averageRating: Math.round((sum / ratings.length) * 10) / 10,
    totalRatings: ratings.length,
    ratingDistribution: dist,
  };
}

// Admin function: Get all pending reviews/ratings
export async function getPendingRatings(): Promise<RatingData[]> {
  try {
    const q = query(
      collection(db, "ratings"),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as RatingData))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Error in getPendingRatings:", err);
    return [];
  }
}

// Admin function: Approve or reject a review/rating
export async function reviewRating(
  ratingId: string,
  status: "approved" | "rejected",
  adminNotes: string,
  adminUid: string,
): Promise<void> {
  const ratingRef = doc(db, "ratings", ratingId);
  await updateDoc(ratingRef, {
    status,
    adminNotes,
    reviewedBy: adminUid,
    reviewedAt: Date.now(),
  });
}

// Deprecated functions (defined empty/no-op to prevent import breaks)
export async function getProductRatings(productId: string): Promise<RatingData[]> {
  return [];
}
export async function getUserRatingForProduct(productId: string, userId: string): Promise<RatingData | null> {
  return null;
}
export async function getProductRatingsCount(productId: string): Promise<number> {
  return 0;
}
