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
  placeholderTextColor = "#999",
  ...props
}) => {
  return (
    <View style={[styles.inputWrapper, !editable && styles.disabledInput, style]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color="#7a8ca3" 
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
    borderColor: '#e3e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    minHeight: Platform.OS === 'ios' ? 52 : 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  disabledInputText: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CommonInput; 