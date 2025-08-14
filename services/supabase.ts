// services/supabase.ts
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
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
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string;
  chat_count: number;
  is_anonymous: boolean;
  preferences: {
    language: string;
    theme: string;
  };
}

// Database schema types
interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          type: NavigationTab;
          timestamp: string;
          query: string;
          response: FormattedResponse;
          metadata: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chats']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['chats']['Row'], 'id' | 'created_at'>>;
      };
    };
  };
}

// Supabase client
let supabase: SupabaseClient<Database> | null = null;
let isInitialized = false;
let currentUser: User | null = null;

// Get Supabase configuration
function getSupabaseConfig() {
  console.log('🔍 Checking Supabase configuration...');
  
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Environment variables:', {
    url: url ? `${url.substring(0, 20)}...` : 'MISSING',
    anonKey: anonKey ? `${anonKey.substring(0, 20)}...` : 'MISSING'
  });
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase config:', { 
      url: url ? 'SET' : 'MISSING',
      anonKey: anonKey ? 'SET' : 'MISSING'
    });
    console.error('🔧 Add these to your .env file:');
    console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.error('   VITE_SUPABASE_ANON_KEY=your_anon_key');
    return null;
  }

  console.log('✅ Supabase config complete');
  return { url, anonKey };
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

  static saveUser(user: any) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user locally:', error);
    }
  }

  static getUser(): any {
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

// Initialize Supabase
async function initializeSupabase(): Promise<boolean> {
  if (isInitialized && supabase) {
    console.log('✅ Supabase already initialized');
    return true;
  }

  const config = getSupabaseConfig();
  if (!config) {
    console.error('❌ Cannot initialize Supabase - missing configuration');
    return false;
  }

  try {
    console.log('🔄 Initializing Supabase...');
    
    // Create Supabase client
    supabase = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    
    console.log('🔗 Supabase client created');
    
    // Get initial session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('⚠️ Session check failed:', error.message);
    } else {
      currentUser = session?.user || null;
      console.log('👤 Current session:', currentUser ? `${currentUser.email}` : 'No user');
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      console.log('👤 Auth state changed:', event, currentUser ? `${currentUser.email}` : 'No user');
    });
    
    isInitialized = true;
    console.log('✅ Supabase initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    isInitialized = false;
    return false;
  }
}

