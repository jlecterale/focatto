"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  type User,
  type AuthCredential,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ensureUserDocument, getUserRole } from "../lib/userService";
import { deleteUserAccount } from "../lib/accountService";
import { isNativeApp } from "../lib/native";
import { ROLES, type UserRole } from "../lib/roles";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * No app nativo (Capacitor), popups OAuth não funcionam dentro do WebView
 * (o Google bloqueia user-agents de WebView). O plugin
 * @capacitor-firebase/authentication abre o fluxo nativo do sistema e
 * devolve a credencial, que é sincronizada com o SDK JS via
 * signInWithCredential para manter onAuthStateChanged/Firestore funcionando.
 */
async function nativeGoogleCredential(): Promise<AuthCredential> {
  const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
  const result = await FirebaseAuthentication.signInWithGoogle();
  if (!result.credential?.idToken) {
    throw new Error("Credencial Google ausente");
  }
  return GoogleAuthProvider.credential(
    result.credential.idToken,
    result.credential.accessToken,
  );
}

async function nativeAppleCredential(): Promise<AuthCredential> {
  const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
  // skipNativeAuth: o token da Apple é de uso único; autenticamos apenas a
  // camada JS para não consumi-lo duas vezes.
  const result = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: true });
  if (!result.credential?.idToken) {
    throw new Error("Credencial Apple ausente");
  }
  const provider = new OAuthProvider("apple.com");
  return provider.credential({
    idToken: result.credential.idToken,
    rawNonce: result.credential.nonce,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const _skipEnsure = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && !_skipEnsure.current) {
        const { role } = await ensureUserDocument(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName
        );
        setUserRole(role);
      } else if (!firebaseUser) {
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

  async function loginWithGoogle(): Promise<boolean> {
    _skipEnsure.current = true;
    try {
      const cred = isNativeApp()
        ? await signInWithCredential(auth, await nativeGoogleCredential())
        : await signInWithPopup(auth, googleProvider);
      const { role, isNew } = await ensureUserDocument(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName
      );
      setUserRole(role);
      return isNew;
    } finally {
      _skipEnsure.current = false;
    }
  }

  async function loginWithApple(): Promise<boolean> {
    _skipEnsure.current = true;
    try {
      let cred;
      if (isNativeApp()) {
        cred = await signInWithCredential(auth, await nativeAppleCredential());
      } else {
        const provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");
        cred = await signInWithPopup(auth, provider);
      }
      const { role, isNew } = await ensureUserDocument(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName
      );
      setUserRole(role);
      return isNew;
    } finally {
      _skipEnsure.current = false;
    }
  }

  async function register(name: string, email: string, password: string): Promise<boolean> {
    _skipEnsure.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const { role, isNew } = await ensureUserDocument(
        cred.user.uid,
        cred.user.email,
        name
      );
      setUserRole(role);
      return isNew;
    } finally {
      _skipEnsure.current = false;
    }
  }

  async function logout() {
    if (isNativeApp()) {
      try {
        const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
        await FirebaseAuthentication.signOut();
      } catch {
        // camada nativa pode não estar autenticada; o signOut JS é o que vale
      }
    }
    await signOut(auth);
    setUserRole(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function reauthenticate(currentUser: User, password?: string) {
    const providerId = currentUser.providerData[0]?.providerId;

    if (providerId === "password") {
      if (!currentUser.email || !password) {
        throw new Error("password-required");
      }
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      return;
    }

    if (providerId === "google.com") {
      if (isNativeApp()) {
        await reauthenticateWithCredential(currentUser, await nativeGoogleCredential());
      } else {
        await reauthenticateWithPopup(currentUser, googleProvider);
      }
      return;
    }

    if (providerId === "apple.com") {
      if (isNativeApp()) {
        await reauthenticateWithCredential(currentUser, await nativeAppleCredential());
      } else {
        await reauthenticateWithPopup(currentUser, new OAuthProvider("apple.com"));
      }
      return;
    }

    throw new Error("unsupported-provider");
  }

  /**
   * Exclui permanentemente a conta e todos os dados do usuário (exigência
   * da App Store e do Google Play). Para contas de email/senha, `password`
   * é usado na reautenticação caso o Firebase exija login recente.
   */
  async function deleteAccount(password?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("not-authenticated");
    }

    try {
      await deleteUserAccount(currentUser);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/requires-recent-login") {
        throw err;
      }
      await reauthenticate(currentUser, password);
      await deleteUserAccount(currentUser);
    }

    if (isNativeApp()) {
      try {
        const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
        await FirebaseAuthentication.signOut();
      } catch {
        // melhor esforço
      }
    }
    setUserRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        resetPassword,
        deleteAccount,
      }}
    >
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
