import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Linking, 
    Image, 
    ScrollView, 
    Alert,
    TouchableOpacity,
    Switch,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useFirebase } from '../../contexts/FirebaseContext';
import AboutScreen from '../About/About';
import AppAdd from "../AppAdd/AppAdd";
import facultiesData from '../../data/faculties.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonInput from '../../components/CommonInput';
import CommonButton from '../../components/CommonButton';
import CommonModal from '../../components/CommonModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BlurView } from 'expo-blur';
import { styles } from './Profil.styles';
import CommonPicker from '../../components/CommonPicker';

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 saat

const FeatureCard = ({ title, icon, description }) => (
  <BlurView intensity={80} tint="dark" style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#00BFFF" />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </BlurView>
);

export default function Profil() {
    const { user, userData, userService, loading: firebaseLoading } = useFirebase();
    const [modalVisible, setModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        isimSoyisim: "Belirtilmemiş",
        fakulte: "Belirtilmemiş",
        bolum: "Belirtilmemiş"
    });

    const [editedInfo, setEditedInfo] = useState({
        fullName: "",
        faculty: "",
        department: ""
    });

    const [aboutAppModalVisible, setAboutAppModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUserDataOnStart();
    }, []);

    const loadUserDataOnStart = async () => {
        try {
            console.log('Profil sayfası yüklendi, veri çekiliyor...');
            
            // Önce cache/local verilerden kontrol et
            const cachedData = await AsyncStorage.getItem('userProfileCache');
            const cacheTimestamp = await AsyncStorage.getItem('profile_cache_timestamp');
            const savedUserId = await AsyncStorage.getItem('savedUserId');
            const localUserData = await AsyncStorage.getItem('userData');
            
            if (cachedData && cacheTimestamp && (savedUserId || localUserData)) {
                const parsedData = JSON.parse(cachedData);
                const cacheAge = Date.now() - parseInt(cacheTimestamp);
                
                if (cacheAge < CACHE_DURATION) {
                    console.log('Cache geçerli, cache\'den yükleniyor:', parsedData);
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

            // Cache yoksa veya geçersizse: Önce local userData'ya düş, sonra Firebase'e dene
            if (localUserData) {
                const data = JSON.parse(localUserData);
                const facultyName = facultiesData[data.faculty]?.name || data.faculty;
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
                // Local veriyi cache olarak da sakla ki bir dahaki açılışta hızlı gelsin
                await AsyncStorage.setItem('userProfileCache', JSON.stringify(data));
                await AsyncStorage.setItem('profile_cache_timestamp', Date.now().toString());
                setLoading(false);
                // savedUserId mevcutsa arka planda Firebase'den tazele
            }

            if (savedUserId) {
                console.log('Firebase\'den veri çekiliyor, userId:', savedUserId);
                const data = await userService.getUser(savedUserId);
                
                if (data) {
                    console.log('Firebase\'den veri alındı:', data);
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
                } else {
                    console.log('Firebase\'den veri alınamadı, varsayılan değerler ayarlanıyor');
                    setUserInfo({
                        isimSoyisim: "Belirtilmemiş",
                        fakulte: "Belirtilmemiş",
                        bolum: "Belirtilmemiş"
                    });
                }
            } else {
                console.log('Saved userId yok, varsayılan değerler ayarlanıyor');
                setUserInfo({
                    isimSoyisim: "Belirtilmemiş",
                    fakulte: "Belirtilmemiş",
                    bolum: "Belirtilmemiş"
                });
            }
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            setUserInfo({
                isimSoyisim: "Belirtilmemiş",
                fakulte: "Belirtilmemiş",
                bolum: "Belirtilmemiş"
            });
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
            // savedUserId'yi al
            const savedUserId = await AsyncStorage.getItem('savedUserId');
            
            if (savedUserId) {
                await userService.updateUser(savedUserId, {
                    fullName: editedInfo.fullName.trim(),
                    faculty: editedInfo.faculty.trim(),
                    department: editedInfo.department.trim()
                });
            }

            const facultyName = facultiesData[editedInfo.faculty]?.name || editedInfo.faculty;
            const updatedUserData = {
                id: savedUserId,
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


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" color="#00BFFF" />
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
                            <Ionicons name="pencil" size={20} color="#00BFFF" />
                            <Text style={styles.editButtonText}>Profili Düzenle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => setContactModalVisible(true)}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#00BFFF" />
                            <Text style={styles.actionButtonText}>İletişim</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setAboutAppModalVisible(true)}
                        >
                            <Ionicons name="information-circle-outline" size={24} color="#00BFFF" />
                            <Text style={styles.actionButtonText}>Hakkında</Text>
                        </TouchableOpacity>
                    </View>


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
                bottomButtonOnPress={updateUserData}
                fullScreen={true}
            >
                <View style={[styles.inputContainer, styles.sectionCard]}>
                    <View style={styles.formGroup}>
                        <CommonInput
                            icon="person-outline"
                            placeholder="İsim Soyisim"
                            value={editedInfo.fullName}
                            onChangeText={(text) => updateEditedInfo('fullName', text)}
                            placeholderTextColor="#000000"
                            style={styles.modalInput}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <CommonPicker
                            icon="school-outline"
                            placeholder="Fakülte Seçin"
                            selectedValue={editedInfo.faculty}
                            onValueChange={(value) => {
                                updateEditedInfo('faculty', value);
                                updateEditedInfo('department', '');
                            }}
                            items={[
                                { label: 'Fakülte Seçin', value: '' },
                                ...Object.entries(facultiesData).map(([key, value]) => ({
                                    label: value.name,
                                    value: key
                                }))
                            ]}
                            style={styles.modalInput}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <CommonPicker
                            icon="book-outline"
                            placeholder="Bölüm Seçin"
                            selectedValue={editedInfo.department}
                            onValueChange={(value) => updateEditedInfo('department', value)}
                            items={[
                                { label: 'Bölüm Seçin', value: '' },
                                ...((facultiesData[editedInfo.faculty]?.departments || []).map((dept) => ({
                                    label: dept,
                                    value: dept
                                })))
                            ]}
                            enabled={!!editedInfo.faculty}
                            style={styles.modalInput}
                        />
                    </View>
                </View>

                {/* Footer info to fill space and add reassurance */}
                <View style={[styles.sectionCard, { marginTop: 10 }]}>
                    <View style={styles.footerInfoContainer}>
                        <Ionicons name="lock-closed-outline" size={18} color="#00BFFF" />
                        <Text style={styles.footerInfoText}>
                            Verileriniz güvende; düzenlemeler yalnızca hesabınızı kişiselleştirir.
                        </Text>
                    </View>
                </View>

                {/* Extra helper row */}
                <View style={[styles.sectionCard, { marginTop: 10, marginBottom: 10 }]}>
                    <View style={styles.footerInfoContainer}>
                        <Ionicons name="information-circle-outline" size={18} color="#00BFFF" />
                        <Text style={styles.footerInfoText}>
                            İpucu: Bölüm listesi, seçtiğiniz fakülteye göre otomatik güncellenir.
                        </Text>
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
                <BlurView intensity={80} tint="dark" style={styles.welcomeSection}>
                    <Text style={styles.aboutModalSubtitle}>SocialCampus'e Hoş Geldiniz</Text>
                    
                    <Text style={[styles.aboutModalText, { color: '#F0F0F0' }]}>
                        SocialCampus, Kırklareli Üniversitesi öğrencilerinin kampüs deneyimini zenginleştirmek ve günlük yaşamlarını 
                        kolaylaştırmak amacıyla özel olarak tasarlanmış yenilikçi bir mobil platformdur. Modern arayüzü ve kullanıcı 
                        dostu özellikleriyle, öğrencilerin akademik ve sosyal hayatlarını daha verimli bir şekilde yönetmelerine 
                        olanak sağlar.
                    </Text>
                </BlurView>
                
                <BlurView intensity={80} tint="dark" style={styles.developerSection}>
                    <Text style={[styles.aboutModalText, { color: '#F0F0F0' }]}>
                        Bu platform, Kırklareli Üniversitesi Yazılım Mühendisliği bölümü öğrencisi tarafından, öğrenci topluluğunun 
                        ihtiyaçları göz önünde bulundurularak geliştirilmiştir. Amacımız, teknoloji ile öğrenci deneyimini 
                        iyileştirerek, kampüs yaşamını daha etkileşimli ve erişilebilir hale getirmektir.
                    </Text>
                </BlurView>

                <Text style={styles.featuresTitle}>
                    <Ionicons name="star" size={24} color="#00BFFF" /> Temel Özellikler
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

            {/* Contact centered card modal */}
            <Modal
                visible={contactModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setContactModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setContactModalVisible(false)}>
                    <View style={styles.contactOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.contactCard}>
                        <TouchableOpacity
                            style={styles.contactCloseButton}
                            onPress={() => setContactModalVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.contactTitle}>İletişim</Text>

                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => {
                                Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/');
                                setContactModalVisible(false);
                            }}
                        >
                            <Ionicons name="logo-linkedin" size={22} color="#00BFFF" />
                            <View style={styles.contactTextWrap}>
                                <Text style={styles.contactName}>Batuhan Salkım</Text>
                                <Text style={styles.contactSubtitle}>LinkedIn profiline git</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => {
                                Linking.openURL('https://www.linkedin.com/in/ahmetcaliskann/');
                                setContactModalVisible(false);
                            }}
                        >
                            <Ionicons name="logo-linkedin" size={22} color="#00BFFF" />
                            <View style={styles.contactTextWrap}>
                                <Text style={styles.contactName}>Ahmet Çalışkan</Text>
                                <Text style={styles.contactSubtitle}>LinkedIn profiline git</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Roadmap Modal */}
            <AppAdd modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
        </SafeAreaView>
    );
}

const InfoItem = ({ icon, title, value }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
            <Ionicons name={icon} size={24} color="#00BFFF" />
        </View>
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoText}>{value}</Text>
        </View>
    </View>
);

