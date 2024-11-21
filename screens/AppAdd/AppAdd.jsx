import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function FeaturesModal({ modalVisible, setModalVisible }) {
  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Uygulamaya Eklenecekler</Text>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text style={styles.text}>
              • Yemekleri değerlendirme, puan verme ve yorum yapabilme.
            </Text>
            <Text style={styles.text}>
              • Kulüplerin geçmiş etkinliklerini ve yeni yapılacak etkinliklerini
              görüntüleme.
            </Text>
            <Text style={styles.text}>
              • Kulüplerin üye sayıları görüntülenebilir.
            </Text>
            <Text style={styles.text}>
              • Sohbet kısmında, istediğiniz kişinin profil sayfasını
              görüntüleyebilirsiniz.
            </Text>
            <Text style={styles.text}>
              • Uygulamada, Kırklareli'de yaşamı kolaylaştıracak birçok bilgi,
              reklamlar, kampanyalar ve indirimlerin bulunduğu bir sayfa olacak.
            </Text>
            <Text style={styles.text}>
              • Profil kısmında; şehir, sosyal medya adresleri, e-posta, doğum
              tarihi ve kişisel fotoğraf eklenebilecek.
            </Text>
            <Text style={styles.text}>
              • Daha birçok özellik, ilerleyen günlerde eklenmeye devam edecektir.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Kapat</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Arka plan karartması
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth * 0.85,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(30, 30, 30, 0.95)", // Modal arka plan
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10, // Android gölge desteği
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    color: "#4ECDC4",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  content: {
    marginVertical: 10,
  },
  text: {
    fontSize: screenWidth * 0.035,
    color: "#FFFFFF",
    lineHeight: 22,
    marginBottom: 10,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: "#4ECDC4",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeModalButtonText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
