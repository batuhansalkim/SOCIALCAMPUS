import { View, Text, Dimensions, ScrollView, StyleSheet,Image} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

const width = Dimensions.get("window");


export default function Profil() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text>Your Profile</Text>

        { /*Profile Page */ }
          <Image source={{uri:"https://via.placeholder.com/150"}} style={styles.profileImage}/>
          {/* User Info */}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer:{
  },
  container:{
  },
  title:{

  },

})