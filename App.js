import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator';
import OnboardingScreens from "../kluCampus/screens/onBoardingScren/onBoarding";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleDone = () => {
    setShowOnboarding(false);
  };

  return (
    <NavigationContainer>
      {showOnboarding ? (
        <OnboardingScreens onDone={handleDone} />  
      ) : (
      <Navigator />
      )}
    </NavigationContainer>
  );
}
