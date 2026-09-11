import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, Firestore } from 'firebase/firestore';
import { FirebaseConfigInput, UserProfile } from '../types';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const FIREBASE_CONFIG_KEY = 'flashcard_pro_firebase_config';

const DEFAULT_FIREBASE_CONFIG: FirebaseConfigInput = {
  apiKey: "AIzaSyBKkkDX6prhMT-xACwioDLUwx2ikAx87E0",
  authDomain: "flashcard-pro-app-25c7f.firebaseapp.com",
  projectId: "flashcard-pro-app-25c7f",
  storageBucket: "flashcard-pro-app-25c7f.firebasestorage.app",
  messagingSenderId: "386155725966",
  appId: "1:386155725966:web:9fa1b4c8cb7dd8f19cb5df"
};

export function getSavedFirebaseConfig(): FirebaseConfigInput {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (!raw) return DEFAULT_FIREBASE_CONFIG;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}

export function saveFirebaseConfig(config: FirebaseConfigInput): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  }
}

export function initFirebase(config?: FirebaseConfigInput): boolean {
  try {
    const cfg = config || getSavedFirebaseConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId) {
      console.log('Firebase config missing or incomplete. Operating in LocalStorage mode.');
      return false;
    }

    if (getApps().length === 0) {
      app = initializeApp(cfg);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    return true;
  } catch (err) {
    console.warn('Failed to initialize Firebase:', err);
    app = null;
    auth = null;
    db = null;
    return false;
  }
}

export async function loginAnonymously(): Promise<string | null> {
  if (!auth) {
    const initialized = initFirebase();
    if (!initialized || !auth) return null;
  }
  try {
    const res = await signInAnonymously(auth);
    return res.user.uid;
  } catch (err) {
    console.warn('Firebase anonymous auth error:', err);
    return null;
  }
}

async function ensureAuth(): Promise<boolean> {
  if (!db || !auth) {
    const initialized = initFirebase();
    if (!initialized || !db || !auth) return false;
  }
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // ignore
    }
  }
  return true;
}

export async function syncUserToFirestore(userProfile: UserProfile): Promise<boolean> {
  await ensureAuth();
  if (!db) return false;

  try {
    const docRef = doc(db, 'users', userProfile.seatNumber);
    const snap = await getDoc(docRef);
    let toSave = userProfile;

    if (snap.exists()) {
      const existingRemote = snap.data() as UserProfile;
      const unlockedLevel = Math.max(userProfile.unlockedLevel || 1, existingRemote.unlockedLevel || 1);
      const stars = Math.max(userProfile.stars || 0, existingRemote.stars || 0);
      const streakDays = Math.max(userProfile.streakDays || 1, existingRemote.streakDays || 1);

      const mergedProgress = { ...(existingRemote.progress || {}), ...(userProfile.progress || {}) };
      const mergedWordStats = { ...(existingRemote.wordStats || {}), ...(userProfile.wordStats || {}) };

      toSave = {
        ...existingRemote,
        ...userProfile,
        unlockedLevel,
        stars,
        streakDays,
        progress: mergedProgress,
        wordStats: mergedWordStats,
        lastActive: new Date().toISOString(),
      };
    }

    await setDoc(docRef, toSave, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore sync user failed:', err);
    return false;
  }
}

export async function fetchUserFromFirestore(seatNumber: string): Promise<UserProfile | null> {
  await ensureAuth();
  if (!db) return null;

  try {
    const docRef = doc(db, 'users', seatNumber);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetch user failed:', err);
    return null;
  }
}

export async function fetchAllStudentsFromFirestore(): Promise<UserProfile[]> {
  await ensureAuth();
  if (!db) return [];

  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const result: UserProfile[] = [];
    snap.forEach((docSnap) => {
      result.push(docSnap.data() as UserProfile);
    });
    return result;
  } catch (err) {
    console.warn('Firestore fetch all students failed:', err);
    return [];
  }
}
