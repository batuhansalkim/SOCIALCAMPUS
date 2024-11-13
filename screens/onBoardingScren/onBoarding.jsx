import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, useWindowDimensions, StatusBar, SafeAreaView, Animated } from 'react-native';
import { Canvas, Circle, Group, Image, Mask } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import data from '../../data/data';
import RenderItem from '../../components/RenderItem';
import CustomButton from '../../components/CustomButton';
import Pagination from '../../components/Pagination';

const OnboardingScreen = ({ onDone }) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlay, setOverlay] = useState(null);
  const mask = useSharedValue(0);
  const buttonVal = useSharedValue(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const wait = useCallback((ms) => new Promise(resolve => setTimeout(resolve, ms)), []);

  const handlePress = useCallback(async () => {
    if (currentIndex === data.length - 1 && !active) {
      onDone();
      return;
    }
    if (!active) {
      setActive(true);

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const snapshot = await makeImageFromView(ref);
      setOverlay(snapshot);
      await wait(80);

      setCurrentIndex(prev => prev + 1);
      mask.value = withTiming(SCREEN_HEIGHT, { 
        duration: 800, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      buttonVal.value = withTiming(buttonVal.value + SCREEN_HEIGHT, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
      await wait(800);

      setOverlay(null);
      mask.value = 0;
      setActive(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [active, currentIndex, mask, buttonVal, SCREEN_HEIGHT, onDone, wait, fadeAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: buttonVal.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.content}>
        <Animated.View ref={ref} collapsable={false} style={[styles.renderItemContainer, { opacity: fadeAnim }]}>
          {data.map((item, index) => (
            currentIndex === index && <RenderItem item={item} key={index} />
          ))}
        </Animated.View>
        {overlay && (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Mask
              mode="luminance"
              mask={
                <Group>
                  <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT - 160} r={SCREEN_HEIGHT} color="white" />
                  <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT - 160} r={mask} color="black" />
                </Group>
              }
            >
              <Image 
                image={overlay} 
                x={0} 
                y={0} 
                width={SCREEN_WIDTH} 
                height={SCREEN_HEIGHT} 
                fit="cover"
              />
            </Mask>
          </Canvas>
        )}
        <View style={styles.bottomContainer}>
          <Pagination data={data} currentIndex={currentIndex} />
          <Animated.View style={animatedStyle}>
            <CustomButton
              handlePress={handlePress}
              isLastScreen={currentIndex === data.length - 1}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Koyu arka plan rengi
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  renderItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
});

export default OnboardingScreen;
