import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

function AddBookModal({ visible, onClose, onAdd }) {
  const [imageUri, setImageUri] = useState('');
  const [name, setName] = useState('');
  const [chapter, setChapter] = useState('');
  const [price, setPrice] = useState('');
  const [instagram, setInstagram] = useState('');

  const handleAdd = () => {
    if (name && price) {
      onAdd({
        imageUri: imageUri || 'https://via.placeholder.com/100x150',
        name,
        chapter,
        price,
        instagram,
      });
      setImageUri('');
      setName('');
      setChapter('');
      setPrice('');
      setInstagram('');
      onClose();
    }
  };

  const selectImage = () => {
  const options = {
    mediaType: 'photo',
  };
  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else {
      console.log('Image selected: ', response.uri);
    }
  });
};

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Book</Text>
          
          <TouchableOpacity style={styles.imagePicker} onPress={selectImage}>
            <Text>Select Book Image</Text>
          </TouchableOpacity>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Book Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Chapter Name (optional)"
            value={chapter}
            onChangeText={setChapter}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Instagram Handle (optional)"
            value={instagram}
            onChangeText={setInstagram}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.buttonText}>Add Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BookSalesPage() {
  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const addBook = (newBook) => {
    const bookWithId = { ...newBook, id: Date.now().toString() };
    setBooks([...books, bookWithId]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Book Sales Page</Text>

      <ScrollView contentContainerStyle={styles.bookList}>
        {books.map((book) => (
          <View style={styles.bookItem} key={book.id}>
            <Image source={{ uri: book.imageUri }} style={styles.bookImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.bookName}>{book.name}</Text>
              {book.chapter && <Text style={styles.bookChapter}>Chapter: {book.chapter}</Text>}
              <Text style={styles.bookPrice}>${book.price}</Text>
              {book.instagram && (
                <Text style={styles.bookInstagram}>Instagram: @{book.instagram}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addBookButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add New Book</Text>
      </TouchableOpacity>

      <AddBookModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addBook}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookList: {
    flexGrow: 1,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  bookImage: {
    width: 80,
    height: 120,
    marginRight: 10,
  },
  bookInfo: {
    justifyContent: 'center',
  },
  bookName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookChapter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  bookInstagram: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  imagePicker: {
    padding: 10,
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 150,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addBookButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BookSalesPage;
