import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AppAdd = ({ modalVisible, setModalVisible }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:batuhansalkimm@gmail.com?subject=SocialCampus Uygulama Önerisi');
  };

  const features = [
    {
      title: "KLU Gündemi",
      description: "Kampüs haberleri ve bildirimler. Yemekhanede değişiklik, hocaların grevi, final tarihi, otobüs saati değişikliği gibi gelişmelerin bildirimi.",
      icon: "newspaper-outline"
    },
    {
      title: "Söz Kırklareli'de",
      description: "Anket ve oylama platformu. 'En iyi hoca kim?', 'En kötü ders hangisi?' gibi anketler. Premium kullanıcılar yeni anket açabilir.",
      icon: "chatbox-outline"
    },
    {
      title: "Kampüs Yardım Ağı",
      description: "Eşya paylaşımı ve destek sistemi. 'Fotokopi kartı lazım', 'Fazla kalem var' gibi yardımlaşma platformu.",
      icon: "hand-left-outline"
    },
    {
      title: "K39AI Asistanı",
      description: "Kırklareli odaklı yapay zeka asistanı. Üniversite yapısı, otobüs saatleri, öğrenci mekanları hakkında her soruya cevap verir.",
      icon: "bulb-outline"
    },
    {
      title: "Eşleşme Sistemi",
      description: "İlgi alanına göre kişi eşleştirme ve sohbet başlatma. Aynı bölüm, kulüp filtreleri ile tanışma imkanı.",
      icon: "heart-outline"
    },
    {
      title: "Kahve Ismarlama",
      description: "Sanal hediye gönderme veya QR kodla fiziksel kafelerde kullanma. Arkadaşlarınıza kahve ısmarlayın!",
      icon: "cafe-outline"
    },
    {
      title: "Spor Takımı Oluşturma",
      description: "Takım kurma, yer-saat belirleme ve otomatik eşleşme sistemi. Basketbol, futbol, voleybol takımları kurun.",
      icon: "football-outline"
    },
    {
      title: "Bölüme Özel Forumlar",
      description: "Akademik tartışmalar ve yardım alanları. Bölümünüze özel sohbet odaları ve ders notu paylaşımı.",
      icon: "school-outline"
    },
    {
      title: "Mini Günlük Görevler",
      description: "Campus Challenge sistemi. '3 kahve ısmarla', 'bir kulübe katıl' gibi günlük görevler ve rozet kazanma.",
      icon: "trophy-outline"
    },
    {
      title: "Kampüs Kimliği",
      description: "Dijital öğrenci kartı. Profilde QR kodlu kimlik görünümü ve kampüs içi kullanım.",
      icon: "card-outline"
    },
    {
      title: "Kampüs Rehberi",
      description: "Kantinler, fotokopi yerleri, kütüphane rehberi. Öğrenci yorumları ve puanlamaları ile en iyi yerleri keşfedin.",
      icon: "map-outline"
    },
    {
      title: "Meme & Mizah Alanı",
      description: "Kampüs caps'leri ve komik içerikler. En beğenilenler haftalık öne çıkarılır.",
      icon: "happy-outline"
    },
    {
      title: "Anonim İtiraf Alanı",
      description: "Moderatörlü içerik ve upvote sistemi. Günün en çok beğenilen postu öne çıkarılır.",
      icon: "chatbubble-ellipses-outline"
    },
    {
      title: "Yakındakiler",
      description: "Konum tabanlı bildirimler. 'Yakında 4 kişi daha var' gibi sosyal temayı artıran özellik.",
      icon: "location-outline"
    },
    {
      title: "Rastgele Tanış",
      description: "Tanımadığın biriyle sohbet başlat. Aynı bölüm, kulüp filtreleri ile güvenli tanışma.",
      icon: "shuffle-outline"
    },
    {
      title: "Kampüs Sıralamaları",
      description: "En çok katkı yapanlar için profil rozetleri. Not paylaşan, kahve ısmarlayan, quiz şampiyonu kategorileri.",
      icon: "medal-outline"
    },
    {
      title: "Mini Anketler",
      description: "'Bugünkü yemek nasıldı?' gibi kısa anketler. Topluluk hissini artıran hızlı oylamalar.",
      icon: "checkmark-circle-outline"
    },
    {
      title: "Hoca Rehberi",
      description: "Öğrencilerden anonim yorum ve puanlar. Ders seçerken rehberlik eden değerlendirme sistemi.",
      icon: "person-outline"
    },
    {
      title: "Kampüs Pazarı",
      description: "2. el kitap, kırtasiye, eşya ilanları. Güvenli mesajlaşma ve kullanıcı puanı sistemi.",
      icon: "storefront-outline"
    },
    {
      title: "Mentorluk Sistemi",
      description: "Üst sınıf-alt sınıf eşleştirme. 1-2. sınıflar, bölümden 3-4. sınıflarla eşleşir ve rehberlik alır.",
      icon: "people-circle-outline"
    },
    {
      title: "Quiz Battle",
      description: "Bilgi yarışması odaları. Kategori seç, rastgele ya da arkadaşla yarış. Haftalık sıralama ve rozetler.",
      icon: "game-controller-outline"
    },
    {
      title: "Kırklareli Gezi Rehberi",
      description: "Kahvaltıcılar, piknik alanları, sahil köyleri, kafeler rehberi. Haftalık 'Gizli Yer Önerisi' ile keşfedilmemiş alanlar.",
      icon: "camera-outline"
    },
    {
      title: "Mezunlar Ağı",
      description: "Mezunlar, akademisyenler ve öğrenciler arasında köprü. Kariyer sohbetleri, mentorluk, iş ilanları.",
      icon: "business-outline"
    },
    {
      title: "İş İlanları",
      description: "Üniversite destekli, sponsorlu iş ve staj ilanları. Kampüs içi özel fırsatlar ve kampanyalar.",
      icon: "briefcase-outline"
    }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <BlurView intensity={100} tint="dark" style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Yakında Eklenecek Özellikler</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={32} color="#00BFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Uygulamamızı sürekli geliştiriyor ve yeni özellikler ekliyoruz.
          </Text>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={24} color="#00BFFF" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}


              <TouchableOpacity 
                style={styles.emailButton}
                onPress={handleEmailPress}
              >
                <Ionicons name="mail-outline" size={28} color="#00BFFF" style={styles.emailIcon} />
                <Text style={styles.emailButtonText}>Mail Gönder</Text>
              </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#00BFFF',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#fff',
    marginBottom: 20,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,191,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: 'bold',
    color: '#00BFFF',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#fff',
    opacity: 0.8,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
  noteText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#fff',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  closeModalButton: {
    backgroundColor: '#00BFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 40,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
});

export default AppAdd;
