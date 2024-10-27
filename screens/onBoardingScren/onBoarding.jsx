import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20, // Görsel ile metin arasında boşluk bırakır
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  skipButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const PageContent = ({ image, title, subtitle }) => (
  <View style={styles.container}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: image }} style={styles.image} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </View>
);

const SkipButton = ({ ...props }) => (
  <TouchableOpacity style={styles.skipButton} {...props}>
    <Text style={styles.skipButtonText}>Geç</Text>
  </TouchableOpacity>
);

export default function OnboardingScreens({ onDone = () => {} }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <SkipButton onPress={onDone} />
      <Onboarding
        onDone={onDone}
        onSkip={onDone}
        bottomBarHighlight={false}
        showSkip={false}
        showNext={false}
        showDone={false}
        containerStyles={{ paddingBottom: 20 }}
        pages={[
          {
            backgroundColor: '#E6F3FF',
            image: <PageContent 
              image="https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg"
              title="Merhaba"
              subtitle="KLUcampus öğrenciler için tasarlanmış harika bir uygulama"
            />,
          },
          {
            backgroundColor: '#F3E6FF',
            image: <PageContent 
              image="https://img.freepik.com/free-vector/organic-flat-people-meditating-illustration_23-2148906556.jpg"
              title="Yemek Listesi"
              subtitle="Bugün ne yiyeceğinizi tek tıkla öğrenin"
            />,
          },
          {
            backgroundColor: '#FFF3E6',
            image: <PageContent 
              image="https://img.freepik.com/free-vector/hand-drawn-college-entrance-exam-illustration_23-2149884344.jpg"
              title="Gündem"
              subtitle="Güncel haberler ve etkinlikleri takip edin"
            />,
          },
          {
            backgroundColor: '#E6FFF3',
            image: <PageContent 
              image="https://img.freepik.com/free-vector/group-young-people-posing-photo_52683-18823.jpg"
              title="Kulüpler"
              subtitle="Okul kulüplerine katılın ve etkinlikleri keşfedin"
            />,
          },
          {
            backgroundColor: '#FFE6F3',
            image: <PageContent 
              image="https://img.freepik.com/free-vector/shop-with-sign-we-are-open_23-2148547718.jpg"
              title="Satış"
              subtitle="Öğrencilere özel indirimlerden yararlanın"
            />,
          },
        ]}
      />
    </SafeAreaView>
  );
}
