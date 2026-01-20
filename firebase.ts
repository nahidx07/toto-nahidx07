
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { PlatformSettings, User, Match, ChatMessage } from './types';

// ==========================================
// আপনার Firebase Config এখানে বসান
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Database Helper Functions
export const dbOps = {
  // User Profile
  async getUser(uid: string): Promise<User | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  },

  async upsertUser(user: Partial<User>) {
    if (!user.uid) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, user, { merge: true });
  },

  // Matches
  subscribeMatches(callback: (matches: Match[]) => void) {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      callback(matches);
    });
  },

  async addMatch(match: Omit<Match, 'id'>) {
    await addDoc(collection(db, "matches"), { ...match, createdAt: Date.now() });
  },

  async updateMatch(id: string, updates: Partial<Match>) {
    const docRef = doc(db, "matches", id);
    await updateDoc(docRef, updates);
  },

  async deleteMatch(id: string) {
    await deleteDoc(doc(db, "matches", id));
  },

  // Chat
  subscribeChat(matchId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, `matches/${matchId}/chat`), 
      orderBy("timestamp", "asc"),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      callback(messages);
    });
  },

  async sendChatMessage(matchId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    await addDoc(collection(db, `matches/${matchId}/chat`), {
      ...message,
      timestamp: Date.now()
    });
  },

  // Settings
  async getSettings(): Promise<PlatformSettings> {
    const docRef = doc(db, "system", "settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as PlatformSettings;
    
    // Default Settings if not exists
    const defaults: PlatformSettings = {
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732232.png',
      telegramLink: 'https://t.me/your_channel'
    };
    await setDoc(docRef, defaults);
    return defaults;
  },

  async updateSettings(settings: PlatformSettings) {
    await setDoc(doc(db, "system", "settings"), settings);
  }
};
