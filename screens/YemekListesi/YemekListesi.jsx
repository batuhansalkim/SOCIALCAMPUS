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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

export default function MealSchedule() {
  const [mealList, setMealList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [gununSozu] = useState('Başarı, sabır ve azimle gelir.');

  useEffect(() => {
    fetchMealData();
  }, []);

  const fetchMealData = async () => {
    try {
      console.log('Fetching meal data...');
      const response = await axios.get('https://sks.klu.edu.tr/Takvimler/73-yemek-takvimi.klu');
      console.log('Response received:', response.status);

      const htmlContent = response.data;
      const jsonDataMatch = htmlContent.match(/<textarea[^>]*>(.*?)<\/textarea>/s);
      
      if (jsonDataMatch && jsonDataMatch[1]) {
        const jsonData = JSON.parse(jsonDataMatch[1]);
        console.log('Parsed JSON data:', jsonData);
        
        // Sort the data by date
        const sortedData = jsonData.sort((a, b) => new Date(a.start) - new Date(b.start));
        
        // Find the index of today or the next available day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startIndex = sortedData.findIndex(item => new Date(item.start) >= today);
        
        // Get 5 days starting from today or the next available day
        let selectedData = sortedData.slice(startIndex, startIndex + 5);
        
        // If we don't have 5 days, add days from the beginning of the list
        if (selectedData.length < 5) {
          selectedData = [...selectedData, ...sortedData.slice(0, 5 - selectedData.length)];
        }
        
        setMealList(selectedData);
      } else {
        throw new Error('Yemek listesi verisi bulunamadı.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching meal data:', err);
      setError('Yemek verileri yüklenirken bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

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

    const isCurrentDay = index === 0;

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient
          colors={isCurrentDay ? ['#FF6B6B', '#FF8E53', '#FFAF40'] : ['#4ECDC4', '#45B7AF', '#2C7873']}
          style={styles.card}
        >
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.start)}</Text>
            {isCurrentDay && <View style={styles.currentDayIndicator} />}
          </View>
          <ScrollView style={styles.mealScrollView}>
            {item.aciklama.split(',').map((meal, idx) => (
              <View key={idx} style={styles.yemekContainer}>
                <Ionicons name={getIconForMeal(idx)} size={28} color="#FFF" style={styles.yemekIcon} />
                <View style={styles.yemekDetails}>
                  <Text style={styles.yemekText}>{meal.trim()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Yemek listesi yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMealData}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mealList.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Yemek listesi bulunamadı.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMealData}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {formatDate(mealList[0]?.start)} - {formatDate(mealList[4]?.start)}
        </Text>
      </LinearGradient>
      
      <Animated.FlatList
        ref={flatListRef}
        data={mealList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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

      <View style={styles.pagination}>
        {mealList.map((_, i) => {
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
    height: 400,
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
    maxHeight: 250,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
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
    backgroundColor: 'black',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});