import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Dimensions, 
    StyleSheet, 
    Linking, 
    Image, 
    ScrollView, 
    Alert,
    Platform,
    TouchableOpacity
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

const screenWidth = Dimensions.get('window').width;

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 saat

const AboutAppModal = ({ visible, onClose }) => (
  <CommonModal
    visible={visible}
    onClose={onClose}
    title="Uygulama Hakkında Genel Bilgiler"
    closeButtonText="Kapat"
    containerStyle={styles.aboutModalContent}
  >
    <LinearGradient
      colors={['rgba(78,205,196,0.15)', 'rgba(78,205,196,0.05)']}
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
      <Ionicons name="star" size={24} color="#4ECDC4" /> Temel Özellikler
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
);

const FeatureCard = ({ title, icon, description }) => (
  <LinearGradient
    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
    style={styles.featureCard}
  >
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#4ECDC4" />
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
    const [showChatbotModal, setShowChatbotModal] = useState(false);

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



    const renderChatbotModal = () => (
      <CommonModal
        visible={showChatbotModal}
        onClose={() => setShowChatbotModal(false)}
        title="AI Asistan"
        closeButtonText="Kapat"
        containerStyle={styles.chatbotModalContent}
      >
        <Text style={{color:"red",fontSize:18,fontWeight:"bold",fontFamily:"Arial",textAlign:"center",marginVertical:10}}>YAKINDA EKLENECEK...</Text>

        <LinearGradient
          colors={['rgba(78,205,196,0.15)', 'rgba(78,205,196,0.05)']}
          style={styles.chatbotWelcomeSection}
        >
          <Text style={{color:"white"}}>Yapay Zeka Destekli Asistanınız</Text>
          <Text style={{color:"white"}}>
            SOCİALCAMPUS AI Asistan, üniversite yaşamınızı kolaylaştırmak için tasarlanmış akıllı bir yardımcıdır. 
            Anlık sorularınıza hızlı ve doğru yanıtlar sunar, kampüs hayatınızı daha verimli hale getirir.
          </Text>
        </LinearGradient>

        <View style={styles.chatbotFeatureGrid}>
          <View style={styles.chatbotFeatureRow}>
            <View style={styles.chatbotFeatureCard}>
              <View style={styles.chatbotFeatureIconContainer}>
                <Ionicons name="flash" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.chatbotFeatureTitle}>Anlık Yanıtlar</Text>
              <Text style={styles.chatbotFeatureText}>
                Saniyeler içinde bilgiye erişin
              </Text>
            </View>

            <View style={styles.chatbotFeatureCard}>
              <View style={styles.chatbotFeatureIconContainer}>
                <Ionicons name="school" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.chatbotFeatureTitle}>Akademik Destek</Text>
              <Text style={styles.chatbotFeatureText}>
                Eğitim süreçlerinizde yanınızda
              </Text>
            </View>
          </View>

          <View style={styles.chatbotFeatureRow}>
            <View style={styles.chatbotFeatureCard}>
              <View style={styles.chatbotFeatureIconContainer}>
                <Ionicons name="time" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.chatbotFeatureTitle}>7/24 Hizmet</Text>
              <Text style={styles.chatbotFeatureText}>
                Her an erişilebilir asistan
              </Text>
            </View>

            <View style={styles.chatbotFeatureCard}>
              <View style={styles.chatbotFeatureIconContainer}>
                <Ionicons name="information" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.chatbotFeatureTitle}>Güncel Bilgi</Text>
              <Text style={styles.chatbotFeatureText}>
                Sürekli güncellenen veritabanı
              </Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(78,205,196,0.1)', 'rgba(78,205,196,0.05)']}
          style={styles.chatbotCapabilitiesSection}
        >
          <Text style={styles.chatbotSectionTitle}>Neler Yapabilir?</Text>
          <View style={styles.chatbotCapabilitiesList}>
            <View style={styles.chatbotCapabilityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.chatbotCapabilityText}>Akademik süreçler hakkında bilgilendirme</Text>
            </View>
            <View style={styles.chatbotCapabilityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.chatbotCapabilityText}>Kampüs yaşamı ve etkinlikler hakkında rehberlik</Text>
            </View>
            <View style={styles.chatbotCapabilityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.chatbotCapabilityText}>Öğrenci kulüpleri ve sosyal aktiviteler</Text>
            </View>
            <View style={styles.chatbotCapabilityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.chatbotCapabilityText}>Kırklareli şehir rehberi ve yaşam bilgileri</Text>
            </View>
          </View>
        </LinearGradient>
      </CommonModal>
    );



    if (loading) {
        return (
            <View style={styles.container}>
                <LoadingSpinner size="large" color="#4ECDC4" />
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

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/')}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#4ECDC4" />
                            <Text style={styles.actionButtonText}>İletişime Geç</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setAboutAppModalVisible(true)}
                        >
                            <Ionicons name="information-circle-outline" size={24} color="#4ECDC4" />
                            <Text style={styles.actionButtonText}>Uygulama Hakkında</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.longButton} onPress={() => setAddModalVisible(true)}>
                        <Text style={styles.longButtonText}>Uygulamaya Eklenecekler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.chatbotButton]} 
                        onPress={() => setShowChatbotModal(true)}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#2d2d2d']}
                            style={styles.chatbotButtonGradient}
                        >
                            <Ionicons name="logo-android" size={32} color="#4ECDC4" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>

            <CommonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Profili Düzenle"
                closeButtonText="Kapat"
                containerStyle={styles.modalContent}
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

            <AboutScreen modalVisible={aboutModalVisible} setModalVisible={setAboutModalVisible} />
            <AppAdd modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
            <AboutAppModal 
                visible={aboutAppModalVisible} 
                onClose={() => setAboutAppModalVisible(false)} 
            />
            {renderChatbotModal()}
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    safeContainer: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        paddingBottom: Platform.OS === 'ios' ? 85 : 60,
    },
    header: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : screenWidth * 0.08,
        paddingBottom: screenWidth * 0.05,
    },
    profileImage: {
        width: screenWidth * 0.25,
        height: screenWidth * 0.25,
        borderRadius: screenWidth * 0.125,
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: screenWidth * 0.05,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    infoContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 15,
        padding: screenWidth * 0.04,
        marginTop: screenWidth * 0.03,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenWidth * 0.03,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
    },
    infoIconContainer: {
        width: screenWidth * 0.11,
        height: screenWidth * 0.11,
        borderRadius: screenWidth * 0.055,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: screenWidth * 0.03,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: screenWidth * 0.035,
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: screenWidth * 0.01,
    },
    infoText: {
        fontSize: screenWidth * 0.042,
        color: '#fff',
        fontWeight: '500',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(78,205,196,0.15)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
        marginTop: screenWidth * 0.03,
    },
    editButtonText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.04,
        fontWeight: '600',
        marginLeft: screenWidth * 0.02,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: screenWidth * 0.04,
    },
    actionButton: {
        backgroundColor: 'rgba(78,205,196,0.15)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    actionButtonText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.035,
        fontWeight: '600',
        marginLeft: screenWidth * 0.02,
    },
    longButton: {
        backgroundColor: '#4ECDC4',
        borderRadius: 12,
        padding: screenWidth * 0.04,
        marginTop: screenWidth * 0.04,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    longButtonText: {
        fontSize: screenWidth * 0.04,
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    chatbotButton: {
        width: screenWidth * 0.15,
        height: screenWidth * 0.15,
        borderRadius: screenWidth * 0.075,
        alignSelf: 'center',
        marginTop: screenWidth * 0.04,
        marginBottom: Platform.OS === 'ios' ? 10 : screenWidth * 0.05,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    chatbotButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#4ECDC4',
        borderRadius: screenWidth * 0.075,
    },
    aboutModalContent: {
        flex: 1,
        padding: screenWidth * 0.05,
        paddingTop: Platform.OS === 'ios' ? screenWidth * 0.1 : screenWidth * 0.05,
    },
    welcomeSection: {
        borderRadius: 15,
        padding: screenWidth * 0.05,
        marginBottom: screenWidth * 0.05,
    },
    aboutModalSubtitle: {
        fontSize: screenWidth * 0.045,
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: screenWidth * 0.04,
        textAlign: 'center',
    },
    aboutModalText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        lineHeight: screenWidth * 0.05,
        marginBottom: screenWidth * 0.04,
    },
    developerSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    featuresTitle: {
        fontSize: screenWidth * 0.05,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 20,
        marginTop: 10,
        textAlign: 'center',
    },
    featuresContainer: {
        marginBottom: 20,
    },
    featureCard: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    featureIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(78,205,196,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: screenWidth * 0.04,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        opacity: 0.9,
        lineHeight: screenWidth * 0.05,
    },
    modalContent: {
        width: screenWidth * 0.9,
        borderRadius: 20,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    inputContainer: {
        marginBottom: 20,
    },
    modalInput: {
        marginBottom: 15,
    },
    modalSaveButton: {
        marginTop: 10,
    },
    chatbotButton: {
        width: screenWidth * 0.15,
        height: screenWidth * 0.15,
        borderRadius: screenWidth * 0.075,
        alignSelf: 'center',
        marginTop: screenWidth * 0.04,
        marginBottom: Platform.OS === 'ios' ? 10 : screenWidth * 0.05,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    chatbotButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#4ECDC4',
        borderRadius: 32.5,
    },
    chatbotModalContent: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },

    chatbotWelcomeSection: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    chatbotFeatureGrid: {
        marginBottom: 20,
    },
    chatbotFeatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    chatbotFeatureCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
    },
    chatbotFeatureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(78,205,196,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    chatbotFeatureTitle: {
        fontSize: screenWidth * 0.04,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
        textAlign: 'center',
    },
    chatbotFeatureText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    chatbotCapabilitiesSection: {
        borderRadius: 15,
        padding: 20,
    },
    chatbotSectionTitle: {
        fontSize: screenWidth * 0.045,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 15,
        textAlign: 'center',
    },
    chatbotCapabilitiesList: {
        marginTop: 10,
    },
    chatbotCapabilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    chatbotCapabilityText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        marginLeft: 10,
        opacity: 0.9,
    },

});