import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigator from './Navigator';
import OnboardingScreens from "./screens/onBoardingScren/onBoarding";
import LoginScreen from "./screens/LoginScreen/LoginScren"

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');

      if (hasLaunched === 'true') {
        setShowOnboarding(false);
      }

      if (userLoggedIn === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('userLoggedIn', 'true');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error saving login status:', error);
    }
  };

  if (isLoading) {
    return null; // veya bir loading spinner gösterebilirsiniz
  }

  return (
    <NavigationContainer>
      {showOnboarding ? (
        <OnboardingScreens onDone={handleDone} />
      ) : !isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Navigator />
      )}
    </NavigationContainer>
  );
}