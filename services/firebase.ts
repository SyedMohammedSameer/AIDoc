import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { ConsultationLog } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: any = null;
let db: any = null;
let analytics: any = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

export const firebaseService = {
  async logConsultation(log: Omit<ConsultationLog, 'id'>): Promise<string | null> {
    if (!db) {
      console.warn('Firebase not initialized, skipping log');
      return null;
    }
    
    try {
      const docRef = await addDoc(collection(db, 'consultations'), {
        ...log,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging consultation:', error);
      return null;
    }
  },

  async getRecentConsultations(userId?: string, limitCount = 10): Promise<ConsultationLog[]> {
    if (!db) return [];
    
    try {
      let q = query(
        collection(db, 'consultations'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      if (userId) {
        q = query(
          collection(db, 'consultations'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConsultationLog));
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  }
};