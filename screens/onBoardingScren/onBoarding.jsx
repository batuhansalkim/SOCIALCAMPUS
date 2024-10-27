import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
  },
});

const ImageWrapper = ({ source }) => (
  <View style={styles.container}>
    <Image
      source={{ uri: source }}
      style={styles.image}
    />
  </View>
);

export default function OnboardingScreens({ onDone }: { onDone: () => void }) {
  return (
    <Onboarding
      onDone={onDone}
      onSkip={onDone}
      pages={[
        {
          backgroundColor: '#E6F3FF',
          image: <ImageWrapper source="https://via.placeholder.com/400x400.png?text=Welcome" />,
          title: 'Merhaba',
          subtitle: 'kluCmpus öğrenciler için tasarlanmış harika bir uygulama',
        },
        {
          backgroundColor: '#F3E6FF',
          image: <ImageWrapper source="https://via.placeholder.com/400x400.png?text=Food+List" />,
          title: 'Yemek Listesi',
          subtitle: 'Bugün ne yiyeceğinizi tek tıkla öğrenin',
        },
        {
          backgroundColor: '#FFF3E6',
          image: <ImageWrapper source="https://via.placeholder.com/400x400.png?text=Agenda" />,
          title: 'Gündem',
          subtitle: 'Güncel haberler ve etkinlikleri takip edin',
        },
        {
          backgroundColor: '#E6FFF3',
          image: <ImageWrapper source="https://via.placeholder.com/400x400.png?text=Clubs" />,
          title: 'Kulüpler',
          subtitle: 'Okul kulüplerine katılın ve etkinlikleri keşfedin',
        },
        {
          backgroundColor: '#FFE6F3',
          image: <ImageWrapper source="https://via.placeholder.com/400x400.png?text=Sales" />,
          title: 'Satış',
          subtitle: 'Öğrencilere özel indirimlerden yararlanın',
        },
      ]}
    />
  );
}