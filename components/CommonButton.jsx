import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CommonButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, danger, success
  size = 'medium', // small, medium, large
  style,
  textStyle,
  gradient = true,
  ...props
}) => {
  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return ['#6c757d', '#5a6268'];
      case 'danger':
        return ['#dc3545', '#c82333'];
      case 'success':
        return ['#28a745', '#218838'];
      case 'warning':
        return ['#ffc107', '#e0a800'];
      default:
        return ['#4ECDC4', '#45B7AF'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, fontSize: 12 };
      case 'large':
        return { paddingVertical: 16, fontSize: 18 };
      default:
        return { paddingVertical: 12, fontSize: 14 };
    }
  };

  const buttonStyle = [
    styles.button,
    getButtonSize(),
    disabled && styles.disabledButton,
    style
  ];

  const textStyleCombined = [
    styles.buttonText,
    { fontSize: getButtonSize().fontSize },
    disabled && styles.disabledButtonText,
    textStyle
  ];

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={getButtonColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, { backgroundColor: getButtonColors()[0] }]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButtonText: {
    color: '#ccc',
  },
});

export default CommonButton; 