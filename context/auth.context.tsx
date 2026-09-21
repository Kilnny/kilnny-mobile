import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiClient } from '@/config/axios.config';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  completeRegistration: () => Promise<void>;
  updateUser: (updates: Partial<Pick<User, 'name' | 'picture'>>) => Promise<User>;
  uploadUserPicture: (file: { uri: string; name: string; type: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUserSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const [token, refreshToken, userString] = await Promise.all([
          AsyncStorage.getItem('@auth_token'),
          AsyncStorage.getItem('@refresh_token'),
          AsyncStorage.getItem('@auth_user')
        ]);
        
        if (token && refreshToken && userString) {
          const user = JSON.parse(userString);
          setState({
            isAuthenticated: true,
            user,
            token,
            refreshToken,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadTokens();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      
      await Promise.all([
        AsyncStorage.setItem('@auth_token', data.access_token),
        AsyncStorage.setItem('@refresh_token', data.refresh_token),
        AsyncStorage.setItem('@auth_user', JSON.stringify(data.user))
      ]);

      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.access_token,
        refreshToken: data.refresh_token,
        isLoading: false,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const data = await apiClient.post('/auth/register', { email, name, password, source: 'mobile' });

      await Promise.all([
        AsyncStorage.setItem('@auth_token', data.access_token),
        AsyncStorage.setItem('@refresh_token', data.refresh_token),
        AsyncStorage.setItem('@auth_user', JSON.stringify(data.user))
      ]);

      setState({
        isAuthenticated: false,
        user: data.user,
        token: data.access_token,
        refreshToken: data.refresh_token,
        isLoading: false,
      });

      // Don't auto-redirect — let the register screen navigate to verify
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const completeRegistration = async () => {
    try {
      const [token, refreshToken, userString] = await Promise.all([
        AsyncStorage.getItem('@auth_token'),
        AsyncStorage.getItem('@refresh_token'),
        AsyncStorage.getItem('@auth_user')
      ]);

      if (token && refreshToken && userString) {
        const user = JSON.parse(userString);
        setState({
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error completing registration:', error);
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'picture'>>) => {
    if (!state.user) {
      throw new Error('No hay una sesión activa');
    }

    const updatedUser = await apiClient.put(`/users/${state.user.id}`, updates);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
    return updatedUser;
  };

  const uploadUserPicture = async (file: { uri: string; name: string; type: string }) => {
    if (!state.user) {
      throw new Error('No hay una sesión activa');
    }

    const updatedUser = await apiClient.upload(`/users/${state.user.id}/picture`, file);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
    return updatedUser;
  };

  const refreshUserSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      
      if (!refreshToken) {
        return false;
      }
      
      const data = await apiClient.post('/auth/refresh', { refreshToken });
      
      await Promise.all([
        AsyncStorage.setItem('@auth_token', data.access_token),
        AsyncStorage.setItem('@refresh_token', data.refresh_token)
      ]);
      
      setState(prev => ({
        ...prev,
        token: data.access_token,
        refreshToken: data.refresh_token
      }));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      if (refreshToken) {
        try {
          await apiClient.post('/auth/logout', { refreshToken });
        } catch (error) {
          console.warn('Server logout failed:', error);
        }
      }
      
      await Promise.all([
        AsyncStorage.removeItem('@auth_token'),
        AsyncStorage.removeItem('@refresh_token'),
        AsyncStorage.removeItem('@auth_user')
      ]);

      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
      });

      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        completeRegistration,
        updateUser,
        uploadUserPicture,
        logout,
        refreshUserSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};