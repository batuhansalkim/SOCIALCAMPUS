import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LoadingSpinner = ({
  size = 'large',
  color = '#4ECDC4',
  text = 'Yükleniyor...',
  containerStyle,
  textStyle,
  showText = true
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {showText && text && (
        <Text style={[styles.loadingText, textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    marginTop: 10,
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingSpinner; 