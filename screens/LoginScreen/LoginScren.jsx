import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Switch, 
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Image,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TermsScreen from "../../components/TermsScreen";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from "../../configs/FirebaseConfig";
import facultiesData from '../../data/faculties.json';
import CommonInput from '../../components/CommonInput';
import CommonButton from '../../components/CommonButton';
import CommonPicker from '../../components/CommonPicker';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginScreen({ onLogin }) {
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

        try {
            const timestamp = Timestamp.now();
            const facultyName = facultiesData[faculty]?.name || '';

            // Firestore'da kullanıcı koleksiyonuna veri ekleme
            const docRef = await addDoc(collection(FIRESTORE_DB, 'users'), {
                fullName,
                faculty,
                facultyName,
                department,
                termsAccepted,
                eulaAccepted,
                createdAt: timestamp,
                updatedAt: timestamp
            });

            console.log('Firestore doc created with ID:', docRef.id);

            // Kullanıcı verilerini AsyncStorage'a kaydet
            const userData = {
                id: docRef.id,
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
            await AsyncStorage.setItem('hasLaunched', 'true');

            // Kaydedilen verileri kontrol et
            const savedUserData = await AsyncStorage.getItem('userData');
            const savedLoginStatus = await AsyncStorage.getItem('userLoggedIn');
            console.log('Saved user data:', savedUserData);
            console.log('Saved login status:', savedLoginStatus);

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
            console.error('Kayıt sırasında bir hata oluştu:', error);
            Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.title}>Hoşgeldiniz</Text>
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
                                />
                            </View>

                            <View style={styles.termsContainer}>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={termsAccepted}
                                        onValueChange={setTermsAccepted}
                                        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                                        thumbColor={termsAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <TouchableOpacity onPress={() => setShowTerms(true)} style={styles.switchLabel}>
                                        <Text style={styles.underlinedText}>
                                            Şartlar ve Koşulları Kabul Ediyorum
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={eulaAccepted}
                                        onValueChange={setEulaAccepted}
                                        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                                        thumbColor={eulaAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <Text style={styles.switchLabel}>
                                        Son Kullanıcı Lisans Sözleşmesini (EULA) onaylıyorum.
                                    </Text>
                                </View>
                            </View>
                            
                            <CommonButton
                                title={isSubmitted ? 'Gönderildi' : 'Gönder'}
                                onPress={handleLogin}
                                disabled={!isFormValid || isSubmitted}
                                variant="success"
                                style={{ marginTop: 15 }}
                            />
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#4c669f',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    },
    headerContainer: {
        marginBottom: 8,
        alignItems: 'center'
    },
    logo: {
        width: 150,
        height: 150,
        marginTop: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        marginTop:-30,
    },
    subtitle: {
        fontSize: 14,
        color: '#E0E0E0'
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginHorizontal: Platform.OS === 'ios' ? 10 : 0,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '500',
        color: '#333'
    },

    termsContainer: {
        marginVertical: 10
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    switchLabel: {
        marginLeft: 8,
        color: '#333',
        flex: 1,
        fontSize: 14
    },
    underlinedText: {
        textDecorationLine: 'underline',
        fontSize: 14
    },

}); 