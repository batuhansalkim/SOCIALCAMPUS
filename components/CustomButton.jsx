import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {withTiming, useAnimatedStyle } from 'react-native-reanimated';

const CustomButton = ({ handlePress, buttonVal, isLastScreen }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(1.1, { duration: 300 }), // Buton animasyonu
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonText}>
          {isLastScreen ? 'Başla' : 'Sonraki'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    zIndex: 1,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
