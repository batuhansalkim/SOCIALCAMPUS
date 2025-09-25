import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService } from '../services/firebase';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AsyncStorage'dan kullanıcı bilgilerini kontrol et
  const checkAsyncStorageUser = async () => {
    try {
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (userLoggedIn === 'true' && userDataStr) {
        const localUserData = JSON.parse(userDataStr);
        
        // Local user objesi oluştur (Firebase user'a benzer)
        const localUser = {
          uid: localUserData.id,
          displayName: localUserData.fullName,
          isAnonymous: localUserData.id.startsWith('local_'),
          ...localUserData
        };
        
        return { user: localUser, userData: localUserData };
      }
      return { user: null, userData: null };
    } catch (error) {
      console.error('Error checking AsyncStorage user:', error);
      return { user: null, userData: null };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Önce AsyncStorage'dan kontrol et
      const { user: localUser, userData: localUserData } = await checkAsyncStorageUser();
      
      if (localUser) {
        // Local user varsa onu kullan
        setUser(localUser);
        setUserData(localUserData);
        setLoading(false);
        return;
      }

      // Local user yoksa Firebase auth'u dinle
      const unsubscribe = authService.onAuthStateChange(async (authUser) => {
        setUser(authUser);
        
        if (authUser) {
          try {
            const data = await userService.getUser(authUser.uid);
            setUserData(data);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    userData,
    loading,
    authService,
    userService
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}; 