import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
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

const YemekListesi = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [gununSozu, setGununSozu] = useState('Başarı, sabır ve azimle gelir.');

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    setCurrentDate(formattedDate);

    const weekdays = yemekListesi.filter(item => {
      const dayOfWeek = new Date(item.tarih).getDay();
      return dayOfWeek !== 6 && dayOfWeek !== 0;
    });
    setFilteredList(weekdays);

    // Scroll to current day
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart" size={20} color="#fff" />
              <Text style={styles.feedbackText}>Beğen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton}>
              <Ionicons name="alert-circle" size={20} color="#fff" />
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
      <View style={styles.footer}>
        <Text style={styles.footerText}>Günün Sözü: <Text style={styles.gununSozu}>{gununSozu}</Text></Text>
      </View>
    </ImageBackground>
  );
};

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
    alignItems: 'center', // Yemeklerin ortalanması için
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: 20,
    justifyContent: 'center', // Kartın içeriğinin ortalanması için
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    alignItems: 'flex-start',
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
    marginTop: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
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
});

export default YemekListesi;
