import React, { useState } from 'react'; 
import { NavigationContainer } from '@react-navigation/native'
import Navigator from './Navigator';
import OnboardingScreens from "../kluCampus/screens/onBoardingScren/onBoarding";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  if (showOnboarding) {
    return <OnboardingScreens onDone={() => setShowOnboarding(false)} />;
  }
  return (
    <NavigationContainer>
      <Navigator/>
    </NavigationContainer>
  )
}