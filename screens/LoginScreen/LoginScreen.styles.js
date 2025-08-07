import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#4c669f',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: screenWidth * 0.02,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: screenWidth * 0.005,
    },
    logoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenWidth * 0.015,
        paddingHorizontal: screenWidth * 0.02,
    },
    logo: {
        width: screenWidth * 0.28,
        height: screenWidth * 0.28,
        resizeMode: 'contain',
        marginRight: screenWidth * 0.025,
    },
    title: {
        fontSize: screenWidth * 0.065,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: screenWidth * 0.035,
        color: '#D3D3D3',
        textAlign: 'center',
        marginBottom: screenWidth * 0.01,
    },
    formContainer: {
        width: screenWidth * 0.92,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: screenWidth * 0.04,
        marginTop: screenWidth * 0.01,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    inputGroup: {
        marginBottom: screenWidth * 0.03,
    },
    label: {
        fontSize: 14,
        marginBottom: screenWidth * 0.015,
        fontWeight: '600',
        color: '#333',
    },
    termsContainer: {
        marginVertical: screenWidth * 0.02,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenWidth * 0.02,
        paddingVertical: screenWidth * 0.005,
    },
    switchLabel: {
        marginLeft: screenWidth * 0.02,
        color: '#000000',
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    termsText: {
        fontSize: 13,
        color: '#2E8B57',
        fontWeight: '600',
        textDecorationLine: 'none',
    },
    underlinedText: {
        textDecorationLine: 'underline',
        fontSize: 14,
        color: '#27c383',
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: screenWidth * 0.03,
        width: '100%',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    },
    loadingText: {
        color: '#27c383',
        fontSize: screenWidth * 0.04,
        marginTop: screenWidth * 0.03,
        fontWeight: '500',
    },
}); 