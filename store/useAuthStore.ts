import { create } from 'zustand';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: { name: string; email: string; phone: string }) => Promise<boolean>;
  uploadAvatar: (imageUri: string) => Promise<boolean>;
}

const mapDatabaseUserToUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  phone: dbUser.phone,
  avatar: dbUser.avatar,
  createdAt: new Date(dbUser.createdAt),
  totalPointsEarned: dbUser.totalPointsEarned,
  currentPoints: dbUser.currentPoints,
  tierLevel: dbUser.tierLevel,
});

// Helper function to convert base64 to ArrayBuffer using Uint8Array
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      if (!email.trim()) {
        set({ authError: 'Please enter your email address.', isLoading: false });
        return false;
      }
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address.', isLoading: false });
        return false;
      }
      
      if (!password) {
        set({ authError: 'Please enter your password.', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters.', isLoading: false });
        return false;
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        let friendlyMessage = 'Login failed. Please try again.';
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please confirm your email before logging in.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }
      
      if (!authData.user) {
        set({ authError: 'Login failed. Please try again.', isLoading: false });
        return false;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profile) {
        set({ authError: 'Failed to load user profile.', isLoading: false });
        return false;
      }
      
      set({
        user: mapDatabaseUserToUser(profile),
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      
      return true;
    } catch (error) {
      set({
        authError: 'Login failed. Please try again.',
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      if (!name.trim()) {
        set({ authError: 'Please enter your name.', isLoading: false });
        return false;
      }
      
      if (!email.trim()) {
        set({ authError: 'Please enter your email address.', isLoading: false });
        return false;
      }
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address.', isLoading: false });
        return false;
      }
      
      if (!password) {
        set({ authError: 'Please enter a password.', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters.', isLoading: false });
        return false;
      }
      
      if (!phone.trim()) {
        set({ authError: 'Please enter your phone number.', isLoading: false });
        return false;
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });
      
      if (error) {
        let friendlyMessage = 'Signup failed. Please try again.';
        if (error.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Password')) {
          friendlyMessage = 'Password does not meet requirements.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }
      
      if (!authData.user) {
        set({ authError: 'Signup failed. Please try again.', isLoading: false });
        return false;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profile) {
        set({ authError: 'Failed to create user profile.', isLoading: false });
        return false;
      }
      
      set({
        user: mapDatabaseUserToUser(profile),
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      
      return true;
    } catch (error) {
      set({
        authError: 'Signup failed. Please try again.',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
      });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      
      set({
        user: mapDatabaseUserToUser(profile),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ authError: null }),

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  updateProfile: async (updates: { name: string; email: string; phone: string }): Promise<boolean> => {
    const { user } = get();
    
    if (!user) {
      set({ authError: 'User not found.' });
      return false;
    }
    
    try {
      set({ isLoading: true, authError: null });
      
      if (!updates.name.trim()) {
        set({ authError: 'Please enter your name.', isLoading: false });
        return false;
      }
      
      if (!updates.email.trim()) {
        set({ authError: 'Please enter your email address.', isLoading: false });
        return false;
      }
      
      if (!updates.email.includes('@')) {
        set({ authError: 'Please enter a valid email address.', isLoading: false });
        return false;
      }
      
      if (!updates.phone.trim()) {
        set({ authError: 'Please enter your phone number.', isLoading: false });
        return false;
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        set({
          authError: 'Failed to update profile. Please try again.',
          isLoading: false,
        });
        return false;
      }
      
      const updatedUser: User = {
        ...user,
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
      };
      
      set({
        user: updatedUser,
        isLoading: false,
        authError: null,
      });
      
      return true;
    } catch (error) {
      console.error('Profile update exception:', error);
      set({
        authError: 'Failed to update profile. Please try again.',
        isLoading: false,
      });
      return false;
    }
  },

  uploadAvatar: async (imageUri: string): Promise<boolean> => {
    const { user } = get();
    
    if (!user) {
      console.error('Upload avatar failed: User not found');
      set({ authError: 'User not found.' });
      return false;
    }
    
    try {
      console.log('Starting avatar upload for user:', user.id);
      
      // Verify session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('Upload avatar failed: No valid session', sessionError);
        set({ authError: 'Session expired. Please log in again.' });
        return false;
      }
      
      console.log('Session verified for avatar upload');
      
      // Read image as base64 using CORRECT API
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('Image read as base64, length:', base64.length);
      
      // Convert base64 to ArrayBuffer using native Uint8Array
      const arrayBuffer = base64ToArrayBuffer(base64);
      
      console.log('Base64 converted to ArrayBuffer, byteLength:', arrayBuffer.byteLength);
      
      // Generate unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading avatar to storage:', fileName);
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        set({ authError: 'Failed to upload avatar. Please try again.' });
        return false;
      }
      
      console.log('Avatar uploaded successfully:', uploadData.path);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      
      // Add cache busting timestamp to force image refresh
      const timestamp = Date.now();
      const publicUrl = `${publicUrlData.publicUrl}?t=${timestamp}`;
      
      console.log('Avatar public URL with cache busting:', publicUrl);
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Avatar URL update error:', updateError);
        set({ authError: 'Failed to update avatar. Please try again.' });
        return false;
      }
      
      console.log('Avatar URL updated in user profile');
      
      // Update local state immediately with cache-busted URL
      const updatedUser: User = {
        ...user,
        avatar: publicUrl,
      };
      
      set({
        user: updatedUser,
        authError: null,
      });
      
      console.log('Avatar upload completed successfully with immediate state update');
      return true;
    } catch (error) {
      console.error('Avatar upload exception:', error);
      set({
        authError: 'Failed to upload avatar. Please try again.',
      });
      return false;
    }
  },
}));