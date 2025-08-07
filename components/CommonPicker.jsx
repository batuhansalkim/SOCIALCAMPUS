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
          style={[styles.inputWrapper, !editable && styles.disabledInput, style]}
          onPress={() => editable && enabled && setShowPicker(true)}
          disabled={!editable || !enabled}
        >
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color="#7a8ca3" 
              style={styles.inputIcon} 
            />
          )}
          <Text style={[styles.pickerText, !selectedValue && styles.placeholderText]}>
            {getSelectedLabel()}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color="#7a8ca3" 
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
    <View style={[styles.pickerContainer, !editable && styles.disabledInput, style]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color="#7a8ca3" 
          style={styles.inputIcon} 
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  placeholderText: {
    color: '#999',
  },
  picker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 180 : 52,
    color: '#333',
    fontSize: 15,
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