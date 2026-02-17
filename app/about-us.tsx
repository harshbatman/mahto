import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function AboutUsScreen() {
    const router = useRouter();

    const ecosystemItems = [
        { id: 1, title: 'MAHTO', sub: 'Worker, Contractor & Shops Network', icon: 'account-group-outline' },
        { id: 2, title: 'Mine (by MAHTO)', sub: 'Full-stack Construction Services', icon: 'home-edit-outline' },
        { id: 3, title: 'MAHTO Home Loans', sub: 'Home Loans & Credit Marketplace', icon: 'bank-outline' },
        { id: 4, title: 'MAHTO Lands & Properties', sub: 'Lands & Properties Marketplace', icon: 'map-marker-radius-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mission</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoText}>MAHTO</Text>
                    </View>
                    <Text style={styles.heroTitle}>Home Building OS</Text>
                    <Text style={styles.heroSubtitle}>The operating system for the entire home building journey.</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionText}>
                        We are building a <Text style={styles.boldText}>unified system</Text> that integrates everything required to build a home — land, labor, materials, and financing.
                    </Text>
                    <Text style={styles.sectionText}>
                        MAHTO simplifies the fragmented journey of home building into a single, high-trust platform.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>CORE ECOSYSTEM</Text>

                    {ecosystemItems.map((item) => (
                        <View key={item.id} style={styles.ecoCard}>
                            <View style={styles.ecoIconCircle}>
                                <MaterialCommunityIcons name={item.icon as any} size={22} color="black" />
                            </View>
                            <View style={styles.ecoTextContainer}>
                                <Text style={styles.ecoTitle}>{item.title}</Text>
                                <Text style={styles.ecoSub}>{item.sub}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.quoteCard}>
                    <Text style={styles.quoteText}>
                        “Full-stack mean land to lending — not just design to construction.”
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>OUR MISSION</Text>
                    <Text style={styles.missionTitle}>A roof over every head — specifically, <Text style={styles.strikethrough}>a</Text> <Text style={styles.boldText}>their own</Text> roof.</Text>
                    <View style={styles.hindiBox}>
                        <Text style={styles.hindiText}>“Sabka sar apni chhaat.”</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>OUR VISION</Text>
                    <Text style={styles.missionTitle}>To raise living standards by becoming the global operating system for home building.</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Version 1.1.20</Text>
                    <Text style={styles.footerText}>Made in India 🇮🇳</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    logoBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 20,
    },
    logoText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#545454',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginBottom: 32,
    },
    section: {
        marginBottom: 40,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#AFAFAF',
        letterSpacing: 1,
        marginBottom: 20,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#000',
        marginBottom: 16,
    },
    boldText: {
        fontWeight: '800',
    },
    ecoCard: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    ecoIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    ecoTextContainer: {
        flex: 1,
    },
    ecoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    ecoSub: {
        fontSize: 14,
        color: '#545454',
        marginTop: 2,
    },
    quoteCard: {
        backgroundColor: '#000',
        padding: 32,
        borderRadius: 24,
        marginBottom: 40,
    },
    quoteText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 28,
        fontStyle: 'italic',
    },
    missionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        lineHeight: 32,
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: '#AFAFAF',
    },
    hindiBox: {
        marginTop: 16,
    },
    hindiText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000',
        fontStyle: 'italic',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#AFAFAF',
        fontWeight: '600',
    },
});
