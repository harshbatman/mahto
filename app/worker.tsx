import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WorkerDashboard() {
    const router = useRouter();
    const { profile } = useAuth();

    const heartScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(heartScale, {
                    toValue: 1.3,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title={profile?.name || "Worker"} showSearch={false} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Welcome back,</Text>
                    <Text style={styles.heroName}>{profile?.name || 'Worker'}! 👋</Text>
                    <Text style={styles.heroSub}>Find your next big project or daily work here.</Text>
                </View>

                <View style={styles.networkingSection}>
                    <Text style={styles.sectionTitle}>Explore MAHTO</Text>
                    <View style={styles.networkingGrid}>
                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#ecfdf5' }]}
                            onPress={() => router.push('/browse-jobs')}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#d1fae5' }]}>
                                <MaterialCommunityIcons name="briefcase-search" size={24} color="#059669" />
                            </View>
                            <Text style={styles.networkLabel}>Find Jobs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#f5f3ff' }]}
                            onPress={() => router.push({
                                pathname: '/search-results',
                                params: { role: 'worker', title: 'Workers' }
                            })}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#ddd6fe' }]}>
                                <MaterialCommunityIcons name="account-group" size={24} color="#6d28d9" />
                            </View>
                            <Text style={styles.networkLabel}>Find Workers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#fdf2f8' }]}
                            onPress={() => router.push({
                                pathname: '/search-results',
                                params: { role: 'contractor', title: 'Contractors' }
                            })}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#fbcfe8' }]}>
                                <MaterialCommunityIcons name="briefcase-check" size={24} color="#db2777" />
                            </View>
                            <Text style={styles.networkLabel}>Contractors</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Made in India </Text>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    <Text style={styles.footerText}>🇮🇳</Text>
                </Animated.View>
                <Text style={styles.footerText}> with </Text>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    <MaterialCommunityIcons name="heart" size={18} color="#ff0000" />
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    heroSection: {
        marginBottom: 32,
        marginTop: 8,
    },
    heroGreeting: {
        fontSize: 16,
        color: Colors.light.muted,
        fontWeight: '600',
    },
    heroName: {
        fontSize: 32,
        fontWeight: '900',
        color: 'black',
        marginVertical: 4,
    },
    heroSub: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    networkingSection: {
        marginTop: 24,
        paddingBottom: 40,
    },
    networkingGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    networkCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
    },
    networkIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1f2937',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 20,
        opacity: 1,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    }
});
