import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  ADMIN_EMAILS, ROLES, type UserRole, type UserData, type UserAddress,
  type VerificationRequest, type VerificationStatus,
} from "./roles";

const DEFAULT_ADDRESS: UserAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export async function ensureUserDocument(uid: string, email: string | null, displayName: string | null) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as { role: UserRole };
  }

  const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;

  const userData: UserData = {
    uid,
    email: email || "",
    displayName: displayName || email?.split("@")[0] || "Usuário",
    phone: "",
    cpfCnpj: "",
    photoURL: "",
    bio: "",
    address: { ...DEFAULT_ADDRESS },
    role: isAdmin ? ROLES.ADMIN : ROLES.USER,
    isVerified: false,
    isProfessional: false,
    verificationStatus: "none",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(userRef, userData);

  return { role: userData.role };
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().role as UserRole || ROLES.USER;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserData>) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `avatars/${uid}/profile`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateUserProfile(uid, { photoURL: url });
  return url;
}

export async function submitVerificationRequest(
  uid: string,
  email: string,
  name: string,
  documentFile: File,
  faceFile: File,
): Promise<string> {
  const docRef = ref(storage, `verifications/${uid}/document_${Date.now()}`);
  await uploadBytes(docRef, documentFile);
  const documentPhoto = await getDownloadURL(docRef);

  const faceRef = ref(storage, `verifications/${uid}/face_${Date.now()}`);
  await uploadBytes(faceRef, faceFile);
  const facePhoto = await getDownloadURL(faceRef);

  const verificationRef = collection(db, "verifications");
  const verDoc = await addDoc(verificationRef, {
    userId: uid,
    userEmail: email,
    userName: name,
    documentPhoto,
    facePhoto,
    status: "pending",
    adminNotes: "",
    reviewedBy: "",
    submittedAt: Date.now(),
    reviewedAt: 0,
  });

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    verificationStatus: "pending",
    updatedAt: Date.now(),
  });

  return verDoc.id;
}

export async function getPendingVerifications(): Promise<VerificationRequest[]> {
  try {
    const q = query(collection(db, "verifications"), where("status", "==", "pending"), orderBy("submittedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRequest));
  } catch {
    return [];
  }
}

export async function getAllVerifications(): Promise<VerificationRequest[]> {
  try {
    const q = query(collection(db, "verifications"), orderBy("submittedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRequest));
  } catch {
    return [];
  }
}

export async function getProfessionalUsers(): Promise<UserData[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("isProfessional", "==", true),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as unknown as UserData));
  } catch {
    return [];
  }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as unknown as UserData));
  } catch {
    return [];
  }
}

export async function adminUpdateUserRole(uid: string, role: UserRole) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { role, updatedAt: Date.now() });
}

export async function adminSetUserVerified(uid: string, isVerified: boolean) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    isVerified,
    verificationStatus: isVerified ? "approved" : "none",
    updatedAt: Date.now(),
  });
}

export async function adminSetUserProfessional(uid: string, isProfessional: boolean) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { isProfessional, updatedAt: Date.now() });
}

export async function reviewVerification(
  verificationId: string,
  userId: string,
  status: "approved" | "rejected",
  adminNotes: string,
  adminUid: string,
) {
  const verificationRef = doc(db, "verifications", verificationId);
  await updateDoc(verificationRef, {
    status,
    adminNotes,
    reviewedBy: adminUid,
    reviewedAt: Date.now(),
  });

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    verificationStatus: status,
    isVerified: status === "approved",
    updatedAt: Date.now(),
  });
}
