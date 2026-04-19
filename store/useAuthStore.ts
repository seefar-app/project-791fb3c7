import { create } from 'zustand';
import { User } from '@/types';
import { MOCK_USER } from '@/constants/Data';

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }
      
      // Success - use mock user
      set({ 
        user: MOCK_USER, 
        isAuthenticated: true, 
        isLoading: false,
        authError: null 
      });
      
      return true;
    } catch (error) {
      set({ 
        authError: 'Login failed. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      set({ isLoading: true, authError: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Mock validation
      if (!name.trim()) {
        set({ authError: 'Please enter your name', isLoading: false });
        return false;
      }
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ec4899&color=fff&size=200`,
        createdAt: new Date(),
        totalPointsEarned: 50, // Welcome bonus
        currentPoints: 50,
        tierLevel: 'bronze',
      };
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false,
        authError: null 
      });
      
      return true;
    } catch (error) {
      set({ 
        authError: 'Signup failed. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      authError: null 
    });
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      // Simulate checking stored auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      // For demo, start unauthenticated
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
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
    try {
      set({ isLoading: true, authError: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { user } = get();
      if (!user) {
        set({ authError: 'User not found', isLoading: false });
        return false;
      }
      
      // Update avatar URL if name changed
      const newAvatar = updates.name !== user.name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.name)}&background=ec4899&color=fff&size=200`
        : user.avatar;
      
      // Update user with new data
      const updatedUser: User = {
        ...user,
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        avatar: newAvatar,
      };
      
      set({ 
        user: updatedUser, 
        isLoading: false,
        authError: null 
      });
      
      return true;
    } catch (error) {
      set({ 
        authError: 'Failed to update profile. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },
}));