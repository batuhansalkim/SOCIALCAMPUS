import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommonInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  style,
  placeholderTextColor = "#000000",
  iconColor = "#00BFFF",
  borderColor = "#00BFFF",
  ...props
}) => {
  return (
    <View style={[styles.inputWrapper, { borderColor }, !editable && styles.disabledInput, style]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={22} 
          color={iconColor} 
          style={styles.inputIcon} 
        />
      )}
      <TextInput
        style={[styles.input, !editable && styles.disabledInputText]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#00BFFF',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 1,
  },
  inputIcon: {
    marginRight: 8,
    color: '#00BFFF',
    fontSize: 16,
    zIndex: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
    lineHeight: 45,
    zIndex: 1,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  disabledInputText: {
    color: '#999',
  },
});

export default CommonInput; 