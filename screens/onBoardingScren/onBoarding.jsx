import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from 'react-native';
import Animated,{Easing, withTiming, useAnimatedStyle} from 'react-native-reanimated';
import data from '../../data/data'; // data.json'da ekran verilerinizi tutabilirsiniz

const OnboardingScreen = ({ onDone }) => {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDone(); // Onboarding tamamlandığında giriş ekranına geçiş
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(1.1, { duration: 300, easing: Easing.ease }), // Butonun animasyonu
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.screen, { width, height }]}>
        <Image source={data[currentIndex].image} style={styles.image} />
        <Text style={[styles.title, { color: data[currentIndex].textColor }]}>
          {data[currentIndex].title}
        </Text>
        <Text style={[styles.text, { color: data[currentIndex].textColor }]}>
          {data[currentIndex].text}
        </Text>
      </View>

      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>
            {currentIndex === data.length - 1 ? 'Giriş Yap' : 'Sonraki'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screen: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 40,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
