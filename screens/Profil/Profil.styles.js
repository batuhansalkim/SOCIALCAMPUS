import { StyleSheet, Dimensions, Platform } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Minimal Koyu Tema Renk Paleti
const colors = {
    // Ana Renkler
    primary: '#005BAC',        // KLU Mavi - Ana vurgu rengi
    secondary: '#00C896',       // Yeşil - İkincil vurgu
    accent: '#FFD700',          // Sarı - Özel durumlar
    
    // Koyu Tema Renkleri
    background: '#0F0F0F',      // Ana arka plan - Koyu
    surface: '#1A1A1A',         // Kart arka planı - Orta koyu
    surfaceLight: '#2A2A2A',    // Hafif koyu
    surfaceDark: '#0A0A0A',     // Çok koyu
    
    // Metin Renkleri
    white: '#FFFFFF',
    lightGray: '#E0E0E0',
    gray: '#9E9E9E',
    darkGray: '#424242',
    black: '#000000',
    
    // Şeffaf Renkler
    primaryTransparent: 'rgba(0, 91, 172, 0.15)',
    secondaryTransparent: 'rgba(0, 200, 150, 0.15)',
    whiteTransparent: 'rgba(255, 255, 255, 0.08)',
    whiteTransparentLight: 'rgba(255, 255, 255, 0.04)',
    
    // Durum Renkleri
    success: '#00C896',
    warning: '#FFD700',
    danger: '#DC3545',
    info: '#005BAC',
};

// Profesyonel Font Sistemi
const typography = {
    // Başlıklar - Poppins (Genç, yuvarlak hatlı)
    h1: { 
        fontSize: screenWidth * 0.08, 
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold',
        letterSpacing: -0.5,
    },
    h2: { 
        fontSize: screenWidth * 0.06, 
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Poppins-SemiBold' : 'Poppins-SemiBold',
        letterSpacing: -0.3,
    },
    h3: { 
        fontSize: screenWidth * 0.05, 
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Poppins-SemiBold' : 'Poppins-SemiBold',
        letterSpacing: -0.2,
    },
    h4: { 
        fontSize: screenWidth * 0.045, 
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Poppins-Medium' : 'Poppins-Medium',
        letterSpacing: -0.1,
    },
    
    // Genel Metinler - Inter (Modern, sade, okunabilir)
    body: { 
        fontSize: screenWidth * 0.04, 
        fontWeight: '400',
        fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
        lineHeight: screenWidth * 0.06,
    },
    bodySmall: { 
        fontSize: screenWidth * 0.035, 
        fontWeight: '400',
        fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
        lineHeight: screenWidth * 0.05,
    },
    bodyBold: { 
        fontSize: screenWidth * 0.04, 
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Inter-SemiBold' : 'Inter-SemiBold',
        lineHeight: screenWidth * 0.06,
    },
    
    // Navigasyon - Montserrat (Güçlü, net)
    nav: { 
        fontSize: screenWidth * 0.035, 
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Montserrat-SemiBold' : 'Montserrat-SemiBold',
        letterSpacing: 0.5,
    },
    
    // Premium İçerikler - Raleway (Premium hissi)
    premium: { 
        fontSize: screenWidth * 0.04, 
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Raleway-Medium' : 'Raleway-Medium',
        letterSpacing: 0.3,
    },
    
    // Küçük Metinler
    caption: { 
        fontSize: screenWidth * 0.03, 
        fontWeight: '400',
        fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
        lineHeight: screenWidth * 0.04,
    },
};

// Profesyonel Spacing Sistemi
const spacing = {
    xs: screenWidth * 0.01,    // 4px
    sm: screenWidth * 0.02,    // 8px
    md: screenWidth * 0.03,    // 12px
    lg: screenWidth * 0.04,    // 16px
    xl: screenWidth * 0.05,    // 20px
    xxl: screenWidth * 0.08,   // 32px
    xxxl: screenWidth * 0.12,  // 48px
};

