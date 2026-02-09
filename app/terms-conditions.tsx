import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TermsConditionsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.lastUpdated}>Last Updated: February 09, 2026</Text>

                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.text}>
                    By downloading, installing, or using the MAHTO mobile application, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
                </Text>

                <Text style={styles.sectionTitle}>2. Use of the App</Text>
                <Text style={styles.text}>
                    • You must be at least 18 years old to use this app.{"\n"}
                    • You are responsible for maintaining the confidentiality of your account password.{"\n"}
                    • You agree to provide accurate and current information during registration.
                </Text>

                <Text style={styles.sectionTitle}>3. User Conduct</Text>
                <Text style={styles.text}>
                    You agree not to:{"\n"}
                    • Post misleading, fraudulent, or illegal content.{"\n"}
                    • Harass or mistreat other users of the platform.{"\n"}
                    • Use the app for any unauthorized commercial purposes.{"\n"}
                    • Attempt to disrupt or compromise the security of the application.
                </Text>

                <Text style={styles.sectionTitle}>4. MAHTO as a Platform</Text>
                <Text style={styles.text}>
                    MAHTO acts as a digital marketplace to connect homeowners with service providers (workers, contractors, shops).{"\n"}
                    • <Text style={styles.bold}>No Employment:</Text> MAHTO is not an employer of the service providers listed.{"\n"}
                    • <Text style={styles.bold}>No Guarantee:</Text> We do not guarantee the quality, safety, or legality of the services advertised or the ability of users to pay for services.{"\n"}
                    • <Text style={styles.bold}>Payments:</Text> All financial transactions and agreements are strictly between the users. MAHTO is not responsible for payment disputes.
                </Text>

                <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
                <Text style={styles.text}>
                    All contents, features, and functionality of the app are owned by MAHTO. You retain ownership of the content you upload, but you grant us a license to display it within the app.
                </Text>

                <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                <Text style={styles.text}>
                    To the maximum extent permitted by law, MAHTO shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the application.
                </Text>

                <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
                <Text style={styles.text}>
                    We reserve the right to modify these terms at any time. We will notify users of any significant changes via the app.
                </Text>

                <Text style={styles.sectionTitle}>8. Governing Law</Text>
                <Text style={styles.text}>
                    These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
                </Text>

                <Text style={styles.sectionTitle}>9. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about these Terms and Conditions, please contact us at support@mahtoji.tech.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    content: {
        padding: Spacing.lg,
    },
    lastUpdated: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: 'black',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444',
        marginBottom: 10,
    },
    bold: {
        fontWeight: '700',
        color: 'black',
    },
});
