import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Kulüp from "../kluCampus/screens/Kulüp/Kulüp";
import Mesaj from "../kluCampus/screens/Mesaj/Mesaj";
import Profil from "../kluCampus/screens/Profil/Profil";
import Satis from "../kluCampus/screens/Satış/Satis";
import YemekListesi from "../kluCampus/screens/YemekListesi/YemekListesi";

const Tab = createBottomTabNavigator();

const CustomIcon = ({ name, color, size, isFocused }) => {
  const animatedStyles = useAnimatedStyle(() => {
    const scale = withTiming(isFocused ? 1.2 : 1, { duration: 200 });
    const backgroundColor = interpolateColor(
      scale,
      [1, 1.2],
      ['rgba(255, 255, 255, 0)', 'rgba(78, 205, 196, 0.1)']
    );

    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyles]}>
      <LinearGradient
        colors={isFocused ? ['#4ECDC4', '#4ECDC4'] : ['#8E8E93', '#A9A9A9']}
        style={styles.iconBackground}
      >
        <Icon name={name} color={isFocused ? '#FFFFFF' : '#F0F0F0'} size={size} />
      </LinearGradient>
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}
      style={styles.tabBar}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const animatedStyles = useAnimatedStyle(() => {
          return {
            transform: [
              {
                translateY: withTiming(isFocused ? -15 : 0, { duration: 200 }),
              },
            ],
          };
        });

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Animated.View style={[styles.tabItemContent, animatedStyles]}>
              <CustomIcon
                name={options.tabBarIcon({ focused: isFocused, color: '', size: 24 }).props.name}
                color={isFocused ? '#4ECDC4' : '#8E8E93'}
                size={24}
                isFocused={isFocused}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

export default function Navigator() {
  return (
    <Tab.Navigator
      initialRouteName="YemekListesi"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Satis" 
        component={Satis} 
        options={{
          tabBarIcon: ({color, size}) => <Icon name="sale" color={color} size={size}/>,
          tabBarLabel: null
        }}
      />
      <Tab.Screen 
        name="Kulüp" 
        component={Kulüp} 
        options={{
          tabBarIcon: ({color, size}) => <Icon name="account-group" color={color} size={size}/>,
          tabBarLabel: null
        }}
      />
      <Tab.Screen 
        name="YemekListesi" 
        component={YemekListesi} 
        options={{
          tabBarIcon: ({size, color}) => <Icon name="food-fork-drink" size={size} color={color}/>,
          tabBarLabel: null
        }}
      />
      <Tab.Screen 
        name="Mesaj" 
        component={Mesaj} 
        options={{
          tabBarIcon: ({size, color}) => <Icon size={size} color={color} name="message"/>,
          tabBarLabel: null
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={Profil} 
        options={{
          tabBarIcon: ({size, color}) => <Icon size={size} color={color} name="account"/>,
          tabBarLabel: null
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  iconBackground: {
    borderRadius: 12,
    padding: 6,
  },
});
