// services/firebaseService.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { FormattedResponse, NavigationTab } from '../types';

// Types for our data structure
export interface ChatData {
  id: string;
  userId: string;
  type: NavigationTab;
  timestamp: Date;
  query: string;
  response: FormattedResponse;
  metadata: {
    userAgent: string;
    url: string;
  };
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) return true;

  const config = firebaseConfig;
  if (!config.apiKey || config.apiKey.startsWith('your_')) {
    console.warn('⚠️ Firebase not configured - limited functionality available');
    return false;
  }

  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
}

export const firebaseService = {
  initialize: initializeFirebase,
  isEnabled: () => isInitialized,

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => auth?.currentUser,

  signUpWithEmail: async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        createdAt: serverTimestamp()
    });
    return userCredential.user;
  },

  signInWithEmail: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  signOut: () => {
    return signOut(auth);
  },

  saveChat: async (type: NavigationTab, queryText: string, response: FormattedResponse) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot save chat, user not logged in.');
      return null;
    }

    try {
      const chatData = {
        userId: user.uid,
        type,
        query: queryText,
        response,
        timestamp: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      };
      const docRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('✅ Chat saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('⚠️ Failed to save chat to Firestore:', error);
      return null;
    }
  },

  getChatHistory: async (limitCount = 50): Promise<ChatData[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const chats: ChatData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();

        chats.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          timestamp,
          query: data.query,
          response: data.response,
          metadata: data.metadata,
        });
      });
      return chats;
    } catch (error) {
      console.error('Failed to load chats from Firestore:', error);
      return [];
    }
  },
};