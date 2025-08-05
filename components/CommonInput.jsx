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
          color="#4c669f" 
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
    borderColor: '#4c669f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: Platform.OS === 'ios' ? 50 : 47,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: Platform.OS === 'ios' ? 50 : 47,
    color: '#333',
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
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