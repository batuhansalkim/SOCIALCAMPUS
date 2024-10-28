import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio-without-node-native';
import ClubDetailsModal from './ClubDetailsModal';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Kulüp = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

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
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
      style={styles.container}
    >
      <KeyboardAvoidingView style={styles.innerContainer} behavior="padding">
        <BlurView intensity={100} tint="dark" style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#4ECDC4" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kulüp Ara..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </BlurView>
        <FlatList
          data={filteredClubs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        <ClubDetailsModal visible={modalVisible} club={selectedClub} onClose={closeModal} />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 15,
    flex: 1,
    paddingTop: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: screenWidth * 0.04,
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: screenWidth * 0.15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  name: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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
  },
  errorText: {
    color: '#ff0000',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Kulüp;