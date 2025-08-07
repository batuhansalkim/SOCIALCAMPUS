import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TermsScreen = ({ onClose, onAccept }) => {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Ionicons name="document-text" size={24} color="#FFFFFF" />
                        <Text style={styles.headerText}>Şartlar ve Koşullar</Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentCard}>
                        <Text style={styles.sectionTitle}>1. GENEL HÜKÜMLER</Text>
                        <Text style={styles.paragraph}>
                            Bu Şartlar ve Koşullar, Kırklareli Üniversitesi (KLÜ) Yazılım Mühendisliği öğrencileri tarafından geliştirilen SOCİALCAMPUS mobil uygulamasının kullanımını düzenler. Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız.
                        </Text>

                        <Text style={styles.sectionTitle}>2. UYGULAMA KULLANIMI</Text>
                        <Text style={styles.paragraph}>
                            • Uygulama sadece KLÜ öğrencileri tarafından kullanılabilir.{'\n'}
                            • Kullanıcı bilgilerinizin doğruluğundan siz sorumlusunuz.{'\n'}
                            • Uygulama içeriğini kötüye kullanmak yasaktır.{'\n'}
                            • Kampüs kurallarına uygun davranış sergilemek zorunludur.
                        </Text>

                        <Text style={styles.sectionTitle}>3. VERİ GÜVENLİĞİ VE GİZLİLİK</Text>
                        <Text style={styles.paragraph}>
                            • Kişisel verileriniz KVKK kapsamında korunmaktadır.{'\n'}
                            • Verileriniz sadece uygulama işlevselliği için kullanılır.{'\n'}
                            • Üçüncü taraflarla paylaşım yapılmaz.{'\n'}
                            • Güvenlik önlemleri sürekli güncellenir.
                        </Text>

                        <Text style={styles.sectionTitle}>4. SORUMLULUK SINIRLARI</Text>
                        <Text style={styles.paragraph}>
                            • Uygulama içeriğinin doğruluğu için çaba gösterilir.{'\n'}
                            • Teknik sorunlardan KLÜ sorumlu değildir.{'\n'}
                            • Kullanıcı hatalarından doğan sorunlar kullanıcıya aittir.{'\n'}
                            • Uygulama kesintileri önceden bildirilir.
                        </Text>

                        <Text style={styles.sectionTitle}>5. FİKRİ MÜLKİYET</Text>
                        <Text style={styles.paragraph}>
                            • Uygulama ve içeriği KLÜ Yazılım Mühendisliği öğrencilerinin fikri mülkiyetindedir.{'\n'}
                            • Kopyalama, dağıtma ve değiştirme yasaktır.{'\n'}
                            • Ticari kullanım için izin gereklidir.
                        </Text>

                        <Text style={styles.sectionTitle}>6. DEĞİŞİKLİKLER</Text>
                        <Text style={styles.paragraph}>
                            Bu şartlar gerektiğinde güncellenebilir. Değişiklikler uygulama içinde duyurulur ve kullanıma devam etmek güncellenmiş şartları kabul etmek anlamına gelir.
                        </Text>

                        <Text style={styles.sectionTitle}>7. İLETİŞİM</Text>
                        <Text style={styles.paragraph}>
                            Sorularınız için: sosyalcampus@klu.edu.tr{'\n'}
                            Adres: Kırıkkale Üniversitesi, Kırıkkale
                        </Text>
                    </View>
                </ScrollView>
                
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                        <LinearGradient
                            colors={['#2E8B57', '#228B22']}
                            style={styles.acceptButtonGradient}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.acceptButtonText}>Şartları Kabul Ediyorum</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4c669f',
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flex: 1,
        padding: 12,
    },
    contentCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 15,
        color: '#333',
        textAlign: 'justify',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    acceptButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    acceptButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default TermsScreen; 