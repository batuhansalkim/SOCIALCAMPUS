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
const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
useEffect(() => {
  const areAllFieldsFilled = Object.values(newBook).every((value) => value.trim() !== '');
  setIsSaveButtonEnabled(areAllFieldsFilled);
}, [newBook]);

const saveBook = () => {
  if (!isSaveButtonEnabled) return; // Eğer buton aktif değilse işlem yapılmasın
  const newId = (books.length + 1).toString();
  const bookToAdd = { ...newBook, id: newId };
  setBooks((prev) => [bookToAdd, ...prev]);
  setNewBook({ name: '', section: '', price: '', instagram: '', photoUri: '' });
  closeModal();
};
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
    console.log('Selected Image URI:', result.assets[0].uri); // Bu eklenebilir
    setNewBook(prev => ({ ...prev, photoUri: result.assets[0].uri }));
  }
};

  const handleInputChange = (name, value) => {
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

//   const saveBook = () => {
//   const newId = (books.length + 1).toString();
//   const bookToAdd = { ...newBook, id: newId };
//   setBooks((prev) => [bookToAdd, ...prev]); // Yeni kitabı listenin başına ekliyoruz
//   setNewBook({ name: '', section: '', price: '', instagram: '', photoUri: '' });
//   closeModal();
// };

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
        <Text numberOfLines={2} ellipsizeMode='tail' style={styles.bookTitle}>{item.name}</Text>
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
            placeholder="Arama Yapabilirsin..."
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
  ListEmptyComponent={() => (
    <Text style={styles.emptyListText}>Hiçbir sonuç bulunamadı.</Text>
  )}
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
              <TouchableOpacity style={styles.closeButtonModal} onPress={closeModal}>
        <Ionicons name="close" size={30} color="#4ECDC4" />
      </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalContent}   showsVerticalScrollIndicator={false} // Kaydırma çubuğunu gizler
>
                <Text style={styles.modalHeader}>Yeni Kitap Ekle</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
  <View style={styles.imagePickerContent}>
    <Ionicons name="camera" size={40} color="#4ECDC4" />
    
  </View>
  {newBook.photoUri && (
    <Image source={{ uri: newBook.photoUri }} style={styles.pickedImage} />
  )}
</TouchableOpacity>


                <View style={styles.inputContainer}>
                  <Ionicons name="book" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Kitap Adı"
                    placeholderTextColor="#aaa"
                    value={newBook.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="list" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Bölüm"
                    placeholderTextColor="#aaa"
                    value={newBook.section}
                    onChangeText={(text) => handleInputChange('section', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag" size={20} color="#4ECDC4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fiyat"
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
                    placeholder="Instagram Adı"
                    placeholderTextColor="#aaa"
                    value={newBook.instagram}
                    onChangeText={(text) => handleInputChange('instagram', text)}
                  />
                </View>

                <TouchableOpacity
  style={[
    styles.saveButton,
    { opacity: isSaveButtonEnabled ? 1 : 0.5 }, // Buton opaklığını kontrol ediyoruz
  ]}
  onPress={saveBook}
  disabled={!isSaveButtonEnabled} // Buton aktif değilse tıklanamaz hale getiriyoruz
>
  <Text style={styles.saveButtonText}>Save Book</Text>
</TouchableOpacity>

                {/* <TouchableOpacity style={styles.closeButtonModal} onPress={closeModal}>
  <Ionicons name="close" size={30} color="#4ECDC4" />
</TouchableOpacity> */}

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
  emptyListText: {
  color: '#A9A9A9',
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
},
closeButtonModal: {
  position: 'absolute',
  top: 10,
  right: 10,
  padding: 5,
  zIndex: 1,
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
  imagePicker: {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#2C2C2E',
  borderRadius: 15,
  padding: 10,
  height: 150,
  marginBottom: 20,
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
  paddingTop: 10, // FlatList hizalamasını düzenlemek için azaltıldı
},
imagePickerContent: {
  alignItems: 'center',
},
imagePickerHint: {
  fontSize: 12,
  color: '#A9A9A9',
  marginTop: 8,
  textAlign: 'center',
},
pickedImage: {
  marginTop: 10,
  width: 100,
  height: 100,
  borderRadius: 8,
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
