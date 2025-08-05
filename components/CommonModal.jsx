import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  fullScreen = true,
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
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      {...props}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#0F0F0F', '#1A1A1A', '#0F0F0F']}
          style={[styles.modalContainer, fullScreen && styles.fullScreenContainer]}
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
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#005BAC', '#004A8C']}
                    style={styles.closeButtonGradient}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ContentWrapper {...contentProps}>
            {children}
          </ContentWrapper>

          {closeButtonText && (
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity 
                style={styles.modalBottomButton} 
                onPress={onClose}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#005BAC', '#004A8C']}
                  style={styles.bottomButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalBottomButtonText}>
                    {closeButtonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  fullScreenContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 91, 172, 0.2)',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
  },
  modalTitle: {
    fontSize: screenWidth * 0.06,
    fontWeight: '700',
    color: '#005BAC',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#005BAC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 91, 172, 0.1)',
  },
  modalBottomButton: {
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#005BAC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bottomButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBottomButtonText: {
    color: '#FFFFFF',
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat-SemiBold' : 'Montserrat-SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default CommonModal; 