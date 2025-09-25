import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const CommonPicker = ({
  icon,
  placeholder,
  selectedValue,
  onValueChange,
  items = [],
  enabled = true,
  editable = true,
  style,
  iconColor = "#00BFFF",
  borderColor = "#00BFFF",
  ...props
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleValueChange = (value) => {
    onValueChange(value);
    if (Platform.OS === 'ios') {
      setShowPicker(false);
    }
  };

  const getSelectedLabel = () => {
    if (!selectedValue) return placeholder;
    const selectedItem = items.find(item => item.value === selectedValue);
    return selectedItem ? selectedItem.label : placeholder;
  };

  if (Platform.OS === 'ios') {
    return (
      <>
        <TouchableOpacity 
          style={[styles.inputWrapper, { borderColor }, !editable && styles.disabledInput, style]}
          onPress={() => editable && enabled && setShowPicker(true)}
          disabled={!editable || !enabled}
        >
          {icon && (
            <Ionicons 
              name={icon} 
              size={18} 
              color={iconColor} 
              style={styles.pickerIcon} 
            />
          )}
          <Text style={[styles.pickerText, !selectedValue && styles.placeholderText]}>
            {getSelectedLabel()}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={18} 
            color={iconColor} 
            style={styles.chevronIcon} 
          />
        </TouchableOpacity>

        <Modal
          visible={showPicker}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity 
                  onPress={() => setShowPicker(false)}
                  style={styles.pickerHeaderButton}
                >
                  <Text style={styles.pickerHeaderButtonText}>Kapat</Text>
                </TouchableOpacity>
                <Text style={styles.pickerHeaderTitle}>{placeholder}</Text>
                <TouchableOpacity 
                  onPress={() => setShowPicker(false)}
                  style={styles.pickerHeaderButton}
                >
                  <Text style={styles.pickerHeaderButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedValue}
                onValueChange={handleValueChange}
                enabled={enabled}
                {...props}
              >
                {items.map((item, index) => (
                  <Picker.Item 
                    key={index} 
                    label={item.label} 
                    value={item.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.pickerContainer, { borderColor }, !editable && styles.disabledInput, style]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={18} 
          color={iconColor} 
          style={styles.pickerIcon} 
        />
      )}
      <Picker
        style={styles.picker}
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
        enabled={enabled && editable}
        {...props}
      >
        {items.map((item, index) => (
          <Picker.Item 
            key={index} 
            label={item.label} 
            value={item.value} 
          />
        ))}
      </Picker>
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00BFFF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
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
    marginRight: 12,
  },
  pickerIcon: {
    marginRight: 8,
    color: '#00BFFF',
    fontSize: 16,
    zIndex: 2,
  },
  chevronIcon: {
    marginLeft: 8,
    color: '#00BFFF',
    fontSize: 16,
    zIndex: 2,
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
    lineHeight: 36,
    zIndex: 1,
  },
  placeholderText: {
    color: '#000000',
  },
  picker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 180 : 52,
    color: '#333',
    fontSize: 14,
    textAlignVertical: 'center',
    zIndex: 1,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerHeaderButton: {
    paddingHorizontal: 15,
  },
  pickerHeaderButtonText: {
    color: '#4c669f',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default CommonPicker; 