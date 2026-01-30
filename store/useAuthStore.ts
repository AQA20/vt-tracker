import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          // Adjust endpoint based on actual backend
          const response = await api.post('/login', { email, password });
          const data = response.data;
          const token = data.token || data.access_token;
          const user = data.user || data.data?.user;

          if (!token) {
              // Optionally handle cookie-based session if no token
               console.warn("Login successful but no token access_token found.");
               // Assume cookie auth? But api.ts sends Bearer. so we need token.
               throw new Error("No access token received from server");
          }

          set({ token, user, isAuthenticated: true });
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Optional: Call logout endpoint logic
      },

       initialize: () => {
          // hydration handled by persist usually, but can check token validity here
       }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
