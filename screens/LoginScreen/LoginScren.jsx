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

export default function LoginScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Hoşgeldiniz</Text>
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>Bilgilerinizi doldurunuz.</Text>

            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={styles.input}
              placeholder="İsminizi giriniz"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Soyisim</Text>
            <TextInput
              style={styles.input}
              placeholder="Soyisminizi giriniz"
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.label}>Fakülte</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={faculty}
                onValueChange={(itemValue) => setFaculty(itemValue)}
              >
                <Picker.Item label="Fakülte Seçin" value="" />
                <Picker.Item label="Mühendislik" value="engineering" />
                <Picker.Item label="Tıp" value="medicine" />
                <Picker.Item label="Edebiyat" value="literature" />
              </Picker>
            </View>

            <Text style={styles.label}>Bölüm</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={department}
                onValueChange={(itemValue) => setDepartment(itemValue)}
              >
                <Picker.Item label="Bölüm Seçin" value="" />
                <Picker.Item label="Bilgisayar Mühendisliği" value="computer_science" />
                <Picker.Item label="Hemşirelik" value="nursing" />
              </Picker>
            </View>

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta adresinizi giriniz"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Şehir</Text>
            <TextInput
              style={styles.input}
              placeholder="Şehrinizi giriniz"
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>Doğum Tarihi</Text>
            <TextInput
              style={styles.input}
              placeholder="GG/AA/YYYY"
              keyboardType="numeric"
              value={birthDate}
              onChangeText={setBirthDate}
            />

            <View style={styles.switchContainer}>
              <Switch
                value={termsAccepted}
                onValueChange={(value) => setTermsAccepted(value)}
                trackColor={{ false: "#767577", true: "#00FFFF" }}
                thumbColor={termsAccepted ? "#f4f3f4" : "#f4f3f4"}
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
                trackColor={{ false: "#767577", true: "#00FFFF" }}
                thumbColor={eulaAccepted ? "#f4f3f4" : "#f4f3f4"}
              />
              <Text style={styles.switchLabel}>Son Kullanıcı Lisans Sözleşmesini (EULA) onaylıyorum.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, { opacity: isFormValid ? 1 : 0.5 }]} 
              disabled={!isFormValid}
            >
              <Text style={styles.buttonText}>Başla</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showTerms} animationType="slide" onRequestClose={() => setShowTerms(false)}>
        <TermsScreen 
          onAccept={() => { setTermsAccepted(true); setShowTerms(false); }} 
          onClose={() => setShowTerms(false)} 
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000033',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    color: '#00FFFF',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  subtitle: {
    fontSize: 24,
    color: '#000033',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  underlinedText: {
    textDecorationLine: 'underline',
    fontSize: 15,
    color: '#000033',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000033',
    flex: 1,
  },
  button: {
    backgroundColor: '#00FFFF',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});