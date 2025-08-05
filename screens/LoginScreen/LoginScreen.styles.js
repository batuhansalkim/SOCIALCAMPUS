import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: screenWidth * 0.05,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: screenWidth * 0.1,
    },
    logo: {
        width: screenWidth * 0.4,
        height: screenWidth * 0.4,
        resizeMode: 'contain',
    },
    title: {
        fontSize: screenWidth * 0.08,
        fontWeight: 'bold',
        color: '#4ECDC4',
        textAlign: 'center',
        marginTop: screenWidth * 0.03,
        textShadowColor: 'rgba(78, 205, 196, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: screenWidth * 0.04,
        color: '#fff',
        textAlign: 'center',
        marginTop: screenWidth * 0.02,
        opacity: 0.8,
    },
    formContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: screenWidth * 0.05,
        marginTop: screenWidth * 0.05,
    },
    formTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#4ECDC4',
        textAlign: 'center',
        marginBottom: screenWidth * 0.05,
    },
    inputContainer: {
        marginBottom: screenWidth * 0.04,
    },
    inputLabel: {
        fontSize: screenWidth * 0.04,
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: screenWidth * 0.02,
    },
    buttonContainer: {
        marginTop: screenWidth * 0.05,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.04,
        marginTop: screenWidth * 0.03,
        fontWeight: '500',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#4c669f',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    },
    headerContainer: {
        marginBottom: 8,
        alignItems: 'center'
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '500',
        color: '#333'
    },
    termsContainer: {
        marginVertical: 10
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    switchLabel: {
        marginLeft: 8,
        color: '#333',
        flex: 1,
        fontSize: 14
    },
    underlinedText: {
        textDecorationLine: 'underline',
        fontSize: 14
    },
}); 