import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Dimensions, ActivityIndicator, Platform, StatusBar, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio-without-node-native';
import ClubDetailsModal from './ClubDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const PAGE_SIZE = 10; // Her sayfada gösterilecek kulüp sayısı

const Kulüp = ({ navigation }) => {
  const [clubs, setClubs] = useState([]);
  const [displayedClubs, setDisplayedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (clubs.length > 0) {
      loadMoreClubs();
    }
  }, [clubs]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (navigation) {
          navigation.getParent()?.setOptions({
            tabBarStyle: {
              display: 'none'
            }
          });
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (navigation) {
          navigation.getParent()?.setOptions({
            tabBarStyle: {
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderTopWidth: 0,
              height: 60,
              paddingBottom: 10
            }
          });
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [navigation]);

  const loadMoreClubs = () => {
    if (loadingMore || searchQuery) return;

    setLoadingMore(true);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const newClubs = clubs.slice(0, endIndex);
    
    setDisplayedClubs(newClubs);
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  };

  const handleEndReached = () => {
    if (!searchQuery) {
      loadMoreClubs();
    }
  };

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clubs...');

      // Önce önbellekteki verileri kontrol et
      const cachedData = await AsyncStorage.getItem('clubs_data');
      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        // Son 1 saat içinde kaydedilmiş veriler varsa kullan
        if (Date.now() - timestamp < 3600000) {
          console.log('Using cached data');
          setClubs(data);
          setLoading(false);
          return;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await axios.get('https://ogrkulup.klu.edu.tr/', {
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

      const $ = cheerio.load(response.data);
      const clubsData = [];

      $('.col-lg-4').each((index, element) => {
        try {
          const name = $(element).find('h3 a').text().trim();
          const image = $(element).find('img').attr('src');
          const details = $(element).find('.card-text').text().trim().split('\n');
          const president = details[0]?.replace('Kulüp Başkanı:', '').trim() || 'Belirtilmemiş';
          const advisor = details[1]?.replace('Kulüp Danışmanı:', '').trim() || 'Belirtilmemiş';
          const instagramLink = $(element).find('a.btn-instagram').attr('href');

          if (!name) {
            console.warn(`Kulüp #${index + 1} için isim bulunamadı, atlanıyor`);
            return;
          }

          clubsData.push({
            id: index.toString(),
            name,
            image: image ? (image.startsWith('http') ? image : `https://ogrkulup.klu.edu.tr${image}`) : 'https://via.placeholder.com/150',
            president,
            advisor,
            instagram: instagramLink || null
          });
        } catch (parseError) {
          console.warn(`Kulüp #${index + 1} parse edilirken hata oluştu:`, parseError);
        }
      });

      if (clubsData.length === 0) {
        throw new Error('Hiç kulüp verisi bulunamadı');
      }

      console.log('Clubs found:', clubsData.length);
      setClubs(clubsData);
      
      // Verileri önbelleğe al
      await AsyncStorage.setItem('clubs_data', JSON.stringify({
        timestamp: Date.now(),
        data: clubsData
      }));

    } catch (err) {
      console.error('Error fetching clubs:', err);
      let errorMessage = 'Kulüp verileri yüklenirken bir hata oluştu';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.';
      } else if (err.response) {
        errorMessage = 'Sunucu hatası: ' + (err.response.status === 404 ? 'Sayfa bulunamadı' : 'Sunucu yanıt vermiyor');
      } else if (err.request) {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      }

      setError(errorMessage);
      
      // Önbellekteki verileri kullan
      try {
        const cachedData = await AsyncStorage.getItem('clubs_data');
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (Date.now() - timestamp < 3600000) {
            console.log('Using cached data');
            setClubs(data);
            setError(errorMessage + ' (Önbellek verileri gösteriliyor)');
          }
        }
      } catch (cacheError) {
        console.warn('Önbellek verileri okunamadı:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClubPress = (club) => {
    setSelectedClub(club);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedClub(null);
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = clubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedClubs(filtered);
      setCurrentPage(1);
    } else {
      loadMoreClubs();
    }
  }, [searchQuery]);

  const renderFooter = () => {
    if (!loadingMore || searchQuery) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4ECDC4" />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClubPress(item)}>
      <BlurView intensity={80} tint="dark" style={styles.card}>
        {item.image.includes('defaultLogo.jpg') ? (
          <View style={[styles.image, styles.letterContainer]}>
            <Text style={styles.letterText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
        <Text style={styles.name}>{item.name}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (error && !displayedClubs.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        >
          <View style={styles.innerContainer}>
            <BlurView intensity={100} tint="dark" style={styles.searchContainer}>
              <Ionicons name="search" size={24} color="#4ECDC4" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Kulüp Ara..."
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => {
                  if (navigation) {
                    navigation.getParent()?.setOptions({
                      tabBarStyle: {
                        display: 'none'
                      }
                    });
                  }
                }}
                onBlur={() => {
                  if (navigation) {
                    navigation.getParent()?.setOptions({
                      tabBarStyle: {
                        display: 'flex',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        elevation: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        borderTopWidth: 0,
                        height: 60,
                        paddingBottom: 10
                      }
                    });
                  }
                }}
              />
            </BlurView>
            <FlatList
              data={displayedClubs}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
            <ClubDetailsModal visible={modalVisible} club={selectedClub} onClose={closeModal} />
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? screenHeight * 0.06 : screenHeight * 0.04,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.04,
    paddingTop: screenHeight * 0.02,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: screenWidth * 0.04,
    marginBottom: screenHeight * 0.02,
    overflow: 'hidden',
    height: screenHeight * 0.06,
    zIndex: 1,
  },
  searchIcon: {
    marginRight: screenWidth * 0.02,
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth * 0.04,
    color: '#fff',
    height: '100%',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: screenHeight * 0.12,
  },
  card: {
    marginVertical: screenHeight * 0.01,
    marginHorizontal: screenWidth * 0.02,
    padding: screenWidth * 0.04,
    borderRadius: 15,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: screenHeight * 0.15,
  },
  image: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: screenWidth * 0.125,
    marginBottom: screenHeight * 0.01,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  name: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: screenWidth * 0.02,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  letterContainer: {
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: screenWidth * 0.08,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  footerLoader: {
    marginVertical: 20,
    alignItems: 'center'
  }
});

export default Kulüp;