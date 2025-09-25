import { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';

export const useFirebaseAuth = () => {
  const { user, userData, loading, authService } = useFirebase();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await authService.login(email, password);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await authService.register(email, password, displayName);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await authService.logout();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    userData,
    loading: loading || authLoading,
    error: authError,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}; 