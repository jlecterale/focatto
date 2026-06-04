import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasValidConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof initializeFirestore> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;

function createInstances() {
  if (!hasValidConfig) return;

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

    storage = getStorage(app);

    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
    }
  } catch (e) {
    console.warn("Firebase not available:", e);
    app = undefined;
    auth = undefined;
    db = undefined;
    storage = undefined;
  }
}

if (typeof window !== "undefined") {
  createInstances();
}

export { app, auth, db, storage };
