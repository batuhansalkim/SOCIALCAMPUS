import { StyleSheet, useWindowDimensions } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const Dot = ({ index, buttonVal }) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const widthAnimation = useRef(new Animated.Value(10)).current;
  const opacityAnimation = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const width = buttonVal.value >= index * SCREEN_HEIGHT && 
                  buttonVal.value < (index + 1) * SCREEN_HEIGHT ? 30 : 10;
    const opacity = buttonVal.value >= index * SCREEN_HEIGHT && 
                   buttonVal.value < (index + 1) * SCREEN_HEIGHT ? 1 : 0.5;

    Animated.parallel([
      Animated.timing(widthAnimation, {
        toValue: width,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: opacity,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [buttonVal.value]);

  const animatedDotStyle = {
    width: widthAnimation,
    opacity: opacityAnimation,
  };

  return (
    <Animated.View style={[styles.dots, animatedDotStyle]} />
  );
};

export default Dot;

const styles = StyleSheet.create({
  dots: {
    height: 8,
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#bfe8f2',
  },
});
