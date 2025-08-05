import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const CommonModal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeButtonText = 'Kapat',
  containerStyle,
  contentStyle,
  headerStyle,
  titleStyle,
  scrollable = true,
  ...props
}) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: [styles.scrollContent, contentStyle]
  } : {
    style: [styles.content, contentStyle]
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <BlurView intensity={100} tint="dark" style={styles.modalContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.9)']}
          style={[styles.modalContent, containerStyle]}
        >
          {(title || showCloseButton) && (
            <View style={[styles.modalHeader, headerStyle]}>
              {title && (
                <Text style={[styles.modalTitle, titleStyle]}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={onClose}
                >
                  <Ionicons name="close-circle" size={32} color="#4ECDC4" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ContentWrapper {...contentProps}>
            {children}
          </ContentWrapper>

          {closeButtonText && (
            <TouchableOpacity style={styles.modalBottomButton} onPress={onClose}>
              <LinearGradient
                colors={['#4ECDC4', '#45B7AF']}
                style={styles.bottomButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalBottomButtonText}>
                  {closeButtonText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78,205,196,0.2)',
  },
  modalTitle: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    color: '#4ECDC4',
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalBottomButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  bottomButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  modalBottomButtonText: {
    color: '#000',
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
  },
});

export default CommonModal; 