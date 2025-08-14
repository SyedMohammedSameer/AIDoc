// Simplified Firebase service to avoid Vite dependency issues
import type { ConsultationLog } from '../types';

// Get Firebase configuration with better error handling
function getFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Check if all required fields are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Firebase configuration incomplete. Missing:', missingFields);
    console.warn('Firebase features will be disabled. Data logging will not work.');
    return null;
  }

  console.log('✅ Firebase configuration loaded');
  return config;
}

// Initialize Firebase dynamically to avoid build issues
let firebaseApp: any = null;
let firestore: any = null;
let analytics: any = null;
let isFirebaseEnabled = false;

const initializeFirebase = async () => {
  if (firebaseApp) return; // Already initialized
  
  const config = getFirebaseConfig();
  if (!config) return;

  try {
    console.log('🔄 Initializing Firebase...');
    
    // Dynamic imports to avoid Vite build issues
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
    
    firebaseApp = initializeApp(config);
    
    try {
      firestore = getFirestore(firebaseApp);
      console.log('✅ Firestore initialized');
      isFirebaseEnabled = true;
    } catch (firestoreError) {
      console.warn('⚠️ Firestore initialization failed:', firestoreError);
      firestore = null;
    }
    
    // Initialize Analytics only in browser and if supported
    if (typeof window !== 'undefined') {
      try {
        const { getAnalytics } = await import('firebase/analytics');
        analytics = getAnalytics(firebaseApp);
        console.log('✅ Analytics initialized');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError);
        analytics = null;
      }
    }
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
    console.warn('The app will work without Firebase features.');
  }
};

export const firebaseService = {
  isEnabled: () => isFirebaseEnabled,
  
  async logConsultation(log: Omit<ConsultationLog, 'id'>): Promise<string | null> {
    if (!isFirebaseEnabled) {
      // Try to initialize if not already done
      await initializeFirebase();
    }
    
    if (!firestore || !isFirebaseEnabled) {
      console.log('📝 Firebase not available, skipping consultation log');
      return null;
    }
    
    try {
      console.log('📝 Logging consultation to Firebase...');
      
      // Dynamic import to avoid build issues
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const docRef = await addDoc(collection(firestore, 'consultations'), {
        ...log,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      console.log('✅ Consultation logged successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging consultation:', error);
      // Don't throw error, just log it - app should continue working
      return null;
    }
  },

  async getRecentConsultations(userId?: string, limitCount = 10): Promise<ConsultationLog[]> {
    if (!isFirebaseEnabled) {
      await initializeFirebase();
    }
    
    if (!firestore || !isFirebaseEnabled) {
      console.log('📖 Firebase not available, returning empty consultations');
      return [];
    }
    
    try {
      console.log('📖 Fetching recent consultations...');
      
      // Dynamic import to avoid build issues
      const { collection, query, orderBy, limit, getDocs, where } = await import('firebase/firestore');
      
      let q = query(
        collection(firestore, 'consultations'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      if (userId) {
        q = query(
          collection(firestore, 'consultations'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const consultations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConsultationLog));
      
      console.log(`✅ Fetched ${consultations.length} consultations`);
      return consultations;
    } catch (error) {
      console.error('❌ Error fetching consultations:', error);
      return [];
    }
  },

  // Analytics helpers
  logEvent(eventName: string, parameters?: any) {
    if (analytics && typeof window !== 'undefined') {
      try {
        console.log('📊 Analytics event:', eventName, parameters);
        // You can add actual analytics logging here if needed
      } catch (error) {
        console.warn('⚠️ Analytics logging failed:', error);
      }
    }
  }
};