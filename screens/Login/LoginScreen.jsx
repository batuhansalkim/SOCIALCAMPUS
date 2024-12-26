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
      department: formData.department,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Kullanıcı bilgilerini hazırla
    const userData = {
      id: docRef.id,
      fullName: formData.fullName,
      faculty: formData.faculty,
      department: formData.department
    };

    // AsyncStorage'a kullanıcı bilgilerini kaydet
    await AsyncStorage.setItem('userId', docRef.id);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));

    console.log('Saved user data:', {
      userId: docRef.id,
      userData: userData
    });

    setLoading(false);
    navigation.replace('TabNavigator');
  } catch (error) {
    console.error('Kayıt sırasında bir hata oluştu:', error);
    Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    setLoading(false);
  }
}; 