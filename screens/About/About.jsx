import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, } from 'react-native';
import aboutData from "../../aboutData.json";
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ modalVisible, setModalVisible }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Bilgileri yükle
    setData(aboutData);
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalView}>
        <View style={styles.header}>
          <Text style={styles.title}>{data?.title}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Ionicons name="close" style={styles.closeButtonX} size={25} color="red" /> 
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

          <Text style={styles.subtitle}>Kulüp Bilgileri</Text>
          <Text style={styles.text}>{data?.features.clubsInfo}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  openModalButton: {
    fontSize: 18,
    color: '#007bff',
    marginVertical: 20,
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Sol ve sağa yay
    alignItems:"center",

  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 70,
  },
  content: {
    marginTop: 20,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginTop: 8,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16, // Alt boşluğu artır
    marginTop: 16,    // Üst boşluk ekle
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 14,    // Üst boşluk ekle
    marginBottom: 6,   // Alt boşluğu artır
  },
  text: {
    fontSize: 14,
    marginTop: 10,    // Üst boşluk ekle
    marginBottom: 14,  // Alt boşluğu artır
  },
  closeButton: {
    padding: 10,
    marginLeft:50,
  },
  closeButtonX:{
    color:"white",
    backgroundColor:"black",
    borderRadius:20,
    fontSize:27
  }
});