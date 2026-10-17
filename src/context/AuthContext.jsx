import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session via HttpOnly cookie on initial mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const response = await api.auth.getMe();
        if (isMounted && response?.success && response?.user) {
          setUser(response.user);
        }
      } catch (err) {
        // Not authenticated or token expired - session remains null
        try {
          localStorage.removeItem('wellsync_auth_token');
        } catch (e) {}
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const response = await api.auth.login({ email, password });
      if (response?.success && response?.user) {
        if (response.token) {
          try {
            localStorage.setItem('wellsync_auth_token', response.token);
          } catch (e) {}
        }
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response?.message || 'Login failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const register = async ({ name, email, password }) => {
    setAuthError(null);
    try {
      const response = await api.auth.register({ name, email, password });
      if (response?.success && response?.user) {
        if (response.token) {
          try {
            localStorage.setItem('wellsync_auth_token', response.token);
          } catch (e) {}
        }
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response?.message || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('[Logout error]:', err);
    } finally {
      try {
        localStorage.removeItem('wellsync_auth_token');
      } catch (e) {}
      setUser(null);
      setAuthError(null);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearError,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
