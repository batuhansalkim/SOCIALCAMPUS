import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ErrorView = ({
  message = 'Bir hata oluştu',
  onRetry,
  icon = 'alert-circle-outline',
  containerStyle,
  textStyle,
  buttonText = 'Tekrar Dene',
  showButton = true
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name={icon} size={60} color="#ff6b6b" style={styles.icon} />
      <Text style={[styles.errorText, textStyle]}>
        {message}
      </Text>
      {showButton && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>
            {buttonText}
          </Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ErrorView; 