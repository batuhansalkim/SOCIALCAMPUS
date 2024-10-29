import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen({ onAccept, onClose }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-outline" size={30} color="#000033" />
                    </TouchableOpacity>
                    <Ionicons name="document-text-outline" size={40} color="#00FFFF" />
                    <Text style={styles.title}>Şartlar ve Koşullar</Text>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.content}>
                        Bu uygulamayı kullanarak, aşağıdaki şartlar ve koşulları kabul etmiş sayılırsınız. Bu şartlar ve koşullar, uygulamanın kullanımına yönelik önemli bilgiler ve uymanız gereken kuralları içermektedir.
                    </Text>

                    <Text style={styles.sectionTitle}>1. Toplanan Bilgiler</Text>
                    <Text style={styles.content}>
                        Bu uygulama, kullanıcıdan aşağıdaki bilgileri toplar:
                    </Text>
                    <View style={styles.bulletPoints}>
                        <Text style={styles.bulletPoint}>• Fotoğraf: Kullanıcı, galerisinden fotoğraf seçip yükleyebilir.</Text>
                        <Text style={styles.bulletPoint}>• Kişisel Bilgiler: Ad, soyad, fakülte, bölüm, e-posta adresi, şehir ve doğum tarihi bilgilerini talep ediyoruz.</Text>
                        <Text style={styles.bulletPoint}>• Kitap Fotoğrafı: Kullanıcı, satmak istediği kitapların fotoğraflarını galerisinden seçip yükleyebilir.</Text>
                        <Text style={styles.bulletPoint}>• Mesajlar: Kullanıcılar uygulama içinde mesajlaşma özelliğini kullanabilir.</Text>
                    </View>
                    <Text style={styles.content}>
                        Toplanan tüm bilgiler kullanıcı onayı ile alınır ve güvenli bir şekilde saklanır. Uygulamamız, konum bilgisi veya bildirimler gibi ek izinler gerektirmez.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Verilerin Kullanımı</Text>
                    <Text style={styles.content}>
                        Toplanan bilgiler, yalnızca aşağıdaki amaçlar doğrultusunda kullanılır:
                    </Text>
                    <View style={styles.bulletPoints}>
                        <Text style={styles.bulletPoint}>• Profil Bilgileri: Kullanıcıların, ad-soyad, fakülte, bölüm gibi bilgilerini doldurarak profillerini oluşturması.</Text>
                        <Text style={styles.bulletPoint}>• Kitap Fotoğrafları: Kitap satış ilanlarının oluşturulması için galeriye yüklenen kitap fotoğraflarının görüntülenmesi.</Text>
                        <Text style={styles.bulletPoint}>• Mesajlaşma Özelliği: Kullanıcıların uygulama içinde mesajlaşmasını sağlamak.</Text>
                    </View>
                    <Text style={styles.content}>
                        Kişisel bilgiler, uygulama içerisinde kullanıcıların kendilerine daha uygun bir deneyim sunmak dışında başka bir amaç için kullanılmaz ve üçüncü şahıslarla paylaşılmaz.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Verilerin Saklanması ve Güvenliği</Text>
                    <Text style={styles.content}>
                        Uygulama üzerinden toplanan tüm bilgiler güvenli sunucularımızda saklanır ve kullanıcı onayı olmadan üçüncü taraflarla paylaşılmaz. Veriler, yetkisiz erişime ve kötüye kullanıma karşı koruma sağlamak amacıyla şifrelenir ve güvenli protokollerle saklanır.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Kullanıcı Sorumlulukları</Text>
                    <View style={styles.bulletPoints}>
                        <Text style={styles.bulletPoint}>• Doğru Bilgi Sağlama: Kullanıcılar, sağladıkları bilgilerin doğru ve güncel olduğunu kabul eder.</Text>
                        <Text style={styles.bulletPoint}>• Mesajlaşma ve Paylaşım Etiği: Kullanıcılar, diğer kullanıcılara gönderilen mesajlarda ve kitap fotoğraflarında uygun olmayan içerikler paylaşmamalıdır.</Text>
                        <Text style={styles.bulletPoint}>• Hesap Güvenliği: Kullanıcılar, hesaplarının güvenliğinden kendileri sorumludur.</Text>
                    </View>

                    <Text style={styles.sectionTitle}>5. Veri Güncelleme ve Silme</Text>
                    <Text style={styles.content}>
                        Kullanıcılar, uygulama üzerinden profil bilgilerini güncelleyebilir ve uygulamanın veri saklama politikasına göre kişisel verilerinin silinmesini talep edebilir.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Son Kullanıcı Lisans Sözleşmesi (EULA)</Text>
                    <Text style={styles.content}>
                        Bu uygulama, yalnızca kişisel kullanım amacıyla sunulmaktadır. Kullanıcılar, uygulamayı ticari amaçlarla kullanmayacaklarını kabul ederler. Uygulamanın kötüye kullanımı, hesabın kapatılmasına veya uygulamaya erişimin durdurulmasına neden olabilir.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Gizlilik Politikası</Text>
                    <Text style={styles.content}>
                        Bu şartlar ve koşullar, Gizlilik Politikası ile uyumlu olarak hazırlanmıştır. Gizlilik politikamıza uygun olarak kullanıcı bilgilerinin gizliliğini koruyoruz. Daha fazla bilgi için lütfen Gizlilik Politikası bölümünü okuyun.
                    </Text>

                    <Text style={styles.content}>
                        Bu şartlar ve koşulları kabul ederek, yukarıda belirtilen tüm koşulları anladığınızı ve onayladığınızı beyan etmiş olursunuz.
                    </Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={onAccept}>
                    <Text style={styles.buttonText}>Kabul Ediyorum</Text>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000033',
    },
    contentContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000033',
        marginTop: 15,
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 10,
        lineHeight: 24,
    },
    bulletPoints: {
        marginLeft: 10,
        marginBottom: 10,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 5,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#00FFFF',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    buttonIcon: {
        marginLeft: 5,
    },
});