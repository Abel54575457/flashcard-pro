import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, Firestore } from 'firebase/firestore';
import { FirebaseConfigInput, UserProfile } from '../types';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const FIREBASE_CONFIG_KEY = 'flashcard_pro_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfigInput | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
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

export async function syncUserToFirestore(userProfile: UserProfile): Promise<boolean> {
  if (!db) {
    const initialized = initFirebase();
    if (!initialized || !db) return false;
  }
  try {
    const docRef = doc(db, 'users', userProfile.seatNumber);
    await setDoc(docRef, {
      ...userProfile,
      lastActive: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore sync user failed:', err);
    return false;
  }
}

export async function fetchUserFromFirestore(seatNumber: string): Promise<UserProfile | null> {
  if (!db) {
    const initialized = initFirebase();
    if (!initialized || !db) return null;
  }
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
  if (!db) {
    const initialized = initFirebase();
    if (!initialized || !db) return [];
  }
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
