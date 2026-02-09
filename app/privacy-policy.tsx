import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.lastUpdated}>Last Updated: February 09, 2026</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    Welcome to MAHTO. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.text}>
                    • <Text style={styles.bold}>Personal Information:</Text> We collect your name, phone number, and profile details when you register as a Homeowner, Worker, Contractor, or Shop Owner.{"\n"}
                    • <Text style={styles.bold}>Location Data:</Text> With your permission, we collect precise or approximate location data to show you nearby workers, contractors, and shops.{"\n"}
                    • <Text style={styles.bold}>User Content:</Text> We store images you upload (profile photos, shop banners, work portfolios) and business information (GST, services).{"\n"}
                    • <Text style={styles.bold}>Device Information:</Text> We may collect information about your mobile device, including model, operating system, and unique identifiers.
                </Text>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.text}>
                    • To facilitate connections between homeowners and service providers.{"\n"}
                    • To display your business or services to nearby users.{"\n"}
                    • To manage your account and provide customer support.{"\n"}
                    • To improve our app's features and user experience.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
                <Text style={styles.text}>
                    • <Text style={styles.bold}>Between Users:</Text> Your contact information and business details are shared with other users to enable business interactions.{"\n"}
                    • <Text style={styles.bold}>Service Providers:</Text> We use third-party services like Firebase for authentication, database management, and storage.{"\n"}
                    • <Text style={styles.bold}>Legal Requirements:</Text> We may disclose data if required by law or to protect our rights.
                </Text>

                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.text}>
                    We implement industry-standard security measures to protect your data. However, no method of transmission over the internet or mobile storage is 100% secure.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
                <Text style={styles.text}>
                    You can access and update your profile information within the app settings. You can also withdraw location permissions at any time through your device's system settings.
                </Text>

                <Text style={styles.sectionTitle}>7. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about this Privacy Policy, please contact us at support@mahtoji.tech.
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