// Profesyonel Shadow Sistemi
const shadows = {
    small: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    large: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
};

export const styles = StyleSheet.create({
    // Container Styles
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: Platform.OS === 'ios' ? 85 : 60,
    },

    // Header Section
    header: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : screenWidth * 0.04,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: 25,
        marginBottom: spacing.lg,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.whiteTransparent,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
    },
    profileImage: {
        width: screenWidth * 0.25,
        height: screenWidth * 0.25,
        borderRadius: screenWidth * 0.125,
        borderWidth: 4,
        borderColor: colors.primary,
        ...shadows.large,
    },
    editImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.secondary,
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    userName: {
        ...typography.h3,
        color: colors.white,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    userStatus: {
        ...typography.caption,
        color: colors.gray,
        textAlign: 'center',
        opacity: 0.9,
    },

    // Content Section
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },

    // Info Cards
    infoContainer: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.whiteTransparent,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        backgroundColor: colors.surfaceLight,
        borderRadius: 15,
        padding: spacing.md,
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.whiteTransparentLight,
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryTransparent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        ...typography.bodySmall,
        color: colors.primary,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    infoText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '500',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryTransparent,
        borderRadius: 15,
        padding: spacing.md,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    editButtonText: {
        color: colors.white,
        ...typography.bodyBold,
        marginLeft: spacing.sm,
    },

    // Action Buttons
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    actionButton: {
        backgroundColor: colors.surface,
        borderRadius: 15,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.whiteTransparent,
    },
    actionButtonText: {
        color: colors.white,
        ...typography.nav,
        marginLeft: spacing.sm,
    },
    longButton: {
        backgroundColor: colors.primary,
        borderRadius: 15,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    longButtonText: {
        ...typography.nav,
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },

    // Settings Section
    settingsContainer: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.whiteTransparent,
    },
    settingsTitle: {
        ...typography.h4,
        color: colors.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.whiteTransparentLight,
    },
    settingsItemText: {
        ...typography.body,
        color: colors.white,
        flex: 1,
        marginLeft: spacing.md,
    },

    // Modal Styles - Artık kullanılmıyor, CommonModal kullanılıyor
    modalContent: {
        flex: 1,
        backgroundColor: colors.background,
    },
    // Modal Header - Artık CommonModal içinde
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.whiteTransparentLight,
    },
    modalTitle: {
        ...typography.h3,
        color: colors.primary,
        flex: 1,
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    modalInput: {
        marginBottom: spacing.md,
    },
    modalSaveButton: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },

    // About App Modal
    aboutModalContent: {
        flex: 1,
        padding: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
        backgroundColor: colors.background,
    },
    welcomeSection: {
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        backgroundColor: colors.primaryTransparent,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.primaryTransparent,
    },
    aboutModalSubtitle: {
        ...typography.h4,
        color: colors.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    aboutModalText: {
        ...typography.body,
        color: colors.white,
        lineHeight: screenWidth * 0.06,
        marginBottom: spacing.md,
        opacity: 0.9,
    },
    developerSection: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.whiteTransparent,
    },
    featuresTitle: {
        ...typography.h3,
        color: colors.primary,
        marginBottom: spacing.lg,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    featuresContainer: {
        marginBottom: spacing.lg,
    },
    featureCard: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: spacing.md,
        marginBottom: spacing.md,
        alignItems: 'flex-start',
        backgroundColor: colors.surfaceLight,
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.whiteTransparentLight,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondaryTransparent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        ...typography.bodyBold,
        color: colors.secondary,
        marginBottom: spacing.xs,
    },
    featureDescription: {
        ...typography.bodySmall,
        color: colors.gray,
        lineHeight: screenWidth * 0.05,
    },

    // Loading States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },

    // Utility Classes
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spaceBetween: {
        justifyContent: 'space-between',
    },
    flex1: {
        flex: 1,
    },
}); 