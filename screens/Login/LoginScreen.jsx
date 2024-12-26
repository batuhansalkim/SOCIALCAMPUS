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

    // Kullanıcı ID'sini AsyncStorage'a kaydet
    await AsyncStorage.setItem('userId', docRef.id);
    console.log('Saved userId to AsyncStorage:', docRef.id); // Debug için

    // Kullanıcı bilgilerini global state'e kaydet
    const userData = {
      id: docRef.id,
      fullName: formData.fullName,
      faculty: formData.faculty,
      department: formData.department
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log('Saved userData to AsyncStorage:', userData); // Debug için

    setLoading(false);
    navigation.replace('TabNavigator');
  } catch (error) {
    console.error('Kayıt sırasında bir hata oluştu:', error);
    Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
    setLoading(false);
  }
}; 