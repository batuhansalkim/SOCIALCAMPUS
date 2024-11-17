// import Pagination from '../../components/Pagination';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import Pagination from '../../components/Pagination';
import data from '../../data/data'; // Onboarding ekran verileri

const OnboardingScreen = ({ onDone }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDone();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: data[currentIndex].backgroundColor }]}>
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

      {/* Sayfa Noktaları */}
      <Pagination data={data} currentIndex={currentIndex} />

      {/* İleri ve Geri Butonları */}
      <View style={styles.buttonContainer}>
        {/* Geri Butonu */}
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentIndex === 0} // İlk sayfada pasif hale getirildi
          style={[
            styles.button,
            styles.backButton,
            currentIndex === 0 && styles.disabledButton, // Pasif stil
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
    backgroundColor: '#d3d3d3', // Pasif buton rengi
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
