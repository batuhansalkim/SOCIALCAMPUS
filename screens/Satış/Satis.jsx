import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, TextInput, ScrollView, Animated, Easing, Linking, Dimensions, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, where, doc, deleteDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../FirebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IMGUR_CLIENT_ID = '0250b8b91223111'; // Imgur Client ID eklendi

export default function BookSellingPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', section: '', price: '', instagram: '', photoUri: '' });
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  useEffect(() => {
    fetchBooks();
    getCurrentUser();
  }, []);

  useEffect(() => {
    setFilteredBooks(books);
  }, [books]);

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
      setLoading(true);
      const booksRef = collection(FIRESTORE_DB, 'books');
      const querySnapshot = await getDocs(query(booksRef, orderBy('createdAt', 'desc')));
      
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
      Alert.alert(
        'Hata',
        'Kitaplar yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const usersRef = collection(FIRESTORE_DB, 'users');
      const querySnapshot = await getDocs(query(usersRef));
      let latestUser = null;
      let latestTimestamp = new Date(0);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt.toDate) {
          const timestamp = data.createdAt.toDate();
          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestUser = { ...data, id: doc.id };
          }
        }
      });

      if (latestUser) {
        setCurrentUserId(latestUser.id);
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınırken hata:', error);
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

  const handleDeleteBook = async (bookId) => {
    try {
      Alert.alert(
        'Kitabı Sil',
        'Bu kitabı silmek istediğinize emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            onPress: async () => {
              const bookRef = doc(FIRESTORE_DB, 'books', bookId);
              await deleteDoc(bookRef);
              Alert.alert('Başarılı', 'Kitap başarıyla silindi.');
              fetchBooks(); // Listeyi yenile
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('Kitap silinirken hata:', error);
      Alert.alert('Hata', 'Kitap silinirken bir hata oluştu.');
    }
  };

  const renderBookItem = ({ item }) => {
    const isOwnBook = item.sellerId === currentUserId;

    return (
      <View style={styles.bookCard}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.bookImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bookInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            {isOwnBook && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteBook(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.bookSection}>Bölüm: {item.section}</Text>
          <Text style={styles.bookPrice}>Fiyat: {item.price} TL</Text>
          <Text style={styles.sellerName}>Satıcı: {item.sellerName}</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL(`https://instagram.com/${item.instagram}`)}
          >
            <Ionicons name="logo-instagram" size={20} color="#4ECDC4" style={styles.instagramIcon} />
            <Text style={styles.contactButtonText}>@{item.instagram}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
    if (text.trim() === '') {
      setFilteredBooks(books);
    } else {
      const lowercasedQuery = text.toLowerCase();
      const filtered = books.filter(
        book => 
          book.title?.toLowerCase().includes(lowercasedQuery) || 
          book.section?.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredBooks(filtered);
    }
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks().then(() => setRefreshing(false));
  }, []);

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
          data={searchQuery.trim() === '' ? books : filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.bookList}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>
              {loading ? 'Yükleniyor...' : 'Hiçbir kitap bulunamadı.'}
            </Text>
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
          <TouchableOpacity 
            style={styles.enlargedImageContainer} 
            activeOpacity={1}
            onPress={() => setEnlargedImage(null)}
          >
            <Image 
              source={{ uri: enlargedImage }} 
              style={styles.enlargedImage} 
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEnlargedImage(null)}
            >
              <Ionicons name="close-circle" size={35} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.02,
    height: SCREEN_HEIGHT * 0.06,
  },
  searchIcon: {
    marginRight: SCREEN_WIDTH * 0.02,
    color: '#4ECDC4',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  bookList: {
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  bookCard: {
    flex: 1,
    margin: SCREEN_WIDTH * 0.02,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.4,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bookInfo: {
    padding: SCREEN_WIDTH * 0.04,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  bookTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    color: '#4ECDC4',
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  deleteButton: {
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
  },
  bookSection: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFFFFF',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  bookPrice: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  sellerName: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFFFFF',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.03,
  },
  instagramIcon: {
    marginRight: SCREEN_WIDTH * 0.02,
  },
  contactButtonText: {
    color: '#4ECDC4',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.05,
    bottom: SCREEN_HEIGHT * 0.03,
    backgroundColor: '#4ECDC4',
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    borderRadius: SCREEN_WIDTH * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    width: '90%',
    maxHeight: '85%',
  },
  modalContent: {
    padding: SCREEN_WIDTH * 0.05,
  },
  modalHeader: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.02,
    height: SCREEN_HEIGHT * 0.2,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  pickedImage: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: 10,
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    height: SCREEN_HEIGHT * 0.06,
  },
  inputIcon: {
    marginRight: SCREEN_WIDTH * 0.03,
    color: '#4ECDC4',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  saveButtonText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
  },
  closeButtonModal: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.015,
    right: SCREEN_WIDTH * 0.04,
    padding: SCREEN_WIDTH * 0.02,
    zIndex: 1,
  },
  enlargedImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.02,
  },
  enlargedImage: {
    width: '100%',
    height: '80%',
    borderRadius: 15,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.02,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: SCREEN_WIDTH * 0.04,
  },
  emptyListText: {
    color: '#A9A9A9',
    fontSize: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SCREEN_HEIGHT * 0.01,
    color: '#4ECDC4',
    fontSize: SCREEN_WIDTH * 0.04,
  },
});
