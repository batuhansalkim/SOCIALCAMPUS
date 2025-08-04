import { StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Image } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const CustomButton = ({ handlePress, buttonVal, isLastScreen }) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const widthAnimation = useRef(new Animated.Value(90)).current;
  const heightAnimation = useRef(new Animated.Value(90)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(widthAnimation, {
        toValue: isLastScreen ? 180 : 90,
        useNativeDriver: false,
      }),
      Animated.spring(heightAnimation, {
        toValue: isLastScreen ? 70 : 90,
        useNativeDriver: false,
      }),
      Animated.timing(arrowOpacity, {
        toValue: isLastScreen ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(arrowTranslateX, {
        toValue: isLastScreen ? 100 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: isLastScreen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textTranslateX, {
        toValue: isLastScreen ? 0 : -100,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isLastScreen]);

  const buttonAnimationStyle = {
    width: widthAnimation,
    height: heightAnimation,
  };

  const arrowAnimationStyle = {
    width: 40,
    height: 40,
    opacity: arrowOpacity,
    transform: [{ translateX: arrowTranslateX }],
  };

  const textAnimationStyle = {
    opacity: textOpacity,
    transform: [{ translateX: textTranslateX }],
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.container, buttonAnimationStyle]}>
        {isLastScreen ? (
          <Animated.Text style={[styles.textButton, textAnimationStyle]}>
            Giriş Sayfası
          </Animated.Text>
        ) : (
          <Animated.Image
            source={require('../assets/images/ArrowIcon (1).png')}
            style={arrowAnimationStyle}
            tintColor="black"
          />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    zIndex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bfe8f2',
  },
  textButton: { 
    color: 'black', 
    fontSize: 17, 
    position: 'absolute' 
  },
});
