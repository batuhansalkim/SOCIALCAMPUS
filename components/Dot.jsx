import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {Extrapolation,interpolate,interpolateColor,useAnimatedStyle} from 'react-native-reanimated';

const Dot = ({ index, buttonVal }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const width = interpolate(buttonVal.value, [index * 100, (index + 1) * 100], [8, 16], Extrapolation.CLAMP);
    const opacity = interpolate(buttonVal.value, [index * 100, (index + 1) * 100], [0.5, 1], Extrapolation.CLAMP);
    
    return {
      width,
      opacity,
    };
  });

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(buttonVal.value, [0, 300], ['#007BFF', '#FF5733']);
    
    return {
      backgroundColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle, animatedColor]} />;
};

export default Dot;

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
});
