import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import type { NotificationData } from "./roles";

/**
 * Creates a notification document in Firestore.
 */
export async function createNotification(
  userId: string,
  senderId: string,
  senderName: string,
  type: "favorite" | "proposal" | "rating" | "system",
  title: string,
  message: string,
  productId?: string,
  productTitle?: string
): Promise<string> {
  const notificationData: Omit<NotificationData, "id"> = {
    userId,
    senderId,
    senderName,
    type,
    title,
    message,
    productId,
    productTitle,
    read: false,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "notifications"), notificationData);
  return docRef.id;
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const ref = doc(db, "notifications", notificationId);
  await updateDoc(ref, { read: true });
}

/**
 * Marks all unread notifications for a user as read using a Firestore batch.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
  }
}

/**
 * Deletes a notification document.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await deleteDoc(doc(db, "notifications", notificationId));
}

/**
 * Establishes a real-time listener for a user's notifications.
 * @returns Unsubscribe function
 */
export function listenToUserNotifications(
  userId: string,
  callback: (notifications: NotificationData[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationData));
      callback(list);
    },
    (err) => {
      console.error("Error listening to notifications:", err);
      // Garante que o componente saia do estado de carregamento mesmo em erro.
      callback([]);
    }
  );
}
