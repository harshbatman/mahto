import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpSupportScreen() {
    const router = useRouter();

    const handleEmail = (email: string, subject: string = '') => {
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroSection}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="face-agent" size={50} color="#6366f1" />
                    </View>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>We typically reply within 24 hours</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Support</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardText}>
                            Facing issues while using the MAHTO App? Our support team is here to help.
                        </Text>
                        <View style={styles.tipContainer}>
                            <MaterialCommunityIcons name="information-outline" size={18} color="#6366f1" />
                            <Text style={styles.tipText}>Tip: Attach a screenshot of the issue for a more precise solution.</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.emailBtn}
                            onPress={() => handleEmail('support@mahtoji.tech', 'Support Request: [Issue Name or Description]')}
                        >
                            <MaterialCommunityIcons name="email-outline" size={20} color="white" />
                            <Text style={styles.emailBtnText}>Email Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Feature Requests</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardText}>
                            Have an idea to make MAHTO better? We would love to hear your suggestions.
                        </Text>
                        <TouchableOpacity
                            style={[styles.emailBtn, { backgroundColor: '#10b981' }]}
                            onPress={() => handleEmail('support@mahtoji.tech', 'Feature Request')}
                        >
                            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="white" />
                            <Text style={styles.emailBtnText}>Submit Idea</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Escalate to CEO Office</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardText}>
                            If your issue remains unresolved or you have a direct message for our leadership.
                        </Text>
                        <TouchableOpacity
                            style={[styles.emailBtn, { backgroundColor: 'black' }]}
                            onPress={() => handleEmail('harshkumarceo@mahtoji.tech', 'Direct Message to CEO Office')}
                        >
                            <MaterialCommunityIcons name="shield-account-outline" size={20} color="white" />
                            <Text style={styles.emailBtnText}>Contact CEO Office</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: 'white',
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
    heroSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eeefff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: 'black',
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        gap: 16,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    tipContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f6ff',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        alignItems: 'flex-start',
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#6366f1',
        fontWeight: '600',
    },
    emailBtn: {
        flexDirection: 'row',
        backgroundColor: '#6366f1',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    emailBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
