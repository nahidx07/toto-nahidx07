
import { initializeApp, FirebaseApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  Firestore
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  GoogleAuthProvider,
  Auth
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { PlatformSettings, User, Match, ChatMessage } from './types';

export const firebaseConfig = {
  apiKey: "AIzaSyCUu_dbDo8bcmphARYJS1p8GlETfB7kCiY",
  authDomain: "toto-stream.firebaseapp.com",
  projectId: "toto-stream",
  storageBucket: "toto-stream.firebasestorage.app",
  messagingSenderId: "2944302147",
  appId: "1:2944302147:web:f8045355a052b8361e28f6",
  measurementId: "G-98SNRH982G"
};

export const isFirebaseConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
}

export { db, auth, googleProvider };

const sanitize = (val: any): any => {
  if (val === null || typeof val !== 'object') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (val.seconds !== undefined && val.nanoseconds !== undefined) return val.seconds * 1000;
  if (Array.isArray(val)) return val.map(sanitize);

  const cleaned: any = {};
  for (const key in val) {
    if (Object.prototype.hasOwnProperty.call(val, key)) {
      if (key.startsWith('_') || key === 'firestore' || typeof val[key] === 'function') continue;
      cleaned[key] = sanitize(val[key]);
    }
  }
  return cleaned;
};

export const dbOps = {
  async getUser(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      return docSnap.exists() ? sanitize(docSnap.data()) as User : null;
    } catch (e) { return null; }
  },

  subscribeUser(uid: string, callback: (user: User | null) => void) {
    if (!db) return () => {};
    return onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        callback(sanitize(snap.data()) as User);
      } else {
        callback(null);
      }
    });
  },

  async upsertUser(user: Partial<User>) {
    if (!db || !user.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), sanitize(user), { merge: true });
    } catch (e) {}
  },

  async getTopUsers(count: number = 30): Promise<User[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(count));
      const snap = await getDocs(q);
      return snap.docs.map(d => sanitize(d.data()) as User);
    } catch (e) { return []; }
  },

  subscribeMatches(callback: (matches: Match[]) => void) {
    if (!db) { callback([]); return () => {}; }
    return onSnapshot(query(collection(db, "matches"), orderBy("createdAt", "desc")), (snap) => {
      callback(snap.docs.map(d => ({ ...sanitize(d.data()), id: d.id } as Match)));
    }, () => callback([]));
  },

  subscribeMatch(id: string, callback: (match: Match | null) => void) {
    if (!db) return () => {};
    return onSnapshot(doc(db, "matches", id), (snap) => {
      if (snap.exists()) {
        callback({ ...sanitize(snap.data()), id: snap.id } as Match);
      } else {
        callback(null);
      }
    });
  },

  async getMatch(id: string): Promise<Match | null> {
    if (!db) return null;
    try {
      const d = await getDoc(doc(db, "matches", id));
      return d.exists() ? ({ ...sanitize(d.data()), id: d.id } as Match) : null;
    } catch (e) { return null; }
  },

  async addMatch(match: Omit<Match, 'id'>) {
    if (!db) return;
    await addDoc(collection(db, "matches"), { ...sanitize(match), createdAt: Date.now() });
  },

  async updateMatch(id: string, updates: Partial<Match>) {
    if (!db) return;
    await updateDoc(doc(db, "matches", id), sanitize(updates));
  },

  async deleteMatch(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, "matches", id));
  },

  subscribeChat(matchId: string, callback: (messages: ChatMessage[]) => void) {
    if (!db) { callback([]); return () => {}; }
    const q = query(collection(db, `matches/${matchId}/chat`), orderBy("timestamp", "asc"), limit(50));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...sanitize(d.data()), id: d.id } as ChatMessage)));
    }, () => callback([]));
  },

  async sendChatMessage(matchId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    if (!db) return;
    await addDoc(collection(db, `matches/${matchId}/chat`), { ...sanitize(message), timestamp: Date.now() });
  },

  async getSettings(): Promise<PlatformSettings> {
    const defaults = { logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732232.png', telegramLink: '#' };
    if (!db) return defaults;
    try {
      const d = await getDoc(doc(db, "system", "settings"));
      return d.exists() ? sanitize(d.data()) as PlatformSettings : defaults;
    } catch (e) { return defaults; }
  },

  async updateSettings(settings: PlatformSettings) {
    if (!db) return;
    await setDoc(doc(db, "system", "settings"), sanitize(settings));
  }
};
