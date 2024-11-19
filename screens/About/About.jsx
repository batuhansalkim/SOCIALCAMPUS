import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import aboutData from "../../aboutData.json";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function AboutScreen({ modalVisible, setModalVisible }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(aboutData);
  }, []);

  return (
    <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{data?.title}</Text>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
          <Ionicons name="close" style={styles.closeButtonX} size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.textTitle}>{data?.welcome}</Text>
        <Text style={styles.text}>{data?.description}</Text>
        <Text style={styles.text}>{data?.developer}</Text>

        <Text style={styles.subtitle}>Özellikler</Text>
        <Text style={styles.subtitle}>Yemekhane Bilgileri</Text>
        <Text style={styles.text}>{data?.features.foodInfo}</Text>

        <Text style={styles.subtitle}>Kulüp Bilgileri</Text>
        <Text style={styles.text}>{data?.features.clubsInfo}</Text>

        <Text style={styles.subtitle}>Sosyalleşme</Text>
        <Text style={styles.text}>{data?.features.socialInfo}</Text>

        <Text style={styles.subtitle}>Satış</Text>
        <Text style={styles.text}>{data?.features.salesInfo}</Text>
      </ScrollView>
    </BlurView>
  </View>
</Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Koyu arka plan
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    margin: 20,
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Daha koyu bir modal
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonX: {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    fontSize: 27,
    padding: 5,
  },
  content: {
    flex: 1,
  },
  textTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 16,
    marginTop: 16,
  },
  subtitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginTop: 14,
    marginBottom: 6,
  },
  text: {
    fontSize: screenWidth * 0.035,
    color: '#fff',
    marginTop: 10,
    marginBottom: 14,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonX: {
    color: "#4ECDC4",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    fontSize: 27,
    padding: 5,
  }
});