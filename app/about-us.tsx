import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutUsScreen() {
    const router = useRouter();

    const ecosystemItems = [
        { id: 1, title: 'MAHTO', sub: 'Worker, Contractor & Shops Marketplace', icon: 'account-group-outline' },
        { id: 2, title: 'Mine (by MAHTO)', sub: 'Full-stack Construction & Renovation Services', icon: 'home-edit-outline' },
        { id: 3, title: 'MAHTO Home Loans', sub: 'Home Loans Marketplace', icon: 'bank-outline' },
        { id: 4, title: 'MAHTO Land & Properties', sub: 'Land & Property Listings', icon: 'map-marker-radius-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoText}>MAHTO</Text>
                    </View>
                    <Text style={styles.heroTitle}>Home Building OS</Text>
                    <Text style={styles.heroSubtitle}>MAHTO is the operating system for home building.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionText}>
                        We are building one <Text style={styles.boldText}>unified system</Text> that brings together everything required to build a home — from land and labor to construction materials, financing, and delivery.
                    </Text>
                    <Text style={styles.sectionText}>
                        Today, building a home means dealing with fragmented vendors, contractors, workers, and middlemen. MAHTO simplifies this entire journey into a single, integrated platform — end to end.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>WHAT WE’RE BUILDING</Text>
                    <Text style={styles.sectionHeading}>The MAHTO Ecosystem</Text>

                    {ecosystemItems.map((item) => (
                        <View key={item.id} style={styles.ecoCard}>
                            <View style={styles.ecoIconContainer}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color="#6366f1" />
                            </View>
                            <View style={styles.ecoTextContainer}>
                                <Text style={styles.ecoTitle}>{item.id}. {item.title}</Text>
                                <Text style={styles.ecoSub}>{item.sub}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.highlightCard}>
                    <MaterialCommunityIcons name="format-quote-open" size={32} color="white" />
                    <Text style={styles.highlightText}>
                        “Full-stack” at MAHTO means from land to lending — not just design to construction.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>OUR MISSION</Text>
                    <Text style={styles.missionTitle}>A roof over every head — not just a roof, but <Text style={styles.primaryText}>own roof</Text>.</Text>
                    <View style={styles.hindiBox}>
                        <Text style={styles.hindiText}>“Sabka sar apni chhaat.”</Text>
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.label}>OUR VISION</Text>
                    <Text style={styles.sectionText}>
                        To raise living standards by becoming the <Text style={styles.boldText}>global operating system</Text> for home building.
                    </Text>
                </View>
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
    heroSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logoBadge: {
        backgroundColor: 'black',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 20,
    },
    logoText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 30,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: '#6366f1',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    sectionHeading: {
        fontSize: 22,
        fontWeight: '900',
        color: 'black',
        marginBottom: 20,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#444',
        marginBottom: 15,
    },
    boldText: {
        fontWeight: '800',
        color: 'black',
    },
    ecoCard: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    ecoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eeefff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    ecoTextContainer: {
        flex: 1,
    },
    ecoTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: 'black',
    },
    ecoSub: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    highlightCard: {
        backgroundColor: 'black',
        padding: 24,
        borderRadius: 24,
        marginTop: 30,
        alignItems: 'center',
    },
    highlightText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 28,
        fontStyle: 'italic',
        marginTop: 10,
    },
    missionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: 'black',
        lineHeight: 30,
    },
    primaryText: {
        color: '#6366f1',
    },
    hindiBox: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    hindiText: {
        fontSize: 20,
        fontWeight: '900',
        color: 'black',
        fontStyle: 'italic',
    },
});
