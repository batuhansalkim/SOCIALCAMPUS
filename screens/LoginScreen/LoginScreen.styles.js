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
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: screenWidth * 0.04,
    },
    logo: {
        width: screenWidth * 0.35,
        height: screenWidth * 0.35,
        resizeMode: 'contain',
        marginBottom: screenWidth * 0.02,
    },
    title: {
        fontSize: screenWidth * 0.08,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: screenWidth * 0.01,
    },
    subtitle: {
        fontSize: screenWidth * 0.04,
        color: '#D3D3D3',
        textAlign: 'center',
        marginBottom: screenWidth * 0.04,
    },
    formContainer: {
        width: screenWidth * 0.85,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: screenWidth * 0.05,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    inputGroup: {
        marginBottom: screenWidth * 0.05,
    },
    label: {
        fontSize: 16,
        marginBottom: screenWidth * 0.02,
        fontWeight: '600',
        color: '#333',
    },
    termsContainer: {
        marginVertical: screenWidth * 0.04,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenWidth * 0.035,
        paddingVertical: screenWidth * 0.01,
    },
    switchLabel: {
        marginLeft: screenWidth * 0.03,
        color: '#000000',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    underlinedText: {
        textDecorationLine: 'underline',
        fontSize: 14,
        color: '#27c383',
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: screenWidth * 0.06,
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