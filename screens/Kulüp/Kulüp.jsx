import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, KeyboardAvoidingView } from 'react-native';
import ClubDetailsModal from './ClubDetailsModal';

const clubs = require('../../Clubs.json');

const Kulüp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    <TouchableOpacity style={styles.card} onPress={() => handleClubPress(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" >
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kulüp Ara..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <FlatList
          data={filteredClubs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        <ClubDetailsModal visible={modalVisible} club={selectedClub} onClose={closeModal} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    paddingHorizontal: 15, // Kenar boşlukları
    flex: 1, // Alt içeriği kapsar
  },
  searchInput: {
    height: 45,
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginTop: 80,
    marginBottom:20, // Arama çubuğunu aşağı kaydır
    fontSize: 16,
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
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0', // Sınır rengi
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60, // Daire biçimi
    marginBottom: 5,
  },
  name: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Kulüp;
