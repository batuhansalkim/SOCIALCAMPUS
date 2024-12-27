import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Switch, 
    Modal, 
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TermsScreen from "../../components/TermsScreen";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from "../../FirebaseConfig";
import facultiesData from '../../data/faculties.json';

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

            Alert.alert(
                'Başarılı', 
                'Bilgileriniz başarıyla kaydedildi!',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            if (onLogin) onLogin();
                        }
                    }
                ]
            );
        } catch (error) {
            setIsSubmitted(false);
            console.error('Kayıt sırasında bir hata oluştu:', error);
            Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4c669f" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
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
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isSubmitted && styles.disabledInput]}
                                        placeholder="İsim ve soyisminizi giriniz"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholderTextColor="#999"
                                        editable={!isSubmitted}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fakülte</Text>
                                <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.pickerContainerIOS]}>
                                    <Ionicons name="school-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <Picker
                                        style={[styles.picker, Platform.OS === 'ios' && styles.pickerIOS, isSubmitted && styles.disabledPicker]}
                                        selectedValue={faculty}
                                        onValueChange={(itemValue) => {
                                            if (!isSubmitted) {
                                                setFaculty(itemValue);
                                                setDepartment('');
                                            }
                                        }}
                                        enabled={!isSubmitted}
                                        itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : {}}
                                    >
                                        <Picker.Item label="Fakülte Seçin" value="" />
                                        {Object.entries(facultiesData).map(([key, value]) => (
                                            <Picker.Item key={key} label={value.name} value={key} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bölüm</Text>
                                <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.pickerContainerIOS]}>
                                    <Ionicons name="book-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <Picker
                                        style={[styles.picker, Platform.OS === 'ios' && styles.pickerIOS, isSubmitted && styles.disabledPicker]}
                                        selectedValue={department}
                                        onValueChange={(itemValue) => !isSubmitted && setDepartment(itemValue)}
                                        enabled={!!faculty && !isSubmitted}
                                        itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : {}}
                                    >
                                        <Picker.Item label="Bölüm Seçin" value="" />
                                        {facultiesData[faculty]?.departments.map((dept, index) => (
                                            <Picker.Item key={index} label={dept} value={dept} />
                                        ))}
                                    </Picker>
                                </View>
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
                            
                            <TouchableOpacity 
                                style={[
                                    styles.button, 
                                    { 
                                        opacity: isFormValid && !isSubmitted ? 1 : 0.5,
                                        backgroundColor: isSubmitted ? '#ccc' : '#4CAF50' 
                                    }
                                ]}
                                disabled={!isFormValid || isSubmitted}
                                onPress={handleLogin}
                            >
                                <Text style={styles.buttonText}>
                                    {isSubmitted ? 'Gönderildi' : 'Gönder'}
                                </Text>
                            </TouchableOpacity>
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#4c669f',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        minHeight: Platform.OS === 'ios' ? 50 : 47,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: Platform.OS === 'ios' ? 50 : 47,
        color: '#333',
        fontSize: 14,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#4c669f',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFF',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        paddingHorizontal: 8,
        minHeight: Platform.OS === 'ios' ? 50 : 47,
    },
    pickerContainerIOS: {
        paddingRight: 0,
    },
    picker: {
        flex: 1,
        height: Platform.OS === 'ios' ? 180 : 50,
        color: '#333',
        fontSize: 14,
    },
    pickerIOS: {
        marginRight: -8,
        marginLeft: -8,
    },
    pickerItemIOS: {
        fontSize: 14,
        height: 120,
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
    button: {
        marginTop: 15,
        paddingVertical: Platform.OS === 'ios' ? 14 : 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#4c669f',
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    disabledPicker: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
}); 