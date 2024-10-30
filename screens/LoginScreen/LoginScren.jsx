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
    Dimensions
    } from 'react-native';
    import { Picker } from '@react-native-picker/picker';
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

    const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

    const validateDateFormat = (date) => {
  // DD/MM/YYYY formatını kontrol et
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(date)) return false;

  // Geçerli bir tarih olup olmadığını kontrol et
  const [day, month, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDate() === day &&
         dateObj.getMonth() === month - 1 &&
         dateObj.getFullYear() === year &&
         year >= 1900 &&
         year <= new Date().getFullYear();
};

const formatDateInput = (input) => {
  // Sadece rakamları al
  const numbers = input.replace(/\D/g, '');
  
  // DD/MM/YYYY formatına dönüştür
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};
    export default function LoginScreen({onLogin}) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [faculty, setFaculty] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const isFormValid = termsAccepted && eulaAccepted && name && surname && email.includes('@') && city && birthDate;
const handleDateChange = (text) => {
    const formatted = formatDateInput(text);
    setBirthDate(formatted);
  };
    return (
        <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Hoşgeldiniz</Text>
                <Text style={styles.subtitle}>Bilgilerinizi doldurunuz.</Text>
            </View>
            
            <View style={styles.formContainer}>
                {/* Previous form fields remain the same, just styled differently */}
                <View style={styles.inputGroup}>
                <Text style={styles.label}>İsim</Text>
                <TextInput
                    style={styles.input}
                    placeholder="İsminizi giriniz"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                />
                </View>

                <View style={styles.inputGroup}>
                <Text style={styles.label}>Soyisim</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Soyisminizi giriniz"
                    value={surname}
                    onChangeText={setSurname}
                    placeholderTextColor="#999"
                />
                </View>

                <View style={styles.inputGroup}>
                <Text style={styles.label}>Fakülte</Text>
                <View style={styles.pickerContainer}>
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

                <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E-posta adresinizi giriniz"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                />
                </View>

                <View style={styles.inputGroup}>
    <Text style={styles.label}>Şehir</Text>
    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        selectedValue={city}
        onValueChange={setCity}
      >
        <Picker.Item label="Şehir Seçin" value="" />
        {cities.map((city, index) => (
          <Picker.Item key={index} label={city} value={city} />
        ))}
      </Picker>
    </View>
  </View>

                <View style={styles.inputGroup}>
    <Text style={styles.label}>Doğum Tarihi</Text>
    <TextInput
      style={[
        styles.input,
        !validateDateFormat(birthDate) && birthDate.length === 10 && styles.inputError
      ]}
      placeholder="GG/AA/YYYY"
      keyboardType="numeric"
      value={birthDate}
      onChangeText={handleDateChange}
      maxLength={10}
      placeholderTextColor="#999"
    />
    {!validateDateFormat(birthDate) && birthDate.length === 10 && (
      <Text style={styles.errorText}>Lütfen geçerli bir tarih giriniz</Text>
    )}
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
                            style={[styles.button, { backgroundColor: isFormValid ? "#4CAF50" : "#E0E0E0" }]}
                            disabled={!isFormValid}
                            onPress={onLogin}
                        >
                            <Text style={[styles.buttonText, { color: isFormValid ? "#FFFFFF" : "#999999" }]}>
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
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
    },
    inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    headerContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#2C3E50',
    },
    pickerContainer: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    picker: {
        height: 48,
    },
    termsContainer: {
        marginTop: 8,
        marginBottom: 24,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 4,
    },
    switchLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#2C3E50',
    },
    underlinedText: {
        textDecorationLine: 'underline',
        color: '#3498DB',
        fontSize: 14,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        
    },
    });
