import React, { useState } from 'react';
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
    KeyboardAvoidingView,
    Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TermsScreen from "../../components/TermsScreen";
const faculties = {
    medicine: {
        name: "Tıp Fakültesi",
        departments: [
            "Tıp bölümü"
        ]
    },
    literature: {
        name: "Fen Edebiyat Fakültesi",
        departments: [
            "Batı Dilleri ve Edebiyatları Bölümü",
            "Çağdaş Lehçeleri ve Edebiyatları Bölümü",
            "Eğitim Bilimleri Bölümü",
            "Felsefe Bölümü",
            "Fizik Bölümü",
            "Kimya Bölümü",
            "Matematik Bölümü",
            "Moleküler Biyoloji ve Genetik Bölümü",
            "Mütercim Tercümanlık Bölümü",
            "Psikoloji Bölümü",
            "Sosyoloji Bölümü",
            "Tarih Bölümü",
            "Türk Dili ve Edebiyatı Bölümü"
        ]
    },
    economics: {
        name: "İktisadi ve İdari Bilimler Fakültesi",
        departments: [
            "Çalışma Ekonomisi ve Endüstri İlişkileri Bölümü",
            "Ekonometri Bölümü",
            "İktisat Bölümü",
            "İktisat (İngilizce) Programı",
            "İşletme Bölümü",
            "İnsan Kaynakları Bölümü",
            "Maliye Bölümü",
            "Siyaset Bilimi ve Kamu Yönetimi Bölümü",
            "Uluslararası İlişkiler Bölümü",
            "Yönetim Bilişim Sistemleri"
        ]
    },
    law: {
        name: "Hukuk Fakültesi",
        departments: [
            "Hukuk Bölümü"
        ]
    },
    engineering: {
        name: "Mühendislik Fakültesi",
        departments: [
            "Elektrik Elektronik Mühendisliği",
            "Endüstri Mühendisliği",
            "Gıda Mühendisliği",
            "İnşaat Mühendisliği",
            "Makine Mühendisliği",
            "Yazılım Mühendisliği"
        ]
    },
    technology: {
        name: "Teknoloji Fakültesi",
        departments: [
            "Enerji Sistemleri Mühendisliği",
            "Mekatronik Mühendisliği"
        ]
    },
    aviation: {
        name: "Lüleburgaz Havacılık ve Uzay Bilimleri Fakültesi",
        departments: [
            "Havacılık Yönetimi Bölümü",
            "Uçak Bakım ve Onarım Bölümü",
            "Pilotaj Bölümü",
            "Havacılık ve Uzay Mühendisliği Bölümü",
            "Havacılık Elektrik ve Elektroniği"
        ]
    },
    theology: {
        name: "İlahiyat Fakültesi",
        departments: [
            "İlahiyat Bölümü"
        ]
    },
    architecture: {
        name: "Mimarlık Fakültesi",
        departments: [
            "Mimarlık Bölümü",
            "Şehir ve Bölge Planlama Bölümü",
            "Peyzaj Mimarlığı Bölümü",
            "İç Mimarlık Bölümü"
        ]
    },
    tourism: {
        name: "Turizm Fakültesi",
        departments: [
            "Turizm İşletmeciliği",
            "Turizm Rehberliği",
            "Rekreasyon Yönetimi",
            "Gastronomi ve Mutfak Sanatları"
        ]
    },
    applied_sciences: {
        name: "Uygulamalı Bilimler Fakültesi",
        departments: [
            "Finans ve Bankacılık",
            "Muhasebe ve Finans Yönetimi",
            "Uluslararası Ticaret ve Lojistik"
        ]
    }
};

// ... (faculties object remains unchanged)

export default function LoginScreen({ onLogin }) {
    const [fullName, setFullName] = useState('');
    const [faculty, setFaculty] = useState('');
    const [department, setDepartment] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const isFormValid = termsAccepted && eulaAccepted && fullName && faculty && department;

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                                        style={styles.input}
                                        placeholder="İsim ve soyisminizi giriniz"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fakülte</Text>
                                <View style={styles.pickerContainer}>
                                    <Ionicons name="school-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={faculty}
                                        onValueChange={(itemValue) => {
                                            setFaculty(itemValue);
                                            setDepartment('');
                                        }}
                                    >
                                        <Picker.Item label="Fakülte Seçin" value="" />
                                        {Object.entries(faculties).map(([key, value]) => (
                                            <Picker.Item key={key} label={value.name} value={key} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bölüm</Text>
                                <View style={styles.pickerContainer}>
                                    <Ionicons name="book-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={department}
                                        onValueChange={(itemValue) => setDepartment(itemValue)}
                                        enabled={!!faculty}
                                    >
                                        <Picker.Item label="Bölüm Seçin" value="" />
                                        {(faculties[faculty]?.departments || []).map((dept, index) => (
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
                                style={[styles.button, { opacity: isFormValid ? 1 : 0.5 }]}
                                disabled={!isFormValid}
                                onPress={onLogin}
                            >
                                <Text style={styles.buttonText}>
                                    Gönder
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
        justifyContent: 'center'
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center'
    },
    logo: {
        width: 150, // Logo boyutunu artırdım
        height: 150, // Logo boyutunu artırdım
        marginTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#E0E0E0'
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#333'
    },
    inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#4c669f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    paddingVertical: 5 // Dikey hizalama için padding ekleyebilirsin
},
    inputIcon: {
    marginRight: 10, // Yalnızca sağa boşluk ver
},
    input: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16
    },
    pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#4c669f',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
},
    picker: {
        flex: 1,
        height: 50,
        color: '#333'
    },
    termsContainer: {
        marginVertical: 15
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    switchLabel: {
        marginLeft: 10,
        color: '#333',
        flex: 1
    },
    underlinedText: {
        textDecorationLine: 'underline'
    },
    button: {
        marginTop: 20,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF'
    }
});

