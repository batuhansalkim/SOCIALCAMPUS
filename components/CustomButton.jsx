import { StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import React from 'react';
import Animated, { interpolateColor, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const CustomButton = ({ handlePress, buttonVal }) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonVal.value,
      [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT],
      ['#fd94b2', '#f8dac2', '#154f40'],
    );

    return {
      backgroundColor: backgroundColor,
    };
  });

  const buttonAnimationStyle = useAnimatedStyle(() => {
    return {
      width: buttonVal.value === 2 * SCREEN_HEIGHT ? withSpring(150) : withSpring(80), // İleri butonunu biraz küçülttük
      height: buttonVal.value === 2 * SCREEN_HEIGHT ? withSpring(50) : withSpring(80),
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    return {
      width: 30,
      height: 30,
      opacity: buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(0) : withTiming(1),
      transform: [
        {
          translateX: buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(100) : withTiming(0),
        },
      ],
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateX: buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(0) : withTiming(-100),
        },
      ],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.container, animatedColor, buttonAnimationStyle]}>
        <Animated.Text style={[styles.textButton, textAnimationStyle]}>
          Get Started
        </Animated.Text>
        <Animated.Image
          source={require('../assets/images/ArrowIcon (1).png')}
          style={arrowAnimationStyle}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Noktalar ile buton arasındaki mesafeyi artırdık
    zIndex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: { color: 'white', fontSize: 18, position: 'absolute' },
});
