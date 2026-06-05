"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ensureUserDocument, getUserRole } from "../lib/userService";
import { ROLES, type UserRole } from "../lib/roles";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const { role } = await ensureUserDocument(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName
        );
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { role } = await ensureUserDocument(
      cred.user.uid,
      cred.user.email,
      cred.user.displayName
    );
    setUserRole(role);
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const { role } = await ensureUserDocument(
      cred.user.uid,
      cred.user.email,
      cred.user.displayName
    );
    setUserRole(role);
  }

  async function register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const { role } = await ensureUserDocument(
      cred.user.uid,
      cred.user.email,
      name
    );
    setUserRole(role);
  }

  async function logout() {
    await signOut(auth);
    setUserRole(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, loginWithGoogle, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
