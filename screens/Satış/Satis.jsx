import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, TextInput, ScrollView, Animated, Easing, Linking, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../FirebaseConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IMGUR_CLIENT_ID = '0250b8b91223111'; // Imgur Client ID eklendi

export default function BookSellingPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', section: '', price: '', instagram: '', photoUri: '' });
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const areAllFieldsFilled = 
      newBook.name.trim() !== '' && 
      newBook.section.trim() !== '' && 
      newBook.price.trim() !== '' && 
      newBook.instagram.trim() !== '' && 
      newBook.photoUri !== '';
    setIsSaveButtonEnabled(areAllFieldsFilled);
  }, [newBook]);

  const fetchBooks = async () => {
    try {
      const q = query(collection(FIRESTORE_DB, 'books'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
      Alert.alert('Hata', 'Kitaplar yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const uploadToImgur = async (uri) => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('image', {
        uri: uri,
        name: filename,
        type
      });

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.data.link;
      } else {
        throw new Error('Imgur upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const saveBook = async () => {
    if (!isSaveButtonEnabled) return;

    try {
      setLoading(true);
      
      // Kullanıcı bilgilerini al
      const usersRef = collection(FIRESTORE_DB, 'users');
      const userSnapshot = await getDocs(usersRef);
      
      if (userSnapshot.empty) {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      // En son giriş yapan kullanıcıyı bul
      let latestUser = null;
      let latestTimestamp = new Date(0);

      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.createdAt && userData.createdAt.toDate) {
          const userTimestamp = userData.createdAt.toDate();
          if (userTimestamp > latestTimestamp) {
            latestTimestamp = userTimestamp;
            latestUser = { ...userData, id: doc.id };
          }
        }
      });

      if (!latestUser) {
        Alert.alert('Hata', 'Geçerli bir kullanıcı bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      // Resmi Imgur'a yükle
      if (!newBook.photoUri) {
        Alert.alert('Hata', 'Lütfen bir kitap resmi seçin.');
        return;
      }

      const imageUrl = await uploadToImgur(newBook.photoUri);

      // Kitap bilgilerini kontrol et
      if (!newBook.name || !newBook.section || !newBook.price || !newBook.instagram) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }

      // Kitap bilgilerini kaydet
      const timestamp = Timestamp.now();
      const bookData = {
        title: newBook.name.trim(),
        section: newBook.section.trim(),
        price: Number(newBook.price),
        instagram: newBook.instagram.trim(),
        imageUrl: imageUrl,
        sellerId: latestUser.id,
        sellerName: latestUser.fullName,
        sellerFaculty: latestUser.faculty,
        sellerDepartment: latestUser.department,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: "available"
      };

      await addDoc(collection(FIRESTORE_DB, 'books'), bookData);

      // Başarılı mesajı göster ve formu temizle
      Alert.alert('Başarılı', 'Kitap başarıyla eklendi!');
      setNewBook({ name: '', section: '', price: '', instagram: '', photoUri: '' });
      closeModal();
      await fetchBooks();

    } catch (error) {
      console.error('Kitap kaydedilirken hata:', error);
      Alert.alert('Hata', 'Kitap kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookCardWrapper}>
      <BlurView intensity={80} tint="dark" style={styles.bookCard}>
        <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
          <Image source={{ uri: item.imageUrl }} style={styles.bookImage} />
        </TouchableOpacity>
        <Text numberOfLines={2} ellipsizeMode='tail' style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookSection}>{item.section}</Text>
        <Text style={styles.bookPrice}>{item.price} TL</Text>
        <Text style={styles.sellerInfo}>Satıcı: {item.sellerName}</Text>
        <Text style={styles.sellerInfo}>Bölüm: {item.sellerDepartment}</Text>
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
      book => book.title.toLowerCase().includes(lowercasedQuery) || 
              book.section.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBooks(filtered);
  }, [books]);

  const handleInputChange = (name, value) => {
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setNewBook(prev => ({ ...prev, photoUri: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Resim seçilirken hata:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

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

              <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                    { opacity: isSaveButtonEnabled ? 1 : 0.5 }
                  ]}
                  onPress={saveBook}
                  disabled={!isSaveButtonEnabled}
                >
                  <Text style={styles.saveButtonText}>Kaydet</Text>
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
    paddingBottom: 80, // Add Button için alan bırak
  },
  bookCardWrapper: {
    flex: 1,
    maxWidth: '50%',
    padding: 8,
    height: SCREEN_WIDTH * 0.8,
  },
  bookCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookImage: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookSection: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  sellerInfo: {
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 2,
  },
  instagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393939',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  instagramText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#A9A9A9',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4ECDC4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#393939',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    height: 150,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  pickedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393939',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonModal: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  enlargedImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '90%',
    height: '70%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  emptyListText: {
    color: '#A9A9A9',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4ECDC4',
    fontSize: 16,
  }
});
