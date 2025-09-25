import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFirebase } from '../../contexts/FirebaseContext';
import { mealService } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function MealSchedule() {
  const { user } = useFirebase();
  const [mealList, setMealList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Bugünün tarihini al
  const today = new Date().getDate();
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Bugünün öğesinin indexini bul
  const getTodayIndex = useCallback(() => {
    if (mealList.length === 0) return -1;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return mealList.findIndex(item => {
      const itemDate = new Date(item.start);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === now.getTime();
    });
  }, [mealList]);

  const scrollToToday = useCallback((animated = true) => {
    const index = getTodayIndex();
    if (index !== -1) {
      setInitialIndex(index);
      // Küçük bir gecikme, liste mount olduğunda referans hazır olsun
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ index, animated });
        } catch (_) {}
      }, 100);
    }
  }, [getTodayIndex]);

  useEffect(() => {
    if (mealList.length > 0) {
      scrollToToday(true);
    }
  }, [mealList, scrollToToday]);

  // Ekran odaklandığında bugüne kaydır (tab değişimi / giriş-çıkış)
  useFocusEffect(
    useCallback(() => {
      scrollToToday(false);
    }, [scrollToToday])
  );

  const loadInitialData = async () => {
    try {
      // Önce önbellekten veriyi yükle
      const cachedData = await AsyncStorage.getItem('mealListCache');
      const lastUpdate = await AsyncStorage.getItem('mealListLastUpdate');
      const cachedReactions = await AsyncStorage.getItem('mealReactionsCache');
      
      if (cachedData && lastUpdate) {
        const parsedData = JSON.parse(cachedData);
        const lastUpdateTime = parseInt(lastUpdate);
        const now = Date.now();
        
        // Cache 24 saatten yeni ise kullan
        if (now - lastUpdateTime < 24 * 60 * 60 * 1000) {
          setMealList(parsedData);
          setLoading(false);
          
          if (cachedReactions) {
            const { reactions, userReactions } = JSON.parse(cachedReactions);
            setReactions(reactions);
            setUserReactions(userReactions);
          }
          return;
        }
      }
      
      // Cache yoksa veya eskiyse yeni veri çek
      await fetchMealData();
      
    } catch (error) {
      console.error('Initial data loading error:', error);
      setLoading(false);
    }
  };

  const fetchMealData = async () => {
    try {
        setLoading(true);
        setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await axios.get('https://sks.klu.edu.tr/Takvimler/73-yemek-takvimi.klu', {
        signal: controller.signal,
        timeout: 20000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);

      const htmlContent = response.data;
      const jsonDataMatch = htmlContent.match(/<textarea[^>]*>(.*?)<\/textarea>/s);
      
      if (!jsonDataMatch?.[1]) throw new Error('Veri formatı geçersiz');

      const jsonData = JSON.parse(jsonDataMatch[1]);
      if (!Array.isArray(jsonData)) throw new Error('Geçersiz veri formatı');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const processedData = jsonData
        .filter(item => {
        try {
          const date = new Date(item.start);
            return !isNaN(date.getTime()) && item.aciklama && date >= today;
        } catch {
          return false;
        }
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 10); // Sadece ilk 10 günü al

      const selectedData = processedData
        .filter(item => {
          const date = new Date(item.start);
          return date.getDay() !== 0 && date.getDay() !== 6;
        })
        .slice(0, 5);

      if (selectedData.length === 0) throw new Error('Gösterilecek yemek listesi bulunamadı');

      // Önbelleğe kaydet
      await AsyncStorage.setItem('mealListCache', JSON.stringify(selectedData));
      await AsyncStorage.setItem('mealListLastUpdate', Date.now().toString());

      setMealList(selectedData);
        setLoading(false);
    } catch (err) {
      console.error('Meal data fetch error:', err);
        setError(err.message || 'Yemek listesi yüklenirken bir hata oluştu');
        setLoading(false);
      
      // Önbellekteki eski veriyi kullan
      const cachedData = await AsyncStorage.getItem('mealListCache');
      if (cachedData) {
        setMealList(JSON.parse(cachedData));
        Alert.alert(
          'Uyarı',
          'Güncel veri alınamadı. Önbellekteki veri gösteriliyor.',
          [{ text: 'Tamam' }]
        );
      }
    }
  };

  // Reaksiyon verilerini önbellekten yükle - cache süresini 15 dakikaya çıkaralım
  const loadReactionsFromCache = async () => {
    try {
      const cachedReactions = await AsyncStorage.getItem('mealReactionsCache');
      if (cachedReactions) {
        const { reactions, userReactions, timestamp } = JSON.parse(cachedReactions);
        // Cache süresini 15 dakikaya çıkaralım
        if (Date.now() - timestamp < 15 * 60 * 1000) {
          setReactions(reactions);
          setUserReactions(userReactions);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading reactions from cache:', error);
      return false;
    }
  };

  // Reaksiyonları yükle - batch işlemi ekleyelim
  const loadReactions = async () => {
    if (!user || mealList.length === 0) return;
    
    try {
      const usedCache = await loadReactionsFromCache();
      if (usedCache) return;

      const reactionData = {};
      const userReactionData = {};

      for (const meal of mealList) {
        const reactions = await mealService.getMealReactions(meal.start);
        reactionData[meal.start] = {
          likes: reactions.like,
          dislikes: reactions.dislike
        };

        const userReaction = await mealService.getUserReaction(meal.start, user.uid);
        if (userReaction) {
          userReactionData[meal.start] = userReaction.reactionType;
        }
      }

      setReactions(reactionData);
      setUserReactions(userReactionData);

      await AsyncStorage.setItem('mealReactionsCache', JSON.stringify({
        reactions: reactionData,
        userReactions: userReactionData,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  useEffect(() => {
    if (user && mealList.length > 0) {
      loadReactions();
    }
  }, [mealList, user]);

  // Her öğün için gerçek zamanlı dinleme kur ve sayıları canlı güncelle
  useEffect(() => {
    if (!user || mealList.length === 0) return;

    const unsubscribers = mealList.map((meal) => {
      return mealService.onMealReactionsChange(meal.start, (liveReactions) => {
        setReactions((prev) => ({
          ...prev,
          [meal.start]: {
            likes: liveReactions.like,
            dislikes: liveReactions.dislike,
          },
        }));

        // Önbelleği de güncel tut
        (async () => {
          try {
            const cachedData = await AsyncStorage.getItem('mealReactionsCache');
            const cached = cachedData ? JSON.parse(cachedData) : { reactions: {}, userReactions: {}, timestamp: Date.now() };
            cached.reactions[meal.start] = {
              likes: liveReactions.like,
              dislikes: liveReactions.dislike,
            };
            cached.timestamp = Date.now();
            await AsyncStorage.setItem('mealReactionsCache', JSON.stringify(cached));
          } catch (_) {}
        })();
      });
    });

    return () => {
      unsubscribers.forEach((unsub) => {
        try { unsub && unsub(); } catch (_) {}
      });
    };
  }, [user, mealList]);

  const handleReaction = async (mealId, type) => {
    try {
      if (!user) {
        Alert.alert('Uyarı', 'Beğeni/beğenmeme için giriş yapmalısınız.');
        return;
      }

      const userId = user.uid;
      const oldReaction = userReactions[mealId];

      // Aynı tepkiye basılırsa kaldır (toggle off)
      if (oldReaction === type) {
        // Optimistic update: sayacı düşür, kullanıcı tepkisini temizle
        setReactions(prev => {
          const next = { ...prev };
          if (!next[mealId]) {
            next[mealId] = { likes: 0, dislikes: 0 };
          }
          next[mealId][type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (next[mealId][type === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
          return next;
        });
        setUserReactions(prev => {
          const next = { ...prev };
          delete next[mealId];
          return next;
        });

        await mealService.removeReaction(mealId, userId);

        // Önbelleği senkronize et
        const cachedData = await AsyncStorage.getItem('mealReactionsCache');
        if (cachedData) {
          const { reactions, userReactions, timestamp } = JSON.parse(cachedData);
          if (reactions[mealId]) {
            reactions[mealId][type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (reactions[mealId][type === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
          }
          delete userReactions[mealId];
          await AsyncStorage.setItem('mealReactionsCache', JSON.stringify({ reactions, userReactions, timestamp }));
        }
        return;
      }

      setReactions(prev => {
        const newReactions = { ...prev };
        if (!newReactions[mealId]) {
          newReactions[mealId] = { likes: 0, dislikes: 0 };
        }

        if (oldReaction) {
          newReactions[mealId][oldReaction === 'like' ? 'likes' : 'dislikes']--;
        }
        newReactions[mealId][type === 'like' ? 'likes' : 'dislikes']++;

        return newReactions;
      });

      setUserReactions(prev => ({
        ...prev,
        [mealId]: type
      }));

      await mealService.addReaction(mealId, userId, type);

      const cachedData = await AsyncStorage.getItem('mealReactionsCache');
      if (cachedData) {
        const { reactions, userReactions, timestamp } = JSON.parse(cachedData);
        reactions[mealId] = reactions[mealId] || { likes: 0, dislikes: 0 };
        
        if (oldReaction) {
          reactions[mealId][oldReaction === 'like' ? 'likes' : 'dislikes']--;
        }
        reactions[mealId][type === 'like' ? 'likes' : 'dislikes']++;
        userReactions[mealId] = type;

        await AsyncStorage.setItem('mealReactionsCache', JSON.stringify({
          reactions,
          userReactions,
          timestamp
        }));
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
      await loadReactions();
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
          colors={['#00BFFF', '#0099CC', '#0077AA']}
          style={[styles.card, isCurrentDay ? styles.cardToday : null]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dateContainer}>
            <View>
              <Text style={styles.dateText}>{formatDate(item.start)}</Text>
              <View style={styles.mealHoursContainer}>
                <View style={styles.mealHourBox}>
                  <Ionicons name="time" size={16} color="#FFFFFF" style={styles.timeIcon} />
                  <Text style={styles.mealHoursText}>Öğle: 11:00 - 14:00</Text>
                </View>
                <View style={styles.mealHourBox}>
                  <Ionicons name="time" size={16} color="#FFFFFF" style={styles.timeIcon} />
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
            {item.aciklama.split(/[,،]+/).filter(meal => meal.trim()).map((meal, idx) => (
              <View key={idx} style={styles.yemekContainer}>
                <Ionicons name={getIconForMeal(idx)} size={28} color="#FFFFFF" style={styles.yemekIcon} />
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
                  userReactions[item.start] === 'like' && styles.activeReactionButton,
                  !isCurrentDay && styles.reactionButtonDisabled
                ]}
                disabled={!isCurrentDay}
                onPress={() => isCurrentDay && handleReaction(item.start, 'like')}
              >
                <Ionicons 
                  name={userReactions[item.start] === 'like' ? "thumbs-up" : "thumbs-up-outline"} 
                  size={24} 
                  color={isCurrentDay ? "#fff" : "rgba(255,255,255,0.6)"} 
                />
                <Text style={styles.reactionCount}>
                  {reactions[item.start]?.likes || 0}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reactionButton, 
                  styles.dislikeButton,
                  userReactions[item.start] === 'dislike' && styles.activeReactionButton,
                  !isCurrentDay && styles.reactionButtonDisabled
                ]}
                disabled={!isCurrentDay}
                onPress={() => isCurrentDay && handleReaction(item.start, 'dislike')}
              >
                <Ionicons 
                  name={userReactions[item.start] === 'dislike' ? "thumbs-down" : "thumbs-down-outline"} 
                  size={24} 
                  color={isCurrentDay ? "#fff" : "rgba(255,255,255,0.6)"} 
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
      <ImageBackground
        source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/food-pattern-background-8Wd9Hy0Ue5Ue9Ue9Ue9Ue9Ue9Ue9.png' }}
        style={styles.container}
      >
        <LinearGradient 
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']} 
          style={styles.errorContainer}
        >
          <Ionicons name="restaurant-outline" size={60} color="#4ECDC4" />
          <Text style={[styles.errorText, { color: '#fff', fontSize: screenWidth * 0.045 }]}>
            Yemekler ilerleyen tarihlerde eklenecektir.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMealData}>
            <Text style={styles.retryButtonText}>Yenile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
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
          <Ionicons name="restaurant" size={40} color="#00BFFF" style={styles.headerIcon} />
          <Text style={styles.headerText}>Okul Yemek Listesi Güncel</Text>
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
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: initialIndex, animated: true });
            });
          }}
        />

        <View style={styles.paginationContainer}>
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
                style={[styles.paginationDot, { transform: [{ scale }], opacity }]}
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
    backgroundColor: '#0F0F0F',
  },
  header: {
    padding: screenWidth * 0.04,
    paddingTop: Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.02,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    marginBottom: 5,
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
    paddingVertical: screenHeight * 0.01,
    alignItems: 'center',
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: screenWidth * 0.02,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? screenHeight * 0.12 : screenHeight * 0.1,
    marginTop: -10,
    zIndex: 0,
    elevation: 0,
  },
  card: {
    borderRadius: 20,
    padding: screenWidth * 0.04,
    marginVertical: screenHeight * 0.01,
    alignItems: 'flex-start',
    height: Platform.OS === 'ios' ? screenHeight * 0.55 : screenHeight * 0.55,
    maxHeight: screenHeight * 0.6,
    zIndex: 0,
    elevation: 0,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  cardToday: {
    borderColor: '#DAA520',
    borderWidth: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
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
  paginationContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 180 : 100,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 20,
    zIndex: 999,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#4ECDC4',
    opacity: 0.3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  paginationDotActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
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
    padding: screenWidth * 0.04,
    gap: screenHeight * 0.02,
    backgroundColor: '#0F0F0F',
  },
  errorText: {
    color: '#fff',
    fontSize: screenWidth * 0.045,
    textAlign: 'center',
    marginVertical: screenHeight * 0.02,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.015,
    borderRadius: 10,
    marginTop: screenHeight * 0.02,
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
  reactionButtonDisabled: {
    opacity: 0.5,
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