import AsyncStorage from '@react-native-async-storage/async-storage';

const handleRegister = async () => {
  if (!isFormValid()) {
    Alert.alert('Uyarı', 'Lütfen tüm alanları doldurunuz.');
    return;
  }

  try {
    setLoading(true);

    // Kullanıcıyı Firestore'a ekle
    const docRef = await addDoc(collection(FIRESTORE_DB, 'users'), {
      fullName: formData.fullName,
      faculty: formData.faculty,
      facultyName: getFacultyName(formData.faculty),
      department: formData.department,
      eulaAccepted: true,
      termsAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('User created in Firestore with ID:', docRef.id);

    // Kullanıcı bilgilerini hazırla
    const userData = {
      id: docRef.id,
      fullName: formData.fullName,
      faculty: formData.faculty,
      facultyName: getFacultyName(formData.faculty),
      department: formData.department
    };

    // AsyncStorage'a kullanıcı bilgilerini kaydet
    await AsyncStorage.setItem('userId', docRef.id);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));

    // Doğrulama için verileri tekrar oku
    const savedUserId = await AsyncStorage.getItem('userId');
    const savedUserData = await AsyncStorage.getItem('userData');
    
    console.log('Verification - Saved userId:', savedUserId);
    console.log('Verification - Saved userData:', savedUserData);

    if (!savedUserId || !savedUserData) {
      throw new Error('User data was not saved properly to AsyncStorage');
    }

    setLoading(false);
    navigation.replace('TabNavigator');
  } catch (error) {
    console.error('Kayıt sırasında bir hata oluştu:', error);
    Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    setLoading(false);
  }
};

// Fakülte adını getiren yardımcı fonksiyon
const getFacultyName = (faculty) => {
  const facultyNames = {
    'muhendislik': 'Mühendislik Fakültesi',
    'teknoloji': 'Teknoloji Fakültesi',
    'mimarlik': 'Mimarlık Fakültesi'
    // Diğer fakülteler buraya eklenebilir
  };
  return facultyNames[faculty] || faculty;
}; 