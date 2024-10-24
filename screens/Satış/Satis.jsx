import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, TextInput, ScrollView, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function BookSellingPage() {
  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', section: '', price: '', instagram: '', photoUri: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    setBooks(prev => [...prev, newBook]);
    setNewBook({ name: '', section: '', price: '', instagram: '', photoUri: '' });
    closeModal();
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.photoUri || 'https://via.placeholder.com/150' }} style={styles.bookImage} />
      <Text style={styles.bookTitle}>{item.name}</Text>
      <Text style={styles.bookSection}>{item.section}</Text>
      <Text style={styles.bookPrice}>{item.price} TL</Text>
      <View style={styles.instagramContainer}>
        <Ionicons name="logo-instagram" size={16} color="#E4405F" />
        <Text style={styles.instagramText}>{item.instagram}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Book Selling App</Text>
      
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.bookList}
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
        <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Book</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {newBook.photoUri ? (
                <Image source={{ uri: newBook.photoUri }} style={styles.pickedImage} />
              ) : (
                <Ionicons name="camera" size={40} color="#666" />
              )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Ionicons name="book" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Book Name"
                placeholderTextColor="#999"
                value={newBook.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="list" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Section"
                placeholderTextColor="#999"
                value={newBook.section}
                onChangeText={(text) => handleInputChange('section', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="pricetag" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Price"
                placeholderTextColor="#999"
                value={newBook.price}
                onChangeText={(text) => handleInputChange('price', text)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="logo-instagram" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Instagram"
                placeholderTextColor="#999"
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
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  bookList: {
    paddingHorizontal: 10,
  },
  bookCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    flex: 1,
    maxWidth: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  bookSection: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 5,
  },
  instagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instagramText: {
    fontSize: 12,
    marginLeft: 5,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});