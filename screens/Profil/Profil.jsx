import { View, Text, Dimensions, ScrollView, StyleSheet,Image} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

const width = Dimensions.get("window");


export default function Profil() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>KLU CAMPUS</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>

        {/* <Text style={styles.profile}>YOUR PROFİLE</Text> */}

        { /*Profile Page */ }
          <Image source={{uri:"https://via.placeholder.com/150"}} style={styles.profileImage}/>
          {/* User Info */}

          <Text style={styles.name}>Batuhan Salkım</Text>

          {/* Fakülte*/}
          <View style={styles.infoItem}>
            <Text>🎓 Fakülte</Text>
            <Text style={styles.infoText}>Mühendislik Fakültesi</Text>
          </View>
          {/* Bölüm */}
          <View style={styles.infoItem}>
            <Text>📚 Bölüm</Text>
            <Text style={styles.infoText}>Yazılım Mühendisliği</Text>
          </View>
          {/* Mail */}
          <View style={styles.infoItem}>
            <Text>📧 Mail</Text>
            <Text style={styles.infoText}>batuhansalkim11@gmail.com</Text>
          </View>
          {/* Şehir */}
          <View style={styles.infoItem}>
            <Text>📍 Şehir</Text>
            <Text style={styles.infoText}>Bilecik</Text>
          </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer:{
    flex:1,
    backgroundColor:"#f9f9f9f9"
  },
  banner: {
    backgroundColor: '#007bff', // Mavi renk
    paddingVertical: 20,
    alignItems: 'center',
  },
  
  bannerText: {
    color: '#fff', // Beyaz metin rengi
    fontSize: 20,
    fontWeight: 'bold',
  },
  container:{
    flexGrow:1,
    alignItems:"center",
    padding:20,
    paddingTop:30,
  },
  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20,
  },
  profileImage:{
    width: 180,
    height: 180,
    borderRadius: 100,
  }

})