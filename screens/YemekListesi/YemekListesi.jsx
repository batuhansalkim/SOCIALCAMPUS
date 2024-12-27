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
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from "../../FirebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function MealSchedule() {
  const [mealList, setMealList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchMealData();
  }, []);

  useEffect(() => {
    if (mealList.length > 0) {
      fetchReactions();
    }
  }, [mealList]);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  useEffect(() => {
    if (mealList.length === 0) return;

    const reactionQuery = query(collection(FIRESTORE_DB, 'mealReactions'));
    const unsubscribe = onSnapshot(reactionQuery, (snapshot) => {
      const reactionData = {};
      const userReactionData = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!reactionData[data.mealId]) {
          reactionData[data.mealId] = { likes: 0, dislikes: 0 };
        }
        if (data.type === 'like') {
          reactionData[data.mealId].likes++;
        } else {
          reactionData[data.mealId].dislikes++;
        }
        if (currentUser && data.userId === currentUser.id) {
          userReactionData[data.mealId] = data.type;
        }
      });

      setReactions(reactionData);
      setUserReactions(userReactionData);
    }, (error) => {
      console.error('Error in reaction listener:', error);
    });

    return () => unsubscribe();
  }, [mealList, currentUser]);

  const fetchReactions = async () => {
    try {
      const reactionQuery = query(collection(FIRESTORE_DB, 'mealReactions'));
      const querySnapshot = await getDocs(reactionQuery);
      const reactionData = {};
      const userReactionData = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!reactionData[data.mealId]) {
          reactionData[data.mealId] = { likes: 0, dislikes: 0 };
        }
        if (data.type === 'like') {
          reactionData[data.mealId].likes++;
        } else {
          reactionData[data.mealId].dislikes++;
        }
        if (data.userId === 'user123') {
          userReactionData[data.mealId] = data.type;
        }
      });

      setReactions(reactionData);
      setUserReactions(userReactionData);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (mealId, type) => {
    try {
      if (!currentUser) {
        Alert.alert('Uyarı', 'Beğeni/beğenmeme için giriş yapmalısınız.');
        return;
      }

      const userId = currentUser.id;
      
      // Firebase'de reaksiyon kontrolü
      const reactionQuery = query(
        collection(FIRESTORE_DB, 'mealReactions'),
        where('mealId', '==', mealId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(reactionQuery);

      if (!querySnapshot.empty) {
        // Kullanıcının önceki reaksiyonu varsa
        const docRef = doc(FIRESTORE_DB, 'mealReactions', querySnapshot.docs[0].id);
        if (querySnapshot.docs[0].data().type === type) {
          // Aynı reaksiyon tekrar tıklandığında kaldır
          await deleteDoc(docRef);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Farklı reaksiyon seçildiğinde güncelle
          await updateDoc(docRef, { 
            type,
            updatedAt: Timestamp.now()
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } else {
        // Yeni reaksiyon ekle
        await addDoc(collection(FIRESTORE_DB, 'mealReactions'), {
          mealId,
          userId,
          type,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.');
    }
  };

  const fetchMealData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching meal data...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

      const response = await axios.get('https://sks.klu.edu.tr/Takvimler/73-yemek-takvimi.klu', {
        signal: controller.signal,
        timeout: 30000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      console.log('Response received:', response.status);

      if (!response.data) {
        throw new Error('Veri alınamadı');
      }

      const htmlContent = response.data;
      const jsonDataMatch = htmlContent.match(/<textarea[^>]*>(.*?)<\/textarea>/s);
      
      if (!jsonDataMatch || !jsonDataMatch[1]) {
        throw new Error('Veri formatı beklendiği gibi değil');
      }

      let jsonData;
      try {
        jsonData = JSON.parse(jsonDataMatch[1]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Yemek listesi verisi geçerli bir format değil');
      }

      if (!Array.isArray(jsonData)) {
        throw new Error('Yemek listesi verisi dizi formatında değil');
      }

      console.log('Parsed JSON data length:', jsonData.length);
      
      // Geçerli tarihleri filtrele
      const validData = jsonData.filter(item => {
        try {
          const date = new Date(item.start);
          return !isNaN(date.getTime()) && item.aciklama;
        } catch {
          return false;
        }
      });
      
      if (validData.length === 0) {
        throw new Error('Gösterilecek yemek listesi bulunamadı');
      }

      // Sort the data by date
      const sortedData = validData.sort((a, b) => new Date(a.start) - new Date(b.start));
      
      // Get the current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find the index of today's date
      const todayIndex = sortedData.findIndex(item => {
        const itemDate = new Date(item.start);
        return itemDate.getTime() === today.getTime();
      });

      // If today's date is found, start from there. Otherwise, start from the first weekday
      let startIndex = todayIndex !== -1 ? todayIndex : sortedData.findIndex(item => {
        const itemDate = new Date(item.start);
        return itemDate >= today && itemDate.getDay() !== 0 && itemDate.getDay() !== 6;
      });

      if (startIndex === -1) {
        startIndex = 0; // Eğer uygun tarih bulunamazsa en baştan başla
      }

      // Get 5 weekdays starting from the found index
      let selectedData = [];
      let currentIndex = startIndex;
      let attempts = 0;
      const maxAttempts = sortedData.length;

      while (selectedData.length < 5 && currentIndex < sortedData.length && attempts < maxAttempts) {
        const itemDate = new Date(sortedData[currentIndex].start);
        if (itemDate.getDay() !== 0 && itemDate.getDay() !== 6) {
          selectedData.push(sortedData[currentIndex]);
        }
        currentIndex++;
        attempts++;
      }

      // If we don't have 5 days, add days from the beginning
      currentIndex = 0;
      attempts = 0;
      while (selectedData.length < 5 && attempts < maxAttempts) {
        const itemDate = new Date(sortedData[currentIndex].start);
        if (itemDate.getDay() !== 0 && 
            itemDate.getDay() !== 6 && 
            !selectedData.some(item => item.start === sortedData[currentIndex].start)) {
          selectedData.push(sortedData[currentIndex]);
        }
        currentIndex = (currentIndex + 1) % sortedData.length;
        attempts++;
      }

      console.log('Selected data length:', selectedData.length);
      setMealList(selectedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching meal data:', err);
      setError(err.message || 'Yemek listesi yüklenirken bir hata oluştu');
      setLoading(false);
      Alert.alert(
        'Hata',
        'Yemek listesi yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
        [
          {
            text: 'Tekrar Dene',
            onPress: () => fetchMealData()
          }
        ]
      );
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

    const date = new Date(item.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrentDay = date.getTime() === today.getTime();
    const isPastDay = date < today;

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient
          colors={isCurrentDay ? ['#FF6B6B', '#FF8E53', '#FFAF40'] : isPastDay ? ['#A9A9A9', '#808080', '#696969'] : ['#4ECDC4', '#45B7AF', '#2C7873']}
          style={styles.card}
        >
          <View style={styles.dateContainer}>
            <View>
              <Text style={styles.dateText}>{formatDate(item.start)}</Text>
              <View style={styles.mealHoursContainer}>
                <View style={styles.mealHourBox}>
                  <Ionicons name="time" size={16} color="#FFD700" style={styles.timeIcon} />
                  <Text style={styles.mealHoursText}>Öğle: 11:00 - 14:00</Text>
                </View>
                <View style={styles.mealHourBox}>
                  <Ionicons name="time" size={16} color="#FFD700" style={styles.timeIcon} />
                  <Text style={styles.mealHoursText}>Akşam: 16:00 - 18:00</Text>
                </View>
              </View>
            </View>
            {isCurrentDay && <View style={styles.currentDayIndicator} />}
          </View>
          <ScrollView 
            style={styles.mealScrollView}
            showsVerticalScrollIndicator={false}
          >
            {item.aciklama.split(',').map((meal, idx) => (
              <View key={idx} style={styles.yemekContainer}>
                <Ionicons name={getIconForMeal(idx)} size={28} color="#FFF" style={styles.yemekIcon} />
                <View style={styles.yemekDetails}>
                  <Text style={styles.yemekText}>{meal.trim()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.reactionContainer}>
            <View style={styles.reactionButtonGroup}>
              <TouchableOpacity 
                style={[
                  styles.reactionButton, 
                  styles.likeButton,
                  userReactions[item.start] === 'like' && styles.activeReactionButton
                ]}
                onPress={() => handleReaction(item.start, 'like')}
              >
                <Ionicons 
                  name={userReactions[item.start] === 'like' ? "thumbs-up" : "thumbs-up-outline"} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.reactionCount}>
                  {reactions[item.start]?.likes || 0}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reactionButton, 
                  styles.dislikeButton,
                  userReactions[item.start] === 'dislike' && styles.activeReactionButton
                ]}
                onPress={() => handleReaction(item.start, 'dislike')}
              >
                <Ionicons 
                  name={userReactions[item.start] === 'dislike' ? "thumbs-down" : "thumbs-down-outline"} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.reactionCount}>
                  {reactions[item.start]?.dislikes || 0}
                </Text>
              </TouchableOpacity>
            </View>
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
      <LinearGradient 
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} 
        style={styles.container}
      >
        <StatusBar style="light" />
        <LinearGradient 
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} 
          style={styles.header}
        >
          <Ionicons name="restaurant" size={40} color="#FFD700" style={styles.headerIcon} />
          <Text style={styles.headerText}>Okul Yemek Listesi</Text>
          <Text style={styles.subHeaderText}>
            {formatDate(mealList[0]?.start)} - {formatDate(mealList[mealList.length - 1]?.start)}
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
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
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
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: screenWidth * 0.04,
paddingTop: Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.02,    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: screenHeight * 0.01,
  },
  headerText: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: screenWidth * 0.035,
    color: '#ddd',
    textAlign: 'center',
    marginTop: screenHeight * 0.005,
  },
  flatListContent: {
    paddingVertical: screenHeight * 0.02,
    alignItems: 'center',
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: screenWidth * 0.02,
    justifyContent: 'center',
    paddingBottom: screenHeight * 0.02,
    paddingTop: screenHeight * 0.01,
  },
  card: {
    borderRadius: 15,
    padding: screenWidth * 0.04,
    marginVertical: screenHeight * 0.01,
    alignItems: 'flex-start',
    height: Platform.OS === 'ios' ? screenHeight * 0.52 : screenHeight * 0.55,
    maxHeight: screenHeight * 0.58,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: screenHeight * 0.015,
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: screenHeight * 0.008,
  },
  mealHoursContainer: {
    marginTop: screenHeight * 0.008,
  },
  mealHourBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: screenHeight * 0.006,
    paddingHorizontal: screenWidth * 0.025,
    borderRadius: 8,
    marginVertical: 2,
  },
  timeIcon: {
    marginRight: screenWidth * 0.02,
  },
  mealHoursText: {
    fontSize: screenWidth * 0.038,
    color: '#fff',
    fontWeight: '500',
  },
  currentDayIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  mealScrollView: {
    flex: 1,
    width: '100%',
    marginVertical: screenHeight * 0.01,
  },
  yemekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.012,
    paddingHorizontal: screenWidth * 0.02,
    paddingVertical: screenHeight * 0.008,
  },
  yemekIcon: {
    marginRight: screenWidth * 0.03,
    fontSize: screenWidth * 0.07,
  },
  yemekDetails: {
    flex: 1,
  },
  yemekText: {
    fontSize: screenWidth * 0.04,
    color: '#fff',
    flexWrap: 'wrap',
    lineHeight: screenHeight * 0.028,
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? screenHeight * 0.12 : screenHeight * 0.08,
    left: 0,
    right: 0,
    height: screenHeight * 0.02,
    zIndex: 999,
  },
  dot: {
    height: screenWidth * 0.015,
    width: screenWidth * 0.015,
    borderRadius: screenWidth * 0.0075,
    backgroundColor: '#000',
    marginHorizontal: screenWidth * 0.01,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    marginTop: screenHeight * 0.01,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: screenWidth * 0.04,
  },
  errorText: {
    color: '#ff0000',
    fontSize: screenWidth * 0.04,
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.015,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.038,
    fontWeight: 'bold',
  },
  reactionContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: screenHeight * 0.015,
    paddingBottom: screenHeight * 0.008,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  reactionButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Platform.OS === 'ios' ? screenWidth * 0.06 : screenWidth * 0.05,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: screenWidth * 0.03,
    borderRadius: 8,
    gap: screenWidth * 0.02,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#FF5252',
  },
  activeReactionButton: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  reactionCount: {
    color: '#fff',
    fontSize: screenWidth * 0.034,
    fontWeight: 'bold',
    marginLeft: screenWidth * 0.01,
  },
});