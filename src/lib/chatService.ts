import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";

export interface ChatData {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  productId?: string;
  productTitle?: string;
  productPhoto?: string;
  lastMessage: string;
  lastMessageAt: number;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
  createdAt: number;
}

export interface MessageData {
  id?: string;
  senderId: string;
  text: string;
  createdAt: number;
}

/**
 * Creates or retrieves a chat between buyer and seller.
 */
export async function createOrGetChat(
  buyerId: string,
  buyerName: string,
  buyerPhoto: string,
  sellerId: string,
  sellerName: string,
  sellerPhoto: string,
  product?: { id: string; title: string; photo: string }
): Promise<string> {
  const chatId = product?.id ? `${buyerId}_${sellerId}_${product.id}` : `${buyerId}_${sellerId}`;
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    const chatData = {
      participants: [buyerId, sellerId],
      participantNames: {
        [buyerId]: buyerName || "Usuário",
        [sellerId]: sellerName || "Anunciante",
      },
      participantPhotos: {
        [buyerId]: buyerPhoto || "",
        [sellerId]: sellerPhoto || "",
      },
      productId: product?.id || "",
      productTitle: product?.title || "",
      productPhoto: product?.photo || "",
      lastMessage: "",
      lastMessageAt: Date.now(),
      lastMessageSenderId: "",
      unreadCount: {
        [buyerId]: 0,
        [sellerId]: 0,
      },
      createdAt: Date.now(),
    };
    await setDoc(chatRef, chatData);
  }

  return chatId;
}

/**
 * Listens to active chats for a specific user.
 */
export function listenToUserChats(
  userId: string,
  callback: (chats: ChatData[]) => void
) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatData));
      callback(list);
    },
    (err) => {
      console.error("Error listening to user chats:", err);
    }
  );
}

/**
 * Listens to messages in a specific chat.
 */
export function listenToChatMessages(
  chatId: string,
  callback: (messages: MessageData[]) => void
) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageData));
      callback(list);
    },
    (err) => {
      console.error("Error listening to chat messages:", err);
    }
  );
}

/**
 * Sends a message, updates lastMessage and increments unreadCount for the recipient.
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  recipientId: string
): Promise<void> {
  const now = Date.now();
  const messageData = {
    senderId,
    text,
    createdAt: now,
  };

  // Add the message to the messages subcollection
  await addDoc(collection(db, "chats", chatId, "messages"), messageData);

  // Update chat metadata in the chats document
  const chatRef = doc(db, "chats", chatId);
  
  // To handle the increment on a nested map, we target it dynamically: `unreadCount.${recipientId}`
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageAt: now,
    lastMessageSenderId: senderId,
    [`unreadCount.${recipientId}`]: increment(1),
  });
}

/**
 * Resets the unread count for a participant in a chat.
 */
export async function markChatAsRead(chatId: string, userId: string): Promise<void> {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

/**
 * Listens to the total number of chats with unread messages for a user.
 */
export function listenToUnreadChatsCount(
  userId: string,
  callback: (count: number) => void
) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(
    q,
    (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        const data = d.data();
        const unread = data.unreadCount?.[userId] || 0;
        if (unread > 0) {
          total += 1;
        }
      });
      callback(total);
    },
    (err) => {
      console.error("Error listening to unread chats count:", err);
    }
  );
}
