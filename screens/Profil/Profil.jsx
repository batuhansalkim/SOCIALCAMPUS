import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Linking, 
    Image, 
    ScrollView, 
    Alert,
    TouchableOpacity,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { doc, updateDoc, Timestamp, getDoc, writeBatch } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../configs/FirebaseConfig';
import AboutScreen from '../About/About';
import AppAdd from "../AppAdd/AppAdd";
import facultiesData from '../../data/faculties.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonInput from '../../components/CommonInput';
import CommonButton from '../../components/CommonButton';
import CommonModal from '../../components/CommonModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { styles } from './Profil.styles';

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 saat

const FeatureCard = ({ title, icon, description }) => (
  <LinearGradient
    colors={['rgba(0,200,150,0.15)', 'rgba(0,200,150,0.08)']}
    style={styles.featureCard}
  >
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#00C896" />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </LinearGradient>
);

export default function Profil() {
    const [modalVisible, setModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
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

    const [aboutAppModalVisible, setAboutAppModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        darkMode: true,
        notifications: true,
        language: 'tr'
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Önce cache'den kontrol et
            const cachedData = await AsyncStorage.getItem('userProfileCache');
            const cacheTimestamp = await AsyncStorage.getItem('profile_cache_timestamp');
            
            if (cachedData && cacheTimestamp) {
                const parsedData = JSON.parse(cachedData);
                const cacheAge = Date.now() - parseInt(cacheTimestamp);
                
                // Cache 6 saatten yeni ise kullan
                if (cacheAge < CACHE_DURATION) {
                    const facultyName = facultiesData[parsedData.faculty]?.name || parsedData.faculty;
                    setUserInfo({
                        isimSoyisim: parsedData.fullName || "Belirtilmemiş",
                        fakulte: facultyName || "Belirtilmemiş",
                        bolum: parsedData.department || "Belirtilmemiş"
                    });
                    setEditedInfo({
                        fullName: parsedData.fullName || "",
                        faculty: parsedData.faculty || "",
                        department: parsedData.department || ""
                    });
                    setLoading(false);
                    return;
                }
            }

            // Cache yok veya eski ise sadece bir kez Firestore'dan al
            const userDataStr = await AsyncStorage.getItem('userData');
            if (!userDataStr) return;

            const userData = JSON.parse(userDataStr);
            const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userData.id));
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                const facultyName = facultiesData[data.faculty]?.name || data.faculty;
                
                // Cache'e kaydet
                await AsyncStorage.setItem('userProfileCache', JSON.stringify(data));
                await AsyncStorage.setItem('profile_cache_timestamp', Date.now().toString());
                
                setUserInfo({
                    isimSoyisim: data.fullName || "Belirtilmemiş",
                    fakulte: facultyName || "Belirtilmemiş",
                    bolum: data.department || "Belirtilmemiş"
                });
                setEditedInfo({
                    fullName: data.fullName || "",
                    faculty: data.faculty || "",
                    department: data.department || ""
                });
            }
        } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return editedInfo.fullName.trim() !== '' && 
               editedInfo.faculty.trim() !== '' && 
               editedInfo.department.trim() !== '';
    };

    const updateUserData = async () => {
        if (isSubmitting) return;
        
        if (!isFormValid()) {
            Alert.alert('Uyarı', 'Lütfen tüm alanları doldurunuz.');
            return;
        }

        setIsSubmitting(true);

        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (!userDataStr) {
                Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
                return;
            }

            const userData = JSON.parse(userDataStr);
            const batch = writeBatch(FIRESTORE_DB);
            const userRef = doc(FIRESTORE_DB, 'users', userData.id);

            // Ana kullanıcı dokümanını güncelle
            batch.update(userRef, {
                fullName: editedInfo.fullName.trim(),
                faculty: editedInfo.faculty.trim(),
                department: editedInfo.department.trim(),
                updatedAt: Timestamp.now()
            });

            // Tüm güncellemeleri tek seferde yap
            await batch.commit();

            // Cache'i güncelle
            const facultyName = facultiesData[editedInfo.faculty]?.name || editedInfo.faculty;
            const updatedUserData = {
                ...userData,
                fullName: editedInfo.fullName.trim(),
                faculty: editedInfo.faculty.trim(),
                facultyName: facultyName,
                department: editedInfo.department.trim()
            };

            await Promise.all([
                AsyncStorage.setItem('userData', JSON.stringify(updatedUserData)),
                AsyncStorage.setItem('userProfileCache', JSON.stringify(updatedUserData)),
                AsyncStorage.setItem('profile_cache_timestamp', Date.now().toString())
            ]);

            setUserInfo({
                isimSoyisim: editedInfo.fullName.trim(),
                fakulte: facultyName,
                bolum: editedInfo.department.trim()
            });

            setModalVisible(false);
            Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
        } catch (error) {
            console.error('Veri güncellenirken hata:', error);
            Alert.alert('Hata', 'Bilgiler güncellenemedi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateEditedInfo = (key, value) => {
        setEditedInfo(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const onSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" color="#005BAC" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.gradient}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >
                    {/* Header Section */}
                <View style={styles.header}>
                        <View style={styles.profileImageContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.profileImage}
                    />
                            <TouchableOpacity style={styles.editImageButton}>
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{userInfo.isimSoyisim}</Text>
                        <Text style={styles.userStatus}>Kırklareli Üniversitesi</Text>
                </View>

                    {/* Info Cards */}
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
                            <Ionicons name="pencil" size={20} color="#005BAC" />
                            <Text style={styles.editButtonText}>Profili Düzenle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/')}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#005BAC" />
                            <Text style={styles.actionButtonText}>İletişim</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setAboutAppModalVisible(true)}
                        >
                            <Ionicons name="information-circle-outline" size={24} color="#005BAC" />
                            <Text style={styles.actionButtonText}>Hakkında</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Settings Button */}
                    <TouchableOpacity style={styles.longButton} onPress={() => setSettingsModalVisible(true)}>
                        <Text style={styles.longButtonText}>Ayarlar</Text>
                    </TouchableOpacity>

                    {/* Roadmap Button */}
                    <TouchableOpacity style={styles.longButton} onPress={() => setAddModalVisible(true)}>
                        <Text style={styles.longButtonText}>Gelecek Özellikler</Text>
                    </TouchableOpacity>
                </ScrollView>
                            </View>

            {/* Edit Profile Modal */}
            <CommonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Profili Düzenle"
                closeButtonText="Kaydet"
                fullScreen={true}
            >
                            <View style={styles.inputContainer}>
                    <CommonInput
                        icon="person-outline"
                                        placeholder="İsim Soyisim"
                                        value={editedInfo.fullName}
                                        onChangeText={(text) => updateEditedInfo('fullName', text)}
                                        placeholderTextColor="#aaa"
                        style={styles.modalInput}
                    />

                    <CommonInput
                        icon="school-outline"
                                        placeholder="Fakülte"
                                        value={editedInfo.faculty}
                                        onChangeText={(text) => updateEditedInfo('faculty', text)}
                                        placeholderTextColor="#aaa"
                        style={styles.modalInput}
                    />

                    <CommonInput
                        icon="book-outline"
                                        placeholder="Bölüm"
                                        value={editedInfo.department}
                                        onChangeText={(text) => updateEditedInfo('department', text)}
                                        placeholderTextColor="#aaa"
                        style={styles.modalInput}
                                    />
                            </View>

                <CommonButton
                    title={isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                onPress={updateUserData}
                                disabled={!isFormValid() || isSubmitting}
                    loading={isSubmitting}
                    variant="primary"
                    style={styles.modalSaveButton}
                />
            </CommonModal>

            {/* Settings Modal */}
            <CommonModal
                visible={settingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
                title="Ayarlar"
                closeButtonText="Kapat"
                fullScreen={true}
            >
                <View style={styles.settingsContainer}>
                    <Text style={styles.settingsTitle}>Uygulama Ayarları</Text>
                    
                    <View style={styles.settingsItem}>
                        <View style={styles.row}>
                            <Ionicons name="moon-outline" size={24} color="#005BAC" />
                            <Text style={styles.settingsItemText}>Karanlık Tema</Text>
                        </View>
                        <Switch
                            value={settings.darkMode}
                            onValueChange={(value) => onSettingChange('darkMode', value)}
                            trackColor={{ false: "#E0E0E0", true: "#005BAC" }}
                            thumbColor={settings.darkMode ? "#FFFFFF" : "#F5F5F5"}
                        />
                    </View>

                    <View style={styles.settingsItem}>
                        <View style={styles.row}>
                            <Ionicons name="notifications-outline" size={24} color="#005BAC" />
                            <Text style={styles.settingsItemText}>Bildirimler</Text>
                        </View>
                        <Switch
                            value={settings.notifications}
                            onValueChange={(value) => onSettingChange('notifications', value)}
                            trackColor={{ false: "#E0E0E0", true: "#005BAC" }}
                            thumbColor={settings.notifications ? "#FFFFFF" : "#F5F5F5"}
                        />
                    </View>

                    <View style={styles.settingsItem}>
                        <View style={styles.row}>
                            <Ionicons name="language-outline" size={24} color="#005BAC" />
                            <Text style={styles.settingsItemText}>Türkçe</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#005BAC" />
                    </View>

                    <View style={styles.settingsItem}>
                        <View style={styles.row}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#005BAC" />
                            <Text style={styles.settingsItemText}>Gizlilik</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#005BAC" />
                    </View>
                </View>
            </CommonModal>

            {/* About App Modal */}
            <CommonModal
                visible={aboutAppModalVisible}
                onClose={() => setAboutAppModalVisible(false)}
                title="Uygulama Hakkında"
                closeButtonText="Kapat"
                fullScreen={true}
            >
                <LinearGradient
                    colors={['rgba(0,91,172,0.2)', 'rgba(0,91,172,0.1)']}
                    style={styles.welcomeSection}
                >
                    <Text style={styles.aboutModalSubtitle}>SocialCampus'e Hoş Geldiniz</Text>
                    
                    <Text style={styles.aboutModalText}>
                        SocialCampus, Kırklareli Üniversitesi öğrencilerinin kampüs deneyimini zenginleştirmek ve günlük yaşamlarını 
                        kolaylaştırmak amacıyla özel olarak tasarlanmış yenilikçi bir mobil platformdur. Modern arayüzü ve kullanıcı 
                        dostu özellikleriyle, öğrencilerin akademik ve sosyal hayatlarını daha verimli bir şekilde yönetmelerine 
                        olanak sağlar.
                    </Text>
                </LinearGradient>
                
                <View style={styles.developerSection}>
                    <Text style={styles.aboutModalText}>
                        Bu platform, Kırklareli Üniversitesi Yazılım Mühendisliği bölümü öğrencisi tarafından, öğrenci topluluğunun 
                        ihtiyaçları göz önünde bulundurularak geliştirilmiştir. Amacımız, teknoloji ile öğrenci deneyimini 
                        iyileştirerek, kampüs yaşamını daha etkileşimli ve erişilebilir hale getirmektir.
                    </Text>
                </View>

                <Text style={styles.featuresTitle}>
                    <Ionicons name="star" size={24} color="#005BAC" /> Temel Özellikler
                </Text>
                
                <View style={styles.featuresContainer}>
                    <FeatureCard
                        title="Yemekhane Bilgi Sistemi"
                        icon="restaurant-outline"
                        description="Günlük yemek menülerini anlık olarak görüntüleyebilir, haftalık menüleri inceleyebilir ve 
                        beslenme planlamanızı buna göre yapabilirsiniz."
                    />

                    <FeatureCard
                        title="Öğrenci Kulüpleri Portalı"
                        icon="people-outline"
                        description="Üniversitemizdeki tüm öğrenci kulüplerinin detaylı bilgilerine, 
                        yönetim kadrosuna ve iletişim bilgilerine tek bir platformdan erişebilirsiniz."
                    />

                    <FeatureCard
                        title="Öğrenci Alışveriş Platformu"
                        icon="cart-outline"
                        description="Kampüs içi alışveriş deneyimini kolaylaştıran bu platformda, diğer öğrencilerin paylaştığı 
                        ders kitapları, kırtasiye malzemeleri ve çeşitli ürünlere göz atabilirsiniz. İlgilendiğiniz ürünün 
                        satıcısıyla Instagram üzerinden doğrudan iletişime geçebilir, detayları görüşebilirsiniz. Ayrıca kendi 
                        ürünlerinizi de platforma ekleyerek diğer öğrencilerle güvenli bir şekilde alışveriş yapabilirsiniz."
                    />
                </View>
            </CommonModal>

            {/* Roadmap Modal */}
            <AppAdd modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
        </SafeAreaView>
    );
}

const InfoItem = ({ icon, title, value }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
            <Ionicons name={icon} size={24} color="#005BAC" />
        </View>
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoText}>{value}</Text>
        </View>
    </View>
);