export const supabaseService = {
  // Initialize the service
  async initialize(): Promise<boolean> {
    console.log('🚀 SupabaseService.initialize() called');
    const success = await initializeSupabase();
    console.log('🏁 SupabaseService.initialize() completed - success:', success);
    return success;
  },

  // Debug function to test configuration
  debugConfig() {
    console.log('🔍 Debugging Supabase configuration...');
    const config = getSupabaseConfig();
    if (config) {
      console.log('✅ Config found:', {
        url: config.url,
        anonKey: config.anonKey ? `${config.anonKey.substring(0, 20)}...` : 'MISSING'
      });
    } else {
      console.log('❌ Config missing');
    }
    console.log('🔧 Environment check:', {
      url: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });
    console.log('🔗 Supabase client status:', {
      isInitialized,
      hasClient: !!supabase,
      currentUser: currentUser ? currentUser.email : 'None'
    });
  },

  // Check if Supabase is available
  isEnabled: (): boolean => {
    const enabled = isInitialized && !!supabase;
    console.log('🔍 SupabaseService.isEnabled() called - returning:', enabled);
    return enabled;
  },

  // Get current user
  getCurrentUser: () => currentUser,

  // Authentication Methods
  async signInAnonymously() {
    console.log('🔒 Creating anonymous session...');
    
    if (!supabase) {
      // Offline fallback
      const anonymousUser = {
        id: 'offline_' + Date.now(),
        email: null,
        user_metadata: { display_name: 'Anonymous User' },
        isAnonymous: true
      };
      LocalStorageManager.saveUser(anonymousUser);
      currentUser = anonymousUser as any;
      return anonymousUser;
    }

    try {
      // For anonymous users, we'll create a temporary session
      // Supabase doesn't have built-in anonymous auth, so we'll simulate it
      const anonymousUser = {
        id: 'anon_' + Date.now(),
        email: null,
        user_metadata: { display_name: 'Anonymous User' },
        isAnonymous: true
      };
      
      LocalStorageManager.saveUser(anonymousUser);
      currentUser = anonymousUser as any;
      console.log('✅ Anonymous session created');
      return anonymousUser;
    } catch (error) {
      console.error('❌ Anonymous session failed:', error);
      throw error;
    }
  },

  async signInWithEmail(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not available - please check configuration');
    }

    try {
      console.log('🔓 Signing in with email...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      console.log('✅ Email sign-in successful');
      return data.user;
    } catch (error: any) {
      console.error('❌ Email sign-in failed:', error);
      throw error;
    }
  },

  async signUpWithEmail(email: string, password: string, displayName?: string) {
    if (!supabase) {
      console.error('❌ Supabase client not available');
      throw new Error('Supabase not available - please check configuration');
    }

    try {
      console.log('📝 Creating new user account...');
      console.log('📧 Email:', email);
      console.log('👤 Display Name:', displayName);
      console.log('🔑 Password length:', password.length);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || null
          }
        }
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        throw error;
      }
      
      console.log('✅ Auth signup successful, user data:', data);
      
      // Create user profile in our custom users table
      if (data.user) {
        try {
          console.log('👤 Creating user profile for:', data.user.id);
          
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              display_name: displayName || data.user.email?.split('@')[0] || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              last_login_at: new Date().toISOString(),
              chat_count: 0,
              is_anonymous: false,
              preferences: { language: 'en', theme: 'system' }
            });

          if (profileError) {
            console.error('❌ Failed to create user profile:', profileError);
            console.error('❌ Profile error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            });
            // Don't throw here - user is still created in auth
          } else {
            console.log('✅ User profile created successfully');
          }
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError);
        }
      } else {
        console.warn('⚠️ No user data returned from auth signup');
      }
      
      console.log('✅ Email signup successful');
      return data.user;
    } catch (error: any) {
      console.error('❌ Email signup failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
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

    // Try to save to Supabase if available and user is authenticated
    if (this.isEnabled() && supabase && currentUser && !currentUser.id?.startsWith('anon_') && !currentUser.id?.startsWith('offline_')) {
      try {
        console.log('💾 Saving chat to Supabase...');
        
        const { error } = await supabase
          .from('chats')
          .insert({
            user_id: currentUser.id,
            type: chatData.type,
            timestamp: chatData.timestamp.toISOString(),
            query: chatData.query,
            response: chatData.response,
            metadata: chatData.metadata
          });

        if (error) {
          console.error('❌ Failed to save chat to Supabase:', error);
          throw error;
        }

        // Note: Chat count is automatically incremented by the database trigger
        console.log('💾 Chat saved to Supabase successfully:', chatData.id);
        return chatData.id;
      } catch (error) {
        console.error('❌ Failed to save chat to Supabase:', error);
        // Don't throw here - chat is still saved locally
      }
    }

    console.log('💾 Chat saved locally:', chatData.id);
    return chatData.id;
  },

  async getChatHistory(limitCount = 20): Promise<ChatData[]> {
    // Try Supabase first if available and user is authenticated
    if (this.isEnabled() && supabase && currentUser && !currentUser.id?.startsWith('anon_') && !currentUser.id?.startsWith('offline_')) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('timestamp', { ascending: false })
          .limit(limitCount);

        if (error) throw error;

        const chats = data.map(chat => ({
          id: chat.id,
          type: chat.type,
          timestamp: new Date(chat.timestamp),
          query: chat.query,
          response: chat.response,
          metadata: chat.metadata
        })) as ChatData[];

        console.log(`📚 Loaded ${chats.length} chats from Supabase`);
        return chats;
      } catch (error) {
        console.error('❌ Failed to load chats from Supabase:', error);
      }
    }

    // Fallback to local storage
    const localChats = LocalStorageManager.getChats();
    console.log(`📚 Loaded ${localChats.length} chats from local storage`);
    return localChats.slice(-limitCount).reverse();
  },

  async createUserProfile(user: any): Promise<void> {
    if (!this.isEnabled() || !supabase || !user || user.id?.startsWith('anon_') || user.id?.startsWith('offline_')) {
      return;
    }

    try {
      console.log('👤 Creating/updating user profile for:', user.id);
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          last_login_at: new Date().toISOString(),
          chat_count: 0,
          is_anonymous: false,
          preferences: { language: 'en', theme: 'system' }
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Failed to create/update user profile:', error);
        throw error;
      }
      
      console.log('✅ User profile created/updated successfully');
    } catch (error) {
      console.error('❌ Failed to create user profile:', error);
      throw error;
    }
  },

  // Utility method for syncing local data
  async syncLocalDataToSupabase() {
    if (!this.isEnabled() || !currentUser || currentUser.id?.startsWith('anon_') || currentUser.id?.startsWith('offline_')) {
      return;
    }

    const localChats = LocalStorageManager.getChats();
    console.log(`🔄 Syncing ${localChats.length} local chats to Supabase...`);

    for (const chat of localChats) {
      try {
        await this.saveChat(chat.type, chat.query, chat.response);
      } catch (error) {
        console.error('Failed to sync chat:', chat.id, error);
      }
    }

    // Clear local storage after successful sync
    LocalStorageManager.clearAll();
    console.log('✅ Local data synced and cleared');
  }
};