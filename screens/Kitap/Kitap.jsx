import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache ve batch loading sabitleri
const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 saat
const BATCH_SIZE = 10;
const MAX_BOOKS = 30;

const fetchBooks = async () => {
  try {
    // Cache kontrolü
    const cachedBooks = await AsyncStorage.getItem('cached_books');
    const lastUpdate = await AsyncStorage.getItem('books_last_update');
    
    if (cachedBooks && lastUpdate) {
      const timeDiff = Date.now() - parseInt(lastUpdate);
      // 48 saat eski değilse cache'den kullan
      if (timeDiff < CACHE_DURATION) {
        setBooks(JSON.parse(cachedBooks));
        setLoading(false);
        return;
      }
    }

    // Firebase'den çek (batch loading)
    const booksRef = collection(FIRESTORE_DB, 'books');
    const booksData = [];
    let lastDoc = null;

    while (true) {
      let q = lastDoc 
        ? query(booksRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(booksRef, orderBy('createdAt', 'desc'), limit(BATCH_SIZE));

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) break;

      const batch = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      booksData.push(...batch);
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      // Maksimum 30 kitap yükle
      if (booksData.length >= MAX_BOOKS) break;
    }

    // Cache'e kaydet
    await AsyncStorage.setItem('cached_books', JSON.stringify(booksData));
    await AsyncStorage.setItem('books_last_update', Date.now().toString());

    setBooks(booksData);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching books:', error);
    setLoading(false);
  }
}; 