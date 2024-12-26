import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Dimensions, 
    StyleSheet, 
    Linking, 
    Image, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { collection, query, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../FirebaseConfig';
import AboutScreen from '../About/About';
import AppAdd from "../AppAdd/AppAdd";
import facultiesData from '../../data/faculties.json';

const screenWidth = Dimensions.get('window').width;

export default function Profil() {
    const [modalVisible, setModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        isimSoyisim: "Yükleniyor...",
        fakulte: "Yükleniyor...",
        bolum: "Yükleniyor..."
    });

    const [editedInfo, setEditedInfo] = useState({
        fullName: "",
        faculty: "",
        department: ""
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const usersRef = collection(FIRESTORE_DB, 'users');
            const querySnapshot = await getDocs(query(usersRef));
            
            // En son eklenen kullanıcıyı bul
            let latestUser = null;
            let latestTimestamp = new Date(0);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) {
                    const timestamp = data.createdAt.toDate();
                    if (timestamp > latestTimestamp) {
                        latestTimestamp = timestamp;
                        latestUser = { ...data, id: doc.id };
                    }
                }
            });

            if (latestUser) {
                const facultyName = facultiesData[latestUser.faculty]?.name || latestUser.faculty;
                
                setUserInfo({
                    isimSoyisim: latestUser.fullName || "Belirtilmemiş",
                    fakulte: facultyName || "Belirtilmemiş",
                    bolum: latestUser.department || "Belirtilmemiş"
                });

                setEditedInfo({
                    fullName: latestUser.fullName || "",
                    faculty: latestUser.faculty || "",
                    department: latestUser.department || ""
                });
            }
        } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
            Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const updateUserData = async () => {
        try {
            const usersRef = collection(FIRESTORE_DB, 'users');
            const querySnapshot = await getDocs(query(usersRef));
            let userId = null;
            let latestTimestamp = new Date(0);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) {
                    const timestamp = data.createdAt.toDate();
                    if (timestamp > latestTimestamp) {
                        latestTimestamp = timestamp;
                        userId = doc.id;
                    }
                }
            });

            if (!userId) {
                Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
                return;
            }

            const userRef = doc(FIRESTORE_DB, 'users', userId);
            await updateDoc(userRef, {
                fullName: editedInfo.fullName,
                faculty: editedInfo.faculty,
                department: editedInfo.department,
                updatedAt: Timestamp.now()
            });

            const facultyName = facultiesData[editedInfo.faculty]?.name || editedInfo.faculty;

            setUserInfo({
                isimSoyisim: editedInfo.fullName,
                fakulte: facultyName,
                bolum: editedInfo.department
            });

            setModalVisible(false);
            Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
        } catch (error) {
            console.error('Veri güncellenirken hata oluştu:', error);
            Alert.alert('Hata', 'Bilgiler güncellenemedi.');
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

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4ECDC4" />
            </View>
        );
    }

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
                            icon="person-outline"
                            title="İsim Soyisim"
                            value={userInfo.isimSoyisim}
                        />
                        <InfoItem
                            icon="school-outline"
                            title="Fakülte"
                            value={userInfo.fakulte}
                        />
                        <InfoItem
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
    modalContent: {
        position: 'absolute',
        top: '20%',
        left: '5%',
        right: '5%',
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 20,
        marginTop: 10,
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
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
    },
    saveButtonText: {
        color: '#000',
        fontSize: screenWidth * 0.04,
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
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
        fontSize: screenWidth * 0.04,
        fontWeight: '700',
        color: 'black',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        padding: 20,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});