import React, { useState } from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet, Linking, Image, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AboutScreenModal from "../../screens/About/About";


const screenWidth = Dimensions.get('window').width;

export default function Profil() {

  const navigation = useNavigation();
  const handlePress = () => {
    Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/');
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const [fakulte, setFakulte] = useState("Mühendislik Fakültesi");
  const [bolum, setBolum] = useState("Yazılım Mühendisliği");
  const [dogumTarihi, setDogumTarihi] = useState("29/05/2001");
  const [sehir, setSehir] = useState("Bilecik, Söğüt");
  const [mail, setMail] = useState("batuhansalkim11@gmail.com");

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Profile Page */}
        <Image source={{ uri: "https://media.licdn.com/dms/image/C4D03AQEohqwLUIK0yg/profile-displayphoto-shrink_200_200/0/1605612813012?e=2147483647&v=beta&t=cQAcoeC5vRisT5thqzJCBRPx1UdY7EvYhjyYZVt0iFk" }} style={styles.profileImage} />
        {/* User Info */}
        <Text style={styles.name}>Batuhan Salkım</Text>

        {/* Fakülte and Bölüm */}
        <View style={styles.infoRow}>

          <View style={[styles.infoItem, styles.leftItem]}>
            <Text style={styles.infoTitle}>🎓 Fakülte</Text>
            <Text style={styles.infoText}>{fakulte}</Text>
          </View>

          <View style={[styles.infoItem, styles.rightItem]}>
            <Text style={styles.infoTitle}>📚 Bölüm</Text>
            <Text style={styles.infoText}>{bolum}</Text>
          </View>

        </View>

        {/* Doğum Tarihi and Şehir */}
        <View style={styles.infoRow}>
          <View style={[styles.infoItem, styles.leftItem]}>
            <Text style={styles.infoTitle}>📅 Doğum Tarihi</Text>
            <Text style={styles.infoText}>{dogumTarihi}</Text>
          </View>
          <View style={[styles.infoItem, styles.rightItem]}>
            <Text style={styles.infoTitle}>📍 Şehir</Text>
            <Text style={styles.infoText}>{sehir}</Text>
          </View>
        </View>

        <View style={styles.infoItemFull}>
          <Text style={styles.infoTitlex}> 📧 Mail</Text>
          <Text style={styles.infoTextx}>{mail}</Text>
        </View>

        <View style={styles.editButtonContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.editButton}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bilgileri Düzenle</Text>

              <TextInput
                style={styles.input}
                placeholder="Fakülte"
                value={fakulte}
                onChangeText={setFakulte}
              />
              <TextInput
                style={styles.input}
                placeholder="Bölüm"
                value={bolum}
                onChangeText={setBolum}
              />
              <TextInput
                style={styles.input}
                placeholder="Doğum Tarihi"
                value={dogumTarihi}
                onChangeText={setDogumTarihi}
              />
              <TextInput
                style={styles.input}
                placeholder="Şehir"
                value={sehir}
                onChangeText={setSehir}
              />
              <TextInput
                style={styles.input}
                placeholder="Mail"
                value={mail}
                onChangeText={setMail}
              />

              <Button title="Kaydet" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Uygulama Hakkında ve İletişime Geç Kısmı */}
        <View style={styles.divider} />
        <View style={styles.aboutContainer}>
          <TouchableOpacity onPress={() => setAboutModalVisible(true)}>
  <Text style={styles.linkText}>Uygulama Hakkında</Text>
</TouchableOpacity>
<AboutScreenModal modalVisible={aboutModalVisible} setModalVisible={setAboutModalVisible} />


          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.linkText}>İletişime Geç</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9f9",
  },
  banner: {
    backgroundColor: '#007bff',
    paddingVertical: 20,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: screenWidth * 0.05, // Dinamik font boyutu
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  profileImage: {
    width: screenWidth * 0.45, // Dinamik genişlik
    height: screenWidth * 0.45, // Dinamik yükseklik
    borderRadius: 90, // Yüzde ile yuvarlaklık
  },
  name: {
    fontSize: screenWidth * 0.05, // Dinamik font boyutu
    fontWeight: "bold",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingTop: 30,
  },
  infoItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  infoItemFull: {
    backgroundColor: "#f0f8ff",
    margin: 15,
    padding: 10,
    borderRadius: 5,
    width: screenWidth * 0.8, // Dinamik genişlik
  },
  leftItem: {
    backgroundColor: '#f0f8ff',
  },
  rightItem: {
    backgroundColor: '#f5f5dc',
  },
  infoText: {
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  infoTextMail: {
    fontSize: screenWidth * 0.03, // Dinamik font boyutu
    textAlign: 'center',
    marginTop: 8,
  },
  infoTitle: {
    fontSize: screenWidth * 0.04, // Dinamik font boyutu
    textAlign: "center",
  },
  infoTitlex: {
    fontSize: screenWidth * 0.04,
    textAlign: "center",
    color: "black",
  },
  infoTextx: {
    color: 'black',
    textAlign: 'center',
    marginTop: 8,
  },
  editButtonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f5f5dc',
    color: 'black',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    width: '50%',
  },
  aboutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
    paddingBottom: 10,
  },
  linkText: {
    color: 'black',
    fontSize: screenWidth * 0.04,
  },
  linkTextx: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: screenWidth * 0.04,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 40,
  },
});

