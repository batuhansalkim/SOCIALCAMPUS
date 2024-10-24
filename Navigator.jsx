import Kulüp from "../kluCampus/screens/Kulüp/Kulüp";
import Mesaj from "../kluCampus/screens/Mesaj/Mesaj";
import Profil from "../kluCampus/screens/Profil/Profil";
import Profil2 from "../kluCampus/screens/Profil/Profil2";
import Satis from "../kluCampus/screens/Satış/Satis";
import YemekListesi from "../kluCampus/screens/YemekListesi/YemekListesi";
import AboutScreen from "../kluCampus/screens/About/About";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from 'react';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

export default function Navigator() {
  return (
    <Tab.Navigator initialRouteName="Satis" screenOptions={{
        headerShown:false,
        tabBarShowLabel:false,
    }}>
        
        <Tab.Screen name="Satis" component={Satis} options={{tabBarIcon:({color,size})=>(<Icon name="sale" color={color} size={size}/>)}}/>
        <Tab.Screen name="Kulüp" component={Kulüp} options={{tabBarIcon:({color,size})=>(<Icon name="account-group" color={color} size={size}/>)}}/>
        <Tab.Screen name="YemekListesi" component={YemekListesi} options={{tabBarIcon:({size,color})=>(<Icon name="food-fork-drink" size={size} color={color}/>)}}/>
        <Tab.Screen name="Mesaj" component={Mesaj} options={{tabBarIcon:({size,color})=>(<Icon size={size} color={color} name="message"/>)}}/>
        <Tab.Screen name="Profil" component={Profil} options={{tabBarIcon:({size,color})=>(<Icon size={size} color={color} name="account"/>)}}/>
        
    </Tab.Navigator>
  )
}