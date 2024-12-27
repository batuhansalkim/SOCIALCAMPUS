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
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from "../../FirebaseConfig";

const screenWidth = Dimensions.get('window').width;

export default function MealSchedule() {
  const [mealList, setMealList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMealData();
  }, []);

  useEffect(() => {
    if (mealList.length > 0) {
      fetchReactions();
    }
  }, [mealList]);

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
      const userId = 'user123';
      
      // Önce yerel state'i güncelle (anlık geri bildirim için)
      const newReactions = { ...reactions };
      const newUserReactions = { ...userReactions };
      
      // Eğer kullanıcının önceki reaksiyonu varsa
      if (userReactions[mealId]) {
        // Önceki reaksiyonu kaldır
        if (userReactions[mealId] === 'like') {
          newReactions[mealId].likes = Math.max(0, (newReactions[mealId]?.likes || 0) - 1);
        } else {
          newReactions[mealId].dislikes = Math.max(0, (newReactions[mealId]?.dislikes || 0) - 1);
        }
      }

      // Eğer aynı reaksiyona tıklanmışsa, sadece kaldır
      if (userReactions[mealId] === type) {
        delete newUserReactions[mealId];
      } else {
        // Yeni reaksiyonu ekle
        newUserReactions[mealId] = type;
        if (!newReactions[mealId]) {
          newReactions[mealId] = { likes: 0, dislikes: 0 };
        }
        if (type === 'like') {
          newReactions[mealId].likes = (newReactions[mealId]?.likes || 0) + 1;
        } else {
          newReactions[mealId].dislikes = (newReactions[mealId]?.dislikes || 0) + 1;
        }
      }

      // Yerel state'i güncelle
      setReactions(newReactions);
      setUserReactions(newUserReactions);

      // Firebase'i güncelle
      const reactionQuery = query(
        collection(FIRESTORE_DB, 'mealReactions'),
        where('mealId', '==', mealId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(reactionQuery);

      if (!querySnapshot.empty) {
        // Kullanıcının önceki reaksiyonu varsa
        const docRef = doc(FIRESTORE_DB, 'mealReactions', querySnapshot.docs[0].id);
        if (userReactions[mealId] === type) {
          // Aynı reaksiyon tekrar tıklandığında kaldır
          await deleteDoc(docRef);
        } else {
          // Farklı reaksiyon seçildiğinde güncelle
          await updateDoc(docRef, { type });
        }
      } else if (type !== userReactions[mealId]) {
        // Yeni reaksiyon ekle
        await addDoc(collection(FIRESTORE_DB, 'mealReactions'), {
          mealId,
          userId,
          type,
          createdAt: Timestamp.now()
        });
      }

    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Hata', 'Reaksiyon eklenirken bir hata oluştu.');
      // Hata durumunda önceki state'e geri dön
      fetchReactions();
    }
  };

  const fetchMealData = async () => {
    try {
      setLoading(true);
      console.log('Fetching meal data...');
      
      // Timeout ekleyelim
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

      const response = await axios.get('https://sks.klu.edu.tr/Takvimler/73-yemek-takvimi.klu', {
        signal: controller.signal,
        timeout: 10000
      });
      
      clearTimeout(timeoutId);
      console.log('Response received:', response.status);

      const htmlContent = response.data;
      const jsonDataMatch = htmlContent.match(/<textarea[^>]*>(.*?)<\/textarea>/s);
      
      if (!jsonDataMatch || !jsonDataMatch[1]) {
        throw new Error('Veri formatı beklendiği gibi değil.');
      }

      let jsonData;
      try {
        jsonData = JSON.parse(jsonDataMatch[1]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Yemek listesi verisi geçerli bir format değil.');
      }

      if (!Array.isArray(jsonData)) {
        throw new Error('Yemek listesi verisi dizi formatında değil.');
      }

      console.log('Parsed JSON data:', jsonData);
      
      // Geçerli tarihleri filtrele
      const validData = jsonData.filter(item => {
        try {
          const date = new Date(item.start);
          return !isNaN(date.getTime()) && item.aciklama;
        } catch {
          return false;
        }
      });
      
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
        throw new Error('Gösterilecek yemek listesi bulunamadı.');
      }

      // Get 5 weekdays starting from the found index
      let selectedData = [];
      let currentIndex = startIndex;
      let attempts = 0;
      const maxAttempts = sortedData.length; // Sonsuz döngüyü önlemek için

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
      
      if (selectedData.length === 0) {
        throw new Error('Gösterilecek yemek listesi bulunamadı.');
      }

      setMealList(selectedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching meal data:', err);
      setError(err instanceof Error ? err.message : 'Yemek listesi yüklenirken bir hata oluştu.');
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
      <StatusBar style="light" />
      <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} style={styles.header}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  weekendText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
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
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  mealHoursContainer: {
    marginTop: 5,
  },
  mealHourBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  timeIcon: {
    marginRight: 6,
  },
  mealHoursText: {
    fontSize: 14,
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
    justifyContent:  'center',
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
  reactionContainer: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  reactionButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 5,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});