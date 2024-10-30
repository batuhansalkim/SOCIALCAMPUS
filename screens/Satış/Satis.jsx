import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, TextInput, ScrollView, Animated, Easing, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const fakeBooks = [
  { id: '0', name: 'The Great Gatsby', section: 'Classic', price: '25', instagram: 'greatgatsby', photoUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEQrAC8BSjbxoiCNNzaR7YRGxDQHV6Gn_ndg&s' },
  { id: '1', name: 'To Kill a Mockingbird', section: 'Classic', price: '20', instagram: 'mockingbird', photoUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEQrAC8BSjbxoiCNNzaR7YRGxDQHV6Gn_ndg&s' },
  { id: '2', name: '1984', section: 'Dystopian', price: '22', instagram: '1984book', photoUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEQrAC8BSjbxoiCNNzaR7YRGxDQHV6Gn_ndg&s' },
  { id: '3', name: 'Pride and Prejudice', section: 'Romance', price: '18', instagram: 'prideandprejudice', photoUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEQrAC8BSjbxoiCNNzaR7YRGxDQHV6Gn_ndg&s' },
];

export default function BookSellingPage() {
  const [books, setBooks] = useState(fakeBooks);
  const [filteredBooks, setFilteredBooks] = useState(fakeBooks);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', section: '', price: '', instagram: '', photoUri: '' });
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    setFilteredBooks(books);
  }, [books]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewBook(prev => ({ ...prev, photoUri: result.assets[0].uri }));
    }
  };

  const handleInputChange = (name, value) => {
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const saveBook = () => {
    const newId = (books.length + 1).toString();
    const bookToAdd = { ...newBook, id: newId };
    setBooks(prev => {
      const updatedBooks = [...prev, bookToAdd];
      console.log('Updated books:', updatedBooks);
      return updatedBooks;
    });
    setNewBook({ name: '', section: '', price: '', instagram: '', photoUri: '' });
    closeModal();
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const handleImagePress = (uri) => {
    setEnlargedImage(uri);
  };

  const handleInstagramPress = (handle) => {
    Linking.openURL(`https://www.instagram.com/${handle}`);
  };

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    const lowercasedQuery = text.toLowerCase();
    const filtered = books.filter(
      book => book.name.toLowerCase().includes(lowercasedQuery) || 
              book.section.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBooks(filtered);
  }, [books]);

  const renderBookItem = ({ item, index }) => (
    <View style={styles.bookCardWrapper}>
      <BlurView intensity={80} tint="dark" style={styles.bookCard}>
        <TouchableOpacity onPress={() => handleImagePress(item.photoUri)}>
          <Image source={{ uri: item.photoUri }} style={styles.bookImage} />
        </TouchableOpacity>
        <Text style={styles.bookTitle}>{item.name}</Text>
        <Text style={styles.bookSection}>{item.section}</Text>
        <Text style={styles.bookPrice}>{item.price} TL</Text>
        <TouchableOpacity
          style={styles.instagramContainer}
          onPress={() => handleInstagramPress(item.instagram)}
        >
          <Ionicons name="logo-instagram" size={16} color="#4ECDC4" />
          <Text style={styles.instagramText}>@{item.instagram}</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#4ECDC4" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books or sections..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.bookList}
          inverted
        />

        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalHeader}>Add New Book</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {newBook.photoUri ? (
                    <Image source={{ uri: newBook.photoUri }} style={styles.pickedImage} />
                  ) : (
                    <Ionicons name="camera" size={40} color="#4ECDC4" />
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Ionicons name="book" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Book Name"
                    placeholderTextColor="#aaa"
                    value={newBook.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="list" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Section"
                    placeholderTextColor="#aaa"
                    value={newBook.section}
                    onChangeText={(text) => handleInputChange('section', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Price"
                    placeholderTextColor="#aaa"
                    value={newBook.price}
                    onChangeText={(text) => handleInputChange('price', text)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="logo-instagram" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Instagram"
                    placeholderTextColor="#aaa"
                    value={newBook.instagram}
                    onChangeText={(text) => handleInputChange('instagram', text)}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveBook}>
                  <Text style={styles.saveButtonText}>Save Book</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={!!enlargedImage}
          onRequestClose={() => setEnlargedImage(null)}
        >
          <View style={styles.enlargedImageContainer}>
            <Image source={{ uri: enlargedImage }} style={styles.enlargedImage} resizeMode="contain" />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEnlargedImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
    color: '#4ECDC4',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  bookList: {
    paddingBottom: 10,
    paddingTop: 80,
  },
  bookCardWrapper: {
    flex: 1,
    maxWidth: '50%',
    padding: 8,
    height: SCREEN_WIDTH * 0.8, // Fixed height for wrapper
  },
  bookCard: {
    flex: 1, // Take full height of wrapper
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'space-between', // Evenly space content
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookImage: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    borderRadius: SCREEN_WIDTH * 0.175,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    textAlign: 'center',
    paddingHorizontal: 4,
    height: 50, // Fixed height for title
    numberOfLines: 2, // Limit to 2 lines
    ellipsizeMode: 'tail', // Add ... if text is too long
  },
  bookSection: {
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    height: 20, // Fixed height for section
    numberOfLines: 1, // Limit to 1 line
    ellipsizeMode: 'tail',
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    height: 24, // Fixed height for price
  },
  instagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393939',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    height: 32, // Fixed height for Instagram container
  },
  instagramText: {
    fontSize: 13,
    marginLeft: 6,
    color: '#A9A9A9',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4ECDC4',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393939',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
    color: '#4ECDC4',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
  },
  enlargedImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
});
