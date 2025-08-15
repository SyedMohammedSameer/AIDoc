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
        Insert: Omit<UserProfile, 'created_at' | 'chat_count'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          timestamp: string;
          query: string;
          response: any;
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
    url: url ? `${url.substring(0, 30)}...` : 'MISSING',
    anonKey: anonKey ? `${anonKey.substring(0, 20)}...` : 'MISSING'
  });
  
  if (!url || !anonKey || url === 'your_supabase_url' || anonKey === 'your_anon_key') {
    console.error('❌ Missing or invalid Supabase config');
    return null;
  }

  console.log('✅ Supabase config found');
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
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings to Date objects
        return parsed.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to parse local chats:', error);
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
    console.warn('⚠️ Supabase not configured - using local storage only');
    return false;
  }

  try {
    console.log('🔄 Initializing Supabase client...');
    
    // Create Supabase client with proper configuration
    supabase = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'vitashifa-auth'
      }
    });
    
    console.log('🔗 Supabase client created');
    
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('⚠️ Session check error:', error.message);
    } else if (session) {
      currentUser = session.user;
      console.log('👤 Existing session found:', currentUser.email);
    }
    
    // Set up auth state listener
    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      console.log('🔄 Auth state changed:', _event, currentUser?.email || 'No user');
    });
    
    isInitialized = true;
    console.log('✅ Supabase initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase initialization error:', error);
    return false;
  }
}

export const supabaseService = {
  // Initialize the service
  async initialize(): Promise<boolean> {
    return await initializeSupabase();
  },

  // Debug configuration
  debugConfig() {
    console.log('=== SUPABASE DEBUG INFO ===');
    const config = getSupabaseConfig();
    console.log('Config present:', !!config);
    console.log('Client initialized:', isInitialized);
    console.log('Client exists:', !!supabase);
    console.log('Current user:', currentUser?.email || 'None');
    console.log('Local storage auth key:', localStorage.getItem('vitashifa-auth') ? 'Present' : 'Missing');
  },

  // Check if Supabase is available
  isEnabled: (): boolean => {
    return isInitialized && !!supabase;
  },

  // Get current user
  getCurrentUser: () => currentUser,

  // Sign in anonymously (local only)
  async signInAnonymously() {
    console.log('🔒 Creating anonymous session...');
    
    const anonymousUser = {
      id: 'anon_' + Date.now(),
      email: null,
      user_metadata: { display_name: 'Guest User' },
      isAnonymous: true
    };
    
    LocalStorageManager.saveUser(anonymousUser);
    currentUser = anonymousUser as any;
    console.log('✅ Anonymous session created');
    return anonymousUser;
  },

  // Sign in with email
  async signInWithEmail(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      console.log('🔓 Attempting email sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned');
      }

      currentUser = data.user;
      console.log('✅ Sign in successful:', currentUser.email);
      
      // Update last login
      await this.updateLastLogin(data.user.id);
      
      return data.user;
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before signing in.');
      }
      
      throw error;
    }
  },

  // Sign up with email
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
      
      // ===================================================================
      // DELETE THE ENTIRE BLOCK BELOW. IT IS NOW HANDLED BY THE TRIGGER.
      // ===================================================================
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
      // ===================================================================
      // END OF BLOCK TO DELETE
      // ===================================================================
      
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

  // Sign out
  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    LocalStorageManager.clearAll();
    currentUser = null;
    console.log('👋 User signed out');
  },

  // Update last login timestamp
  async updateLastLogin(userId: string) {
    if (!supabase) return;
    
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.warn('Failed to update last login:', error);
    }
  },

  // Create or update user profile
  async createUserProfile(user: any): Promise<void> {
    if (!supabase || !user || user.id?.startsWith('anon_')) {
      return;
    }

    try {
      console.log('👤 Upserting user profile...');
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          last_login_at: new Date().toISOString(),
          is_anonymous: false,
          preferences: {
            language: localStorage.getItem('vitashifa-language') || 'en',
            theme: localStorage.getItem('vitashifa-theme') || 'system'
          }
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Profile upsert error:', error);
      } else {
        console.log('✅ Profile upserted successfully');
      }
    } catch (error) {
      console.error('❌ Profile operation failed:', error);
    }
  },

  // Save chat
  async saveChat(type: NavigationTab, query: string, response: FormattedResponse): Promise<string | null> {
    const chatData: ChatData = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type,
      timestamp: new Date(),
      query,
      response,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    };

    // Always save locally
    LocalStorageManager.saveChat(chatData);

    // Save to Supabase if available
    if (supabase && currentUser && !currentUser.id?.startsWith('anon_')) {
      try {
        const { error } = await supabase
          .from('chats')
          .insert({
            user_id: currentUser.id,
            type: type.toString(),
            timestamp: chatData.timestamp.toISOString(),
            query: chatData.query,
            response: chatData.response as any,
            metadata: chatData.metadata
          });

        if (error) {
          console.error('⚠️ Failed to save chat to cloud:', error);
        } else {
          console.log('✅ Chat saved to cloud');
        }
      } catch (error) {
        console.error('⚠️ Chat save error:', error);
      }
    }

    return chatData.id;
  },

  // Get chat history
  async getChatHistory(limit = 20): Promise<ChatData[]> {
    // Try Supabase first
    if (supabase && currentUser && !currentUser.id?.startsWith('anon_')) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (error) throw error;

        if (data) {
          return data.map(chat => ({
            id: chat.id,
            type: chat.type as NavigationTab,
            timestamp: new Date(chat.timestamp),
            query: chat.query,
            response: chat.response as FormattedResponse,
            metadata: chat.metadata
          }));
        }
      } catch (error) {
        console.error('Failed to load cloud chats:', error);
      }
    }

    // Fallback to local storage
    return LocalStorageManager.getChats().slice(-limit).reverse();
  },

  // Sync local data to cloud
  async syncLocalDataToSupabase() {
    if (!supabase || !currentUser || currentUser.id?.startsWith('anon_')) {
      return;
    }

    const localChats = LocalStorageManager.getChats();
    console.log(`🔄 Syncing ${localChats.length} local chats...`);

    for (const chat of localChats) {
      try {
        await this.saveChat(chat.type, chat.query, chat.response);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    console.log('✅ Sync complete');
  }
};