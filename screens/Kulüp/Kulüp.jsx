import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Dimensions, ActivityIndicator, Platform, StatusBar, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio-without-node-native';
import ClubDetailsModal from './ClubDetailsModal';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Kulüp = ({ navigation }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

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

  const fetchClubs = async () => {
    try {
      console.log('Fetching clubs...');
      const response = await axios.get('https://ogrkulup.klu.edu.tr/');
      console.log('Response received:', response.status);
      const $ = cheerio.load(response.data);
      const clubsData = [];

      $('.col-lg-4').each((index, element) => {
        const name = $(element).find('h3 a').text().trim();
        const image = $(element).find('img').attr('src');
        const details = $(element).find('.card-text').text().trim().split('\n');
        const president = details[0].replace('Kulüp Başkanı:', '').trim();
        const advisor = details[1].replace('Kulüp Danışmanı:', '').trim();
        const instagramLink = $(element).find('a.btn-instagram').attr('href');
        
        clubsData.push({ 
          name, 
          image: image.startsWith('http') ? image : `https://ogrkulup.klu.edu.tr${image}`,
          president, 
          advisor, 
          instagram: instagramLink 
        });
      });

      console.log('Clubs found:', clubsData.length);
      setClubs(clubsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Kulüp verileri yüklenirken bir hata oluştu: ' + err.message);
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

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClubPress(item)}>
      <BlurView intensity={80} tint="dark" style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
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

  if (error) {
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
  behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // iOS için boşluk, Android için sıfır
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
          onChangeText={(text) => setSearchQuery(text)}
          onFocus={() => {
            if (navigation) {
              navigation.getParent()?.setOptions({
                tabBarStyle: {
                  display: 'flex',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.8)', // Alt menüyü sabit bırak
                  borderTopWidth: 0,
                  height: 60,
                  paddingBottom: 10,
                },
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
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderTopWidth: 0,
                  height: 60,
                  paddingBottom: 10,
                },
              });
            }
          }}
        />
      </BlurView>
      <FlatList
        data={filteredClubs}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
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
});

export default Kulüp;