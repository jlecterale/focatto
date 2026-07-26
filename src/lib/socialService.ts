import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  DocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { createNotification } from "./notificationService";
import type {
  PostData,
  TaggedUser,
  ReactionType,
  UserFavoriteData,
  EquipmentItem,
  SocialContactOptions,
  UserData,
} from "./roles";
import { SOCIAL_PHOTO_LIMITS } from "./roles";

// ==========================================
// POSTS
// ==========================================

/**
 * Creates a new social post. Handles image upload to Storage and
 * sends notifications to followers with notifyEnabled=true.
 */
export async function createPost(
  userId: string,
  userName: string,
  userPhoto: string,
  type: "photo" | "youtube" | "soundcloud",
  text: string,
  imageFiles: File[],
  youtubeUrl: string | null,
  soundcloudUrl: string | null,
  location: string | null,
  taggedUsers: TaggedUser[]
): Promise<string> {
  // Upload images to Firebase Storage
  const imageUrls: string[] = [];
  if (type === "photo" && imageFiles.length > 0) {
    const postTimestamp = Date.now();
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const storageRef = ref(
        storage,
        `social/${userId}/${postTimestamp}/image_${i}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      imageUrls.push(url);
    }
  }

  const postData: Omit<PostData, "id"> = {
    userId,
    userName,
    userPhoto,
    type,
    text,
    images: imageUrls,
    youtubeUrl,
    soundcloudUrl,
    location,
    taggedUsers,
    reactions: {},
    totalReactions: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "posts"), postData);

  // Increment totalPhotosUploaded counter if photos were uploaded
  if (imageUrls.length > 0) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      totalPhotosUploaded: increment(imageUrls.length),
    });
  }

  // Send notifications to followers
  try {
    await notifyFollowers(userId, userName, docRef.id, type);
  } catch (err) {
    console.error("Error notifying followers:", err);
  }

  return docRef.id;
}

/**
 * Fetches posts by a specific user, ordered by createdAt desc.
 */
export async function getUserPosts(
  userId: string,
  limitCount: number = 20
): Promise<PostData[]> {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
}

/**
 * Fetches the global social feed, ordered by createdAt desc with cursor pagination.
 */
export async function getAllPosts(
  limitCount: number = 20,
  startAfterDoc?: DocumentSnapshot
): Promise<{ posts: PostData[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  if (startAfterDoc) {
    q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(startAfterDoc),
      limit(limitCount)
    );
  }
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { posts, lastDoc };
}

/**
 * Fetches a single post by ID.
 */
export async function getPostById(postId: string): Promise<PostData | null> {
  const snap = await getDoc(doc(db, "posts", postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PostData;
}

/**
 * Deletes a post and its associated Storage images.
 * Decrements totalPhotosUploaded on the user document.
 */
export async function deletePost(
  postId: string,
  userId: string
): Promise<void> {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const postData = postSnap.data() as PostData;

  // Delete images from Storage
  if (postData.images && postData.images.length > 0) {
    for (const url of postData.images) {
      try {
        const imgRef = ref(storage, url);
        await deleteObject(imgRef);
      } catch (err) {
        console.error("Error deleting image from Storage:", err);
      }
    }

    // Decrement totalPhotosUploaded
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      totalPhotosUploaded: increment(-postData.images.length),
    });
  }

  await deleteDoc(postRef);
}

/**
 * Toggles a reaction on a post. If user already has the same reaction,
 * it removes it. If user has a different reaction, it switches.
 */
export async function toggleReaction(
  postId: string,
  userId: string,
  reactionType: ReactionType
): Promise<void> {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const data = postSnap.data();
  const reactions: Record<string, string[]> = { ...data.reactions };

  // Remove user from any existing reaction
  let removed = false;
  for (const key of Object.keys(reactions)) {
    const idx = reactions[key].indexOf(userId);
    if (idx > -1) {
      reactions[key] = reactions[key].filter((id) => id !== userId);
      if (reactions[key].length === 0) {
        delete reactions[key];
      }
      removed = key === reactionType;
    }
  }

  // Add new reaction if not toggling off the same one
  if (!removed) {
    if (!reactions[reactionType]) {
      reactions[reactionType] = [];
    }
    reactions[reactionType].push(userId);
  }

  // Compute total
  const totalReactions = Object.values(reactions).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  await updateDoc(postRef, { reactions, totalReactions });
}

// ==========================================
// EQUIPMENT
// ==========================================

/**
 * Updates the equipment list on a user's social profile.
 */
export async function updateEquipments(
  userId: string,
  equipments: EquipmentItem[]
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    "social.equipments": equipments,
  });
}

/**
 * Uploads an equipment image to Storage and returns the download URL.
 */
export async function uploadEquipmentImage(
  userId: string,
  file: File
): Promise<string> {
  const storageRef = ref(
    storage,
    `equipment/${userId}/${Date.now()}_${file.name}`
  );
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Deletes an equipment image from Storage.
 */
export async function deleteEquipmentImage(imageUrl: string): Promise<void> {
  try {
    const imgRef = ref(storage, imageUrl);
    await deleteObject(imgRef);
  } catch (err) {
    console.error("Error deleting equipment image:", err);
  }
}

// ==========================================
// USER FAVORITES (FOLLOW PROFILES)
// ==========================================

/**
 * Toggles following a user profile.
 * Returns true if now following, false if unfollowed.
 */
export async function toggleFollowUser(
  followerId: string,
  followerName: string,
  followerPhoto: string | null,
  targetUserId: string,
  targetUserName: string,
  targetUserPhoto: string | null,
  notifyEnabled: boolean = true
): Promise<boolean> {
  // Check if already following
  const existingFav = await getFollowDoc(followerId, targetUserId);

  if (existingFav) {
    // Unfollow
    await deleteDoc(doc(db, "userFavorites", existingFav.id!));
    return false;
  } else {
    // Follow
    const favData: Omit<UserFavoriteData, "id"> = {
      followerId,
      followerName,
      followerPhoto,
      targetUserId,
      targetUserName,
      targetUserPhoto,
      notifyEnabled,
      createdAt: Date.now(),
    };
    await addDoc(collection(db, "userFavorites"), favData);

    // Notify the target user
    try {
      await createNotification(
        targetUserId,
        followerId,
        followerName,
        "new_follower",
        "Novo seguidor!",
        `${followerName} começou a seguir o seu perfil.`
      );
    } catch (err) {
      console.error("Error creating follow notification:", err);
    }

    return true;
  }
}

/**
 * Checks if a user is following another user.
 */
export async function isFollowingUser(
  followerId: string,
  targetUserId: string
): Promise<boolean> {
  const fav = await getFollowDoc(followerId, targetUserId);
  return fav !== null;
}

/**
 * Gets the follow document between two users.
 */
async function getFollowDoc(
  followerId: string,
  targetUserId: string
): Promise<UserFavoriteData | null> {
  const q = query(
    collection(db, "userFavorites"),
    where("followerId", "==", followerId),
    where("targetUserId", "==", targetUserId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as UserFavoriteData;
}

/**
 * Gets all followers of a user.
 */
export async function getUserFollowers(
  userId: string
): Promise<UserFavoriteData[]> {
  const q = query(
    collection(db, "userFavorites"),
    where("targetUserId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserFavoriteData));
}

/**
 * Gets all users that a user follows.
 */
export async function getUserFollowing(
  userId: string
): Promise<UserFavoriteData[]> {
  const q = query(
    collection(db, "userFavorites"),
    where("followerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserFavoriteData));
}

/**
 * Gets the follower/following count for a user.
 */
export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const [followersSnap, followingSnap] = await Promise.all([
    getDocs(
      query(collection(db, "userFavorites"), where("targetUserId", "==", userId))
    ),
    getDocs(
      query(collection(db, "userFavorites"), where("followerId", "==", userId))
    ),
  ]);
  return {
    followers: followersSnap.size,
    following: followingSnap.size,
  };
}

/**
 * Toggles notifications for a followed profile.
 */
export async function toggleFollowNotifications(
  followerId: string,
  targetUserId: string,
  enabled: boolean
): Promise<void> {
  const fav = await getFollowDoc(followerId, targetUserId);
  if (!fav || !fav.id) return;
  await updateDoc(doc(db, "userFavorites", fav.id), {
    notifyEnabled: enabled,
  });
}

// ==========================================
// CONTACT OPTIONS
// ==========================================

/**
 * Updates contact options on the user's social profile.
 */
export async function updateContactOptions(
  userId: string,
  options: SocialContactOptions
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    "social.contactOptions": options,
  });
}

/**
 * Gets contact options for a user (from their UserData).
 */
export async function getContactOptions(
  userId: string
): Promise<SocialContactOptions> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return { internalChatEnabled: true, whatsappEnabled: false, whatsappNumber: null };
  }
  const data = snap.data() as UserData;
  return data.social?.contactOptions ?? {
    internalChatEnabled: true,
    whatsappEnabled: false,
    whatsappNumber: null,
  };
}

// ==========================================
// PHOTO LIMITS
// ==========================================

/**
 * Checks if the user can upload a given number of photos.
 */
export async function canUploadPhotos(
  userId: string,
  count: number
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const data = snap.data() as UserData;
  const current = data.totalPhotosUploaded || 0;
  const plan = data.premiumTier || "free";
  const photoLimit = SOCIAL_PHOTO_LIMITS[plan] ?? SOCIAL_PHOTO_LIMITS.free;

  return {
    allowed: current + count <= photoLimit,
    current,
    limit: photoLimit,
  };
}

// ==========================================
// USER SEARCH (for tagging)
// ==========================================

/**
 * Searches users by displayName prefix (case-insensitive via lowercase comparison).
 * Returns up to 10 results.
 */
export async function searchUsers(
  searchTerm: string,
  excludeUserId?: string
): Promise<Array<{ uid: string; displayName: string; photoURL: string }>> {
  if (!searchTerm || searchTerm.length < 2) return [];

  // Firestore doesn't support case-insensitive queries natively.
  // We use a range query on displayName for prefix matching.
  const term = searchTerm.trim();
  const end = term.slice(0, -1) + String.fromCharCode(term.charCodeAt(term.length - 1) + 1);

  const q = query(
    collection(db, "users"),
    where("displayName", ">=", term),
    where("displayName", "<", end),
    limit(10)
  );

  const snap = await getDocs(q);
  const results: Array<{ uid: string; displayName: string; photoURL: string }> = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    if (excludeUserId && d.id === excludeUserId) return;
    results.push({
      uid: d.id,
      displayName: data.displayName || "Utilizador",
      photoURL: data.photoURL || "",
    });
  });

  return results;
}

// ==========================================
// POST COUNT
// ==========================================

/**
 * Gets the total number of posts by a user.
 */
export async function getUserPostCount(userId: string): Promise<number> {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.size;
}

// ==========================================
// NOTIFICATIONS TO FOLLOWERS
// ==========================================

/**
 * Sends a "new_post" notification to all followers with notifyEnabled=true.
 * Runs client-side in batches to avoid overwhelming Firestore.
 */
async function notifyFollowers(
  userId: string,
  userName: string,
  postId: string,
  postType: "photo" | "youtube" | "soundcloud"
): Promise<void> {
  const q = query(
    collection(db, "userFavorites"),
    where("targetUserId", "==", userId),
    where("notifyEnabled", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const typeLabels: Record<string, string> = {
    photo: "foto",
    youtube: "vídeo do YouTube",
    soundcloud: "faixa do SoundCloud",
  };

  const batch = writeBatch(db);
  let batchCount = 0;

  for (const favDoc of snap.docs) {
    const fav = favDoc.data() as UserFavoriteData;

    const notifRef = doc(collection(db, "notifications"));
    batch.set(notifRef, {
      userId: fav.followerId,
      senderId: userId,
      senderName: userName,
      type: "new_post",
      title: "Nova publicação!",
      message: `${userName} publicou uma nova ${typeLabels[postType] || "publicação"}.`,
      postId,
      read: false,
      createdAt: Date.now(),
    });

    batchCount++;
    // Firestore batches are limited to 500 operations
    if (batchCount >= 450) break;
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

// ==========================================
// YOUTUBE / SOUNDCLOUD HELPERS
// ==========================================

/**
 * Extracts YouTube video ID from a URL.
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Builds a YouTube embed URL from a video ID.
 */
export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Extracts SoundCloud embed URL. Uses the oEmbed-style approach
 * by building an iframe src from the track/set URL.
 */
export function getSoundcloudEmbedUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ef7c2c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
}
