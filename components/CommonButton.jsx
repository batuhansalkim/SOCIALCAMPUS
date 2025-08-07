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
        return disabled ? ['#2E8B57', '#2E8B57'] : ['#2E8B57', '#228B22'];
      case 'warning':
        return ['#ffc107', '#e0a800'];
      default:
        return ['#005BAC', '#004A8C'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, fontSize: 14 };
      case 'large':
        return { paddingVertical: 20, fontSize: 20 };
      default:
        return { paddingVertical: 16, fontSize: 16 };
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
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 18,
    
    
  },
  disabledButton: {
    opacity: 0.7,
    elevation: 2,
    shadowOpacity: 0.2,
  },
  disabledButtonText: {
    color: '#FFFFFF',
  },
});

export default CommonButton; 