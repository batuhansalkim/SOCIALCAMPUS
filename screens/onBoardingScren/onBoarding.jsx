import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Pagination from '../../components/Pagination';
import data from '../../data/data'; // Onboarding ekran verileri

const OnboardingScreen = ({ onDone }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animasyon değerleri
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animateTransition = (direction) => {
    // Yeni içerik için animasyon başlangıcı
    translateX.value = withTiming(direction * -width, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(0, {
      duration: 300,
    });

    setTimeout(() => {
      // Sayfa değişimi
      setCurrentIndex((prev) => prev + direction);

      // Yeni içerik animasyonu
      translateX.value = direction * width;
      opacity.value = 0;
      translateX.value = withTiming(0, {
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, {
        duration: 300,
      });
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      animateTransition(1); // İleri geçiş
    } else {
      onDone();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateTransition(-1); // Geri geçiş
    }
  };

  // Animasyonlu stiller
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container]}>
      {/* Animasyonlu içerik */}
      <Animated.View style={[animatedStyle, styles.animatedContent]}>
        {/* Görsel */}
        <Image source={data[currentIndex].image} style={styles.image} />
        {/* Başlık */}
        <Text style={[styles.title, { color: data[currentIndex].textColor }]}>
          {data[currentIndex].title}
        </Text>
        {/* Açıklama */}
        <Text style={[styles.text, { color: data[currentIndex].textColor }]}>
          {data[currentIndex].text}
        </Text>
      </Animated.View>

      {/* Sayfa Noktaları */}
      <Pagination data={data} currentIndex={currentIndex} />

      {/* İleri ve Geri Butonları */}
      <View style={styles.buttonContainer}>
        {/* Geri Butonu */}
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentIndex === 0}
          style={[
            styles.button,
            styles.backButton,
            currentIndex === 0 && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>Geri</Text>
        </TouchableOpacity>

        {/* Sonraki/Giriş Yap Butonu */}
        <TouchableOpacity onPress={handleNext} style={[styles.button, styles.nextButton]}>
          <Text style={styles.buttonText}>
            {currentIndex === data.length - 1 ? 'Giriş Yap' : 'Sonraki'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#002855', // Sabit koyu mavi arka plan
  },
  animatedContent: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  nextButton: {
    backgroundColor: '#007BFF',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
