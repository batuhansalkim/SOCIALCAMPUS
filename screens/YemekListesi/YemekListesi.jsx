import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const screenWidth = Dimensions.get('window').width;

// Yemek verileri (örnek)
const yemekListesi = [
  { tarih: '2024-04-22', yemekler: ['Kuru Fasulye', 'Pilav', 'Ayran', 'Baklava'], ratings: [4.5, 4.2, 3.8, 4.7] },
  { tarih: '2024-04-23', yemekler: ['Mercimek Çorbası', 'Tavuk Şiş', 'Salata', 'Sütlaç'], ratings: [4.0, 4.5, 3.5, 4.3] },
  { tarih: '2024-04-24', yemekler: ['Etli Nohut', 'Bulgur Pilavı', 'Cacık', 'Revani'], ratings: [4.2, 3.9, 4.0, 4.6] },
  { tarih: '2024-04-25', yemekler: ['Balık', 'Şehriyeli Pilav', 'Limonata', 'Kadayıf'], ratings: [4.7, 4.1, 4.3, 4.4] },
  { tarih: '2024-04-26', yemekler: ['Izgara Köfte', 'Patates Püresi', 'Ayran', 'Meyve'], ratings: [4.6, 4.0, 3.7, 3.9] }
];

export default function Component() {
  const [currentDate, setCurrentDate] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [gununSozu, setGununSozu] = useState('Başarı, sabır ve azimle gelir.');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);

    const weekdays = yemekListesi.filter(item => {
      const dayOfWeek = new Date(item.tarih).getDay();
      return dayOfWeek !== 6 && dayOfWeek !== 0;
    });
    setFilteredList(weekdays);

    const currentIndex = weekdays.findIndex(item => item.tarih === formattedDate);
    if (currentIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: currentIndex, animated: false });
    }
  }, []);

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const isCurrentDay = item.tarih === currentDate;

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient
          colors={isCurrentDay ? ['#FF6B6B', '#FF8E53', '#FFAF40'] : ['#4ECDC4', '#45B7AF', '#2C7873']}
          style={styles.card}
        >
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.tarih)}</Text>
            {isCurrentDay && <View style={styles.currentDayIndicator} />}
          </View>
          <ScrollView style={styles.mealScrollView}>
            {item.yemekler.map((yemek, idx) => (
              <View key={idx} style={styles.yemekContainer}>
                <Ionicons name={getIconForMeal(idx)} size={28} color="#FFF" style={styles.yemekIcon} />
                <View style={styles.yemekDetails}>
                  <Text style={styles.yemekText}>{yemek}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.ratings[idx].toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <View style={styles.leftButtons}>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="thumbs-up" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.dislikeButton}>
                <Ionicons name="thumbs-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.feedbackButton}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.feedbackText}>Geri Bildirim</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const getIconForMeal = (index) => {
    const icons = ['restaurant', 'pizza', 'cafe', 'ice-cream'];
    return icons[index] || 'restaurant';
  };

  return (
    <ImageBackground
      source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/food-pattern-background-8Wd9Hy0Ue5Ue9Ue9Ue9Ue9Ue9Ue9.png' }}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} style={styles.header}>
        <Ionicons name="restaurant" size={40} color="#FFD700" style={styles.headerIcon} />
        <Text style={styles.headerText}>Okul Yemek Listesi</Text>
        <Text style={styles.subHeaderText}>
          {formatDate(filteredList[0]?.tarih)} - {formatDate(filteredList[4]?.tarih)}
        </Text>
      </LinearGradient>
      <Animated.FlatList
        ref={flatListRef}
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.tarih}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
      />

      {/* Animated Slider */}
      <View style={styles.pagination}>
        {filteredList.map((_, i) => {
          const scale = scrollX.interpolate({
            inputRange: [
              (i - 1) * screenWidth,
              i * screenWidth,
              (i + 1) * screenWidth,
            ],
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange: [
              (i - 1) * screenWidth,
              i * screenWidth,
              (i + 1) * screenWidth,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ scale }], opacity }]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Günün Sözü: <Text style={styles.gununSozu}>{gununSozu}</Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginTop: 5,
  },
  flatListContent: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    alignItems: 'flex-start',
    height: 500, // Fixed height for consistent card size
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentDayIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  mealScrollView: {
    maxHeight: 350, // Adjust this value as needed
    width: '100%',
  },
  yemekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  yemekIcon: {
    marginRight: 10,
  },
  yemekDetails: {
    flex: 1,
  },
  yemekText: {
    fontSize: 18,
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  leftButtons: {
    flexDirection: 'row',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  dislikeButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 10,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 10,
  },
  feedbackText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
  },
  gununSozu: {
    fontStyle: 'italic',
    color: '#FFD700',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    marginHorizontal: 8,
  },
});
