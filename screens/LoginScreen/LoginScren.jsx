import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    Switch, 
    SafeAreaView,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Image,
    Modal,
    TouchableOpacity,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TermsScreen from "../../components/TermsScreen";
import { useFirebase } from '../../contexts/FirebaseContext';
import facultiesData from '../../data/faculties.json';
import CommonInput from '../../components/CommonInput';
import CommonButton from '../../components/CommonButton';
import CommonPicker from '../../components/CommonPicker';
import LoadingSpinner from '../../components/LoadingSpinner';
import { styles } from './LoginScreen.styles';

export default function LoginScreen({ onLogin }) {
    const { userService } = useFirebase();
    const [fullName, setFullName] = useState('');
    const [faculty, setFaculty] = useState('');
    const [department, setDepartment] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const isFormValid = termsAccepted && 
                       eulaAccepted && 
                       fullName && 
                       faculty && 
                       department;

    const handleLogin = async () => {
        if (!isFormValid || isSubmitted) {
            return;
        }

        setIsSubmitted(true);
        setLoading(true);

        try {
            const facultyName = facultiesData[faculty]?.name || '';

            // Firebase'e kaydetmeden önce anonim giriş yap ve uid al
            let userId = null;
            try {
                const { signInAnonymously } = await import('firebase/auth');
                const { AUTH } = await import('../../configs/FirebaseConfig');
                const cred = await signInAnonymously(AUTH);
                userId = cred.user?.uid || AUTH.currentUser?.uid;
                console.log('Anonymous user signed in with uid:', userId);
            } catch (firebaseAuthError) {
                console.log('Anonymous auth failed, proceeding with local storage only:', firebaseAuthError?.message);
            }

            // Kullanıcı verilerini AsyncStorage'a kaydet (uid varsa onu kullan)
            const userData = {
                id: userId || `local_${Date.now()}`,
                fullName,
                faculty,
                facultyName,
                department
            };

            console.log('Saving user data to AsyncStorage:', userData);
            
            // Önce mevcut verileri temizle
            await AsyncStorage.clear();
            
            // Yeni verileri kaydet
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('userLoggedIn', 'true');
            await AsyncStorage.setItem('savedUserId', userData.id);

            // Firebase'e kaydetmeyi dene (uid mevcutsa)
            try {
                if (userId) {
                    await userService.createUser(userId, {
                        fullName,
                        faculty,
                        facultyName,
                        department,
                        termsAccepted,
                        eulaAccepted
                    });
                    console.log('Firebase user created with ID:', userId);
                }
            } catch (firebaseError) {
                console.log('Firebase error (ignored):', firebaseError.message);
                // Firebase hatası varsa görmezden gel, AsyncStorage yeterli
            }
            await AsyncStorage.setItem('hasLaunched', 'true');

            // Kaydedilen verileri kontrol et
            const savedUserData = await AsyncStorage.getItem('userData');
            const savedLoginStatus = await AsyncStorage.getItem('userLoggedIn');
            console.log('Saved user data:', savedUserData);
            console.log('Saved login status:', savedLoginStatus);

            // Loading'i durdur
            setLoading(false);

            Alert.alert(
                '✅ Kayıt Başarılı',
                'Hoş geldiniz! SOCİALCAMPUS uygulamasına başarıyla kaydoldunuz.\n\nArtık kampüs hayatınızı kolaylaştıracak tüm özelliklere erişebilirsiniz.\n\nİyi kullanımlar dileriz! 🎓',
                [
                    {
                        text: 'Devam Et',
                        onPress: () => {
                            if (onLogin) onLogin();
                        },
                        style: 'default'
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            setIsSubmitted(false);
            setLoading(false);
            console.error('Kayıt sırasında bir hata oluştu:', error);
            Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Yükleniyor..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollViewContent} 
                        showsVerticalScrollIndicator={false} 
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.headerContainer}>
                            <View style={styles.logoTitleContainer}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={styles.logo}
                                />
                                <Text style={styles.title}>Hoşgeldiniz</Text>
                            </View>
                            <Text style={styles.subtitle}>Bilgilerinizi doldurunuz.</Text>
                        </View>
                        
                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                
                                <Text style={styles.label}>İsim ve Soyisim</Text>
                                <CommonInput
                                    icon="person-outline"
                                        placeholder="İsim ve soyisminizi giriniz"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    editable={!isSubmitted}
                                    iconColor="#666"
                                    borderColor="#E0E0E0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fakülte</Text>
                                <CommonPicker
                                    icon="school-outline"
                                    placeholder="Fakülte Seçin"
                                    selectedValue={faculty}
                                    onValueChange={(itemValue) => {
                                        if (!isSubmitted) {
                                            setFaculty(itemValue);
                                            setDepartment('');
                                        }
                                    }}
                                    items={[
                                        { label: 'Fakülte Seçin', value: '' },
                                        ...Object.entries(facultiesData).map(([key, value]) => ({
                                            label: value.name,
                                            value: key
                                        }))
                                    ]}
                                    enabled={!isSubmitted}
                                    editable={!isSubmitted}
                                    iconColor="#666"
                                    borderColor="#E0E0E0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bölüm</Text>
                                <CommonPicker
                                    icon="book-outline"
                                    placeholder="Bölüm Seçin"
                                    selectedValue={department}
                                    onValueChange={(itemValue) => !isSubmitted && setDepartment(itemValue)}
                                    items={[
                                        { label: 'Bölüm Seçin', value: '' },
                                        ...(facultiesData[faculty]?.departments.map((dept, index) => ({
                                            label: dept,
                                            value: dept
                                        })) || [])
                                    ]}
                                    enabled={!!faculty && !isSubmitted}
                                    editable={!isSubmitted}
                                    iconColor="#666"
                                    borderColor="#E0E0E0"
                                />
                            </View>

                            <View style={styles.termsContainer}>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={termsAccepted}
                                        onValueChange={setTermsAccepted}
                                        trackColor={{ false: "#E0E0E0", true: "#2E8B57" }}
                                        thumbColor={termsAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <TouchableOpacity onPress={() => setShowTerms(true)} style={styles.switchLabel}>
                                        <Text style={styles.termsText}>
                                            Şartlar ve Koşulları Kabul Ediyorum
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={eulaAccepted}
                                        onValueChange={setEulaAccepted}
                                        trackColor={{ false: "#E0E0E0", true: "#2E8B57" }}
                                        thumbColor={eulaAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <Text style={styles.switchLabel}>
                                        Son Kullanıcı Lisans Sözleşmesini (EULA) onaylıyorum.
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.buttonContainer}>
                                <CommonButton
                                    title={isSubmitted ? 'Gönderildi' : 'Gönder'}
                                    onPress={handleLogin}
                                    disabled={!isFormValid || isSubmitted}
                                    variant="success"
                                    size="large"
                                    gradient={false}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Modal visible={showTerms} animationType="slide">
                    <TermsScreen onClose={() => setShowTerms(false)} onAccept={() => {
                        setTermsAccepted(true);
                        setShowTerms(false);
                    }} />
                </Modal>


            </LinearGradient>
        </SafeAreaView>
    );
}

 