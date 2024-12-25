import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, Linking, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FIRESTORE_DB } from '../../FirebaseConfig';
import AboutScreen from '../About/About';
import AppAdd from "../AppAdd/AppAdd";
import { collection, query, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

export default function Profil() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // Kullanıcı bilgilerini tutan state
    const [userInfo, setUserInfo] = useState({
        isimSoyisim: "Yükleniyor...",
        fakulte: "Yükleniyor...",
        bolum: "Yükleniyor..."
    });

    // Düzenleme için kullanılan state
    const [editedInfo, setEditedInfo] = useState({
        fullName: "",
        faculty: "",
        department: ""
    });

    // Kullanıcı ID'sini saklamak için state
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Firestore'dan en son eklenen kullanıcıyı al
            const usersRef = collection(FIRESTORE_DB, 'users');
            const q = query(usersRef);
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                // En son eklenen kullanıcıyı bul
                let latestUser = null;
                let latestTimestamp = new Date(0); // 1970-01-01

                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    const userTimestamp = userData.createdAt.toDate();
                    
                    if (userTimestamp > latestTimestamp) {
                        latestTimestamp = userTimestamp;
                        latestUser = { ...userData, id: doc.id };
                    }
                });

                if (latestUser) {
                    setUserId(latestUser.id);
                    setUserInfo({
                        isimSoyisim: latestUser.fullName || "Belirtilmemiş",
                        fakulte: latestUser.facultyName || latestUser.faculty || "Belirtilmemiş",
                        bolum: latestUser.department || "Belirtilmemiş"
                    });

                    setEditedInfo({
                        fullName: latestUser.fullName || "",
                        faculty: latestUser.faculty || "",
                        department: latestUser.department || ""
                    });
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Veriler alınırken hata oluştu:", error);
            Alert.alert("Hata", "Kullanıcı verileri alınamadı.");
            setLoading(false);
        }
    };

    const updateUserData = async () => {
        if (!userId) {
            Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
            return;
        }

        try {
            const userRef = doc(FIRESTORE_DB, 'users', userId);
            await updateDoc(userRef, {
                ...editedInfo,
                updatedAt: Timestamp.now()
            });

            setUserInfo({
                isimSoyisim: editedInfo.fullName,
                fakulte: editedInfo.faculty,
                bolum: editedInfo.department
            });

            setModalVisible(false);
            Alert.alert("Başarılı", "Bilgileriniz güncellendi.");
        } catch (error) {
            console.error("Veri güncellenirken hata oluştu:", error);
            Alert.alert("Hata", "Bilgiler güncellenemedi.");
        }
    };

    const updateEditedInfo = (key, value) => {
        setEditedInfo(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePress = () => {
        Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/');
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.profileImage}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.infoContainer}>
                        <InfoItem
                            key="isimSoyisim"
                            icon="person-outline"
                            title="İsim Soyisim"
                            value={userInfo.isimSoyisim}
                        />
                        <InfoItem
                            key="fakulte"
                            icon="school-outline"
                            title="Fakülte"
                            value={userInfo.fakulte}
                        />
                        <InfoItem
                            key="bolum"
                            icon="book-outline"
                            title="Bölüm"
                            value={userInfo.bolum}
                        />

                        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                            <Ionicons name="pencil" size={20} color="#4ECDC4" />
                            <Text style={styles.editButtonText}>Düzenle</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.longButton} onPress={() => setAddModalVisible(true)}>
                        <Text style={styles.longButtonText}>Uygulamaya Eklenecekler</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>

            {modalVisible && (
                <BlurView intensity={100} tint="dark" style={[styles.modalContent, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Profili Düzenle</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="İsim Soyisim"
                        value={editedInfo.fullName}
                        onChangeText={(text) => updateEditedInfo('fullName', text)}
                        placeholderTextColor="#aaa"
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Fakülte"
                        value={editedInfo.faculty}
                        onChangeText={(text) => updateEditedInfo('faculty', text)}
                        placeholderTextColor="#aaa"
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Bölüm"
                        value={editedInfo.department}
                        onChangeText={(text) => updateEditedInfo('department', text)}
                        placeholderTextColor="#aaa"
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={updateUserData}>
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    </TouchableOpacity>
                </BlurView>
            )}

            <AboutScreen modalVisible={aboutModalVisible} setModalVisible={setAboutModalVisible} />
            <AppAdd modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
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

const getTitleForKey = (key) => {
    const titles = {
        isimSoyisim: "İsim Soyisim",
        fakulte: "Fakülte",
        bolum: "Bölüm",
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
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
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
        borderRadius: 10,
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
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
        height: 60, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
    },
    linkText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.035,
        fontWeight: '600',
        marginLeft: 8,
    },
    longButton: {
        backgroundColor: '#4ECDC4',
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    longButtonText: {
        fontFamily: 'Poppins', // Modern ve okunabilir bir fon  t
        fontSize: screenWidth * 0.04, 
        fontWeight: '700', // Daha kalın bir yazı tipi
        color: 'black', // Bembeyaz renk
        textTransform: 'uppercase', // Harfleri büyük yaparak şık bir görünüm
        letterSpacing: 1, // Harfler arasında küçük bir boşluk
        textAlign: 'center', // Merkezi hizalama
        fontStyle: 'italic', // Eğik font stili
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
        paddingVertical: 8,  // Küçültülen yükseklik
        paddingHorizontal: 25,  // Yanlardan da biraz boşluk
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20, // Yukarıdan biraz boşluk
        alignSelf: 'center', // Ortalamak için
        width: '50%', // Butonu daha dar yapmak için genişlik
    },

    saveButtonText: {
        color: '#fff',
        fontSize: screenWidth * 0.04, // Küçültülmüş font boyutu
        fontWeight: '600',
        textAlign: 'center',
    },
    addModalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,1.5)', // Yumuşak bir arka plan rengi
    },
    modalContainer: {
        width: '90%',
        padding: 20,
        backgroundColor: '#1A1A1A', // Koyu arka plan
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4ECDC4', // Modalın kenarı şık bir renk ile sınırlandırıldı
    },
    modalTitle: {
        fontSize: screenWidth * 0.065,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: screenWidth * 0.04,
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginHorizontal:15,
    },
    featureList: {
        width: '100%',
        paddingVertical: 10,
        marginBottom: 20,
    },
    featureItem: {
        fontSize: screenWidth * 0.04,
        color: '#fff',
        marginBottom: 10,
        lineHeight: 22,
        textAlign: 'left',
        paddingLeft: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 40,  // X işaretini biraz aşağıya aldık
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Hafif şeffaf arka plan
        borderRadius: 20, // Yuvarlak köşe
        padding: 10, // İç boşluk
        borderWidth: 2, // Çerçeve kalınlığı
        borderColor: '#4ECDC4', // Çerçeve rengi
    },

});