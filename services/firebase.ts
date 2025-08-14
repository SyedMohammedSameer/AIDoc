// services/firebase.ts - Simplified version with static imports
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, type Firestore, collection, doc, setDoc, updateDoc, increment, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import type { FormattedResponse, NavigationTab } from '../types';

// Types for our data structure
export interface ChatData {
  id: string;
  type: NavigationTab;
  timestamp: Date;
  query: string;
  response: FormattedResponse;
  metadata: {
    userAgent: string;
    url: string;
    duration?: number;
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLoginAt: Date;
  chatCount: number;
  isAnonymous: boolean;
  preferences: {
    language: string;
    theme: string;
  };
}

// Firebase instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let isInitialized = false;
let currentUser: any = null;

// Get Firebase configuration
function getFirebaseConfig() {
  console.log('🔍 Checking Firebase configuration...');
  
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase config:', missingFields);
    return null;
  }

  console.log('✅ Firebase config complete');
  return config;
}

// Local storage fallback
class LocalStorageManager {
  private static CHAT_KEY = 'vitashifa_chats';
  private static USER_KEY = 'vitashifa_user';

  static saveChat(chat: ChatData) {
    try {
      const chats = this.getChats();
      chats.push(chat);
      const recentChats = chats.slice(-50);
      localStorage.setItem(this.CHAT_KEY, JSON.stringify(recentChats));
    } catch (error) {
      console.warn('Failed to save chat locally:', error);
    }
  }

  static getChats(): ChatData[] {
    try {
      const stored = localStorage.getItem(this.CHAT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  static saveUser(user: Partial<UserProfile>) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user locally:', error);
    }
  }

  static getUser(): Partial<UserProfile> | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  static clearAll() {
    localStorage.removeItem(this.CHAT_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// Initialize Firebase
async function initializeFirebase(): Promise<boolean> {
  if (isInitialized) {
    console.log('✅ Firebase already initialized');
    return true;
  }

  const config = getFirebaseConfig();
  if (!config) {
    console.error('❌ Cannot initialize Firebase - missing configuration');
    return false;
  }

  try {
    console.log('🔄 Initializing Firebase...');
    
    // Initialize Firebase app
    app = initializeApp(config);
    console.log('📱 Firebase app created');
    
    // Initialize Auth
    auth = getAuth(app);
    console.log('🔐 Firebase Auth created');
    
    // Initialize Firestore
    firestore = getFirestore(app);
    console.log('🗄️ Firestore created');
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      console.log('👤 Auth state:', user ? `${user.email || 'Anonymous'}` : 'No user');
    });
    
    isInitialized = true;
    console.log('✅ Firebase initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    isInitialized = false;
    return false;
  }
}

export const firebaseService = {
  // Initialize the service
  async initialize(): Promise<boolean> {
    console.log('🚀 FirebaseService.initialize() called');
    const success = await initializeFirebase();
    console.log('🏁 FirebaseService.initialize() completed - success:', success);
    return success;
  },

  // Check if Firebase is available
  isEnabled: (): boolean => {
    const enabled = isInitialized && !!app && !!auth && !!firestore;
    console.log('🔍 FirebaseService.isEnabled() called - returning:', enabled);
    return enabled;
  },

  // Get current user
  getCurrentUser: () => currentUser,

  // Authentication Methods
  async signInAnonymously() {
    if (!auth) {
      console.log('🔒 Creating offline anonymous session');
      const anonymousUser = {
        uid: 'offline_' + Date.now(),
        email: null,
        displayName: 'Anonymous User',
        isAnonymous: true
      };
      LocalStorageManager.saveUser(anonymousUser);
      return anonymousUser;
    }

    try {
      console.log('🔓 Signing in anonymously...');
      const result = await signInAnonymously(auth);
      console.log('✅ Anonymous sign-in successful');
      return result.user;
    } catch (error) {
      console.error('❌ Anonymous sign-in failed:', error);
      throw error;
    }
  },

  async signInWithEmail(email: string, password: string) {
    if (!auth) {
      throw new Error('Firebase Auth not available - please check configuration');
    }

    try {
      console.log('🔓 Signing in with email...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email sign-in successful');
      return result.user;
    } catch (error) {
      console.error('❌ Email sign-in failed:', error);
      throw error;
    }
  },

  async signUpWithEmail(email: string, password: string, displayName?: string) {
    if (!auth) {
      throw new Error('Firebase Auth not available - please check configuration');
    }

    try {
      console.log('📝 Creating new user account...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      console.log('✅ Email signup successful');
      return result.user;
    } catch (error) {
      console.error('❌ Email signup failed:', error);
      throw error;
    }
  },

  async signOut() {
    if (auth) {
      await signOut(auth);
    }
    LocalStorageManager.clearAll();
    currentUser = null;
    console.log('👋 User signed out');
  },

  // Chat Data Methods
  async saveChat(type: NavigationTab, query: string, response: FormattedResponse): Promise<string | null> {
    const chatData: ChatData = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      query,
      response,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    };

    // Always save locally first
    LocalStorageManager.saveChat(chatData);

    // Try to save to Firebase if available
    if (this.isEnabled() && firestore && currentUser) {
      try {
        const chatRef = doc(collection(firestore, 'users', currentUser.uid, 'chats'), chatData.id);
        await setDoc(chatRef, {
          ...chatData,
          timestamp: serverTimestamp(),
        });

        const userRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userRef, {
          chatCount: increment(1),
          lastActivity: serverTimestamp(),
        });

        console.log('💾 Chat saved to Firebase:', chatData.id);
        return chatData.id;
      } catch (error) {
        console.error('❌ Failed to save chat to Firebase:', error);
      }
    }

    console.log('💾 Chat saved locally:', chatData.id);
    return chatData.id;
  },

  async getChatHistory(limitCount = 20): Promise<ChatData[]> {
    if (this.isEnabled() && firestore && currentUser) {
      try {
        const chatsRef = collection(firestore, 'users', currentUser.uid, 'chats');
        const q = query(chatsRef, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as ChatData[];

        console.log(`📚 Loaded ${chats.length} chats from Firebase`);
        return chats;
      } catch (error) {
        console.error('❌ Failed to load chats from Firebase:', error);
      }
    }

    const localChats = LocalStorageManager.getChats();
    console.log(`📚 Loaded ${localChats.length} chats from local storage`);
    return localChats.slice(-limitCount).reverse();
  },

  async createUserProfile(user: any): Promise<void> {
    if (!this.isEnabled() || !firestore) return;

    try {
      const userProfile: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        chatCount: 0,
        isAnonymous: user.isAnonymous,
        preferences: {
          language: 'en',
          theme: 'system'
        }
      };

      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      console.log('👤 User profile created/updated');
    } catch (error) {
      console.error('❌ Failed to create user profile:', error);
    }
  }
};