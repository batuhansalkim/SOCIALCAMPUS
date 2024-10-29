import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator';
import OnboardingScreens from "../kluCampus/screens/onBoardingScren/onBoarding";
import LoginScreen from "../kluCampus/screens/LoginScreen/LoginScren"

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Onboarding tamamlanınca çağrılacak işlev
  const handleDone = () => {
    setShowOnboarding(false);
  };

  // Login tamamlanınca çağrılacak işlev
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

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
