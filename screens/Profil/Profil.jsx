import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Linking, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AboutScreenModal from "../../screens/About/About";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Profil() {
  const navigation = useNavigation();
  const handlePress = () => {
    Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/');
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fakulte: "Mühendislik Fakültesi",
    bolum: "Yazılım Mühendisliği",
    dogumTarihi: "29/05/2001",
    sehir: "Bilecik, Söğüt",
    mail: "batuhansalkim11@gmail.com"
  });

  const updateUserInfo = (key, value) => {
    setUserInfo(prevState => ({ ...prevState, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Image 
            source={{ uri: "https://media.licdn.com/dms/image/C4D03AQEohqwLUIK0yg/profile-displayphoto-shrink_200_200/0/1605612813012?e=2147483647&v=beta&t=cQAcoeC5vRisT5thqzJCBRPx1UdY7EvYhjyYZVt0iFk" }} 
            style={styles.profileImage} 
          />
          <Text style={styles.name}>Batuhan Salkım</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoContainer}>
            {Object.entries(userInfo).map(([key, value], index) => (
              <InfoItem key={key} icon={getIconForKey(key)} title={getTitleForKey(key)} value={value} />
            ))}
            <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil" size={20} color="#4ECDC4" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutContainer}>
            
            <TouchableOpacity style={styles.linkButton} onPress={() => setAboutModalVisible(true)}>
              <BlurView intensity={100} tint="dark" style={styles.blurView}>
                <Ionicons name="information-circle-outline" size={24} color="#4ECDC4" />
                <Text style={styles.linkText}>Uygulama Hakkında</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handlePress}>
              <BlurView intensity={100} tint="dark" style={styles.blurView}>
                <Ionicons name="mail-outline" size={24} color="#4ECDC4" />
                <Text style={styles.linkText}>İletişime Geç</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      <AboutScreenModal 
        modalVisible={modalVisible} 
        setModalVisible={setModalVisible}
        content={
          <BlurView intensity={100} tint="dark" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            {Object.entries(userInfo).map(([key, value]) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={getTitleForKey(key)}
                value={value}
                onChangeText={(text) => updateUserInfo(key, text)}
                placeholderTextColor="#aaa"
              />
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </BlurView>
        }
      />

      <AboutScreenModal modalVisible={aboutModalVisible} setModalVisible={setAboutModalVisible} />
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, title, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={24} color="#4ECDC4" />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  </View>
);

const getIconForKey = (key) => {
  const icons = {
    fakulte: "school-outline",
    bolum: "book-outline",
    dogumTarihi: "calendar-outline",
    sehir: "location-outline",
    mail: "mail-outline"
  };
  return icons[key] || "information-outline";
};

const getTitleForKey = (key) => {
  const titles = {
    fakulte: "Fakülte",
    bolum: "Bölüm",
    dogumTarihi: "Doğum Tarihi",
    sehir: "Şehir",
    mail: "E-posta"
  };
  return titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  profileImage: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: screenWidth * 0.15,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  name: {
    fontSize: screenWidth * 0.06,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  infoContainer: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(78,205,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 2,
  },
  infoText: {
    fontSize: screenWidth * 0.04,
    color: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
  },
  editButtonText: {
    color: '#4ECDC4',
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
    marginLeft: 10,
  },
  aboutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  linkButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  linkText: {
    color: '#4ECDC4',
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: screenWidth * 0.04,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
  },
});