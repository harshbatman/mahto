import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { applyForContract, Contract, getAvailableContracts } from '@/services/db/contractService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ContractorDashboard() {
    const { profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchContracts = async () => {
        try {
            const data = await getAvailableContracts();
            setContracts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchContracts();
    };

    const handleApply = async (id: string, title: string) => {
        try {
            await applyForContract(id);
            Alert.alert('Application Sent', `You have successfully applied for: ${title}`);
            fetchContracts(); // Refresh to update count
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

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
            <DashboardHeader title={profile?.companyName || profile?.name || "Contractor"} showSearch={false} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={styles.actionIcon}><MaterialCommunityIcons name="plus-box" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Post Job</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#333' }]}><MaterialCommunityIcons name="file-document-plus" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>My Bids</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>New Contracts</Text>
                    <TouchableOpacity onPress={onRefresh}><Text style={styles.seeAll}>Refresh</Text></TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color="black" style={{ marginTop: 20 }} />
                ) : contracts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.light.border} />
                        <Text style={styles.emptyText}>No new contracts available</Text>
                    </View>
                ) : (
                    contracts.map((item) => (
                        <View key={item.id} style={styles.contractListCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.categoryBadge}>{item.category}</Text>
                                <Text style={styles.applicantText}>{item.applicantCount} Applicants</Text>
                            </View>
                            <Text style={styles.contractTitle}>{item.title}</Text>
                            <Text style={styles.contractBudget}>₹{item.budget}</Text>
                            <Text style={styles.contractLocation}>
                                <MaterialCommunityIcons name="map-marker" size={12} color={Colors.light.muted} /> {item.location}
                            </Text>
                            <Text style={styles.contractDescription} numberOfLines={2}>{item.description}</Text>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => handleApply(item.id!, item.title)}
                            >
                                <Text style={styles.applyBtnText}>Apply Now</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

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
        paddingBottom: 40,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'black',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionLabel: {
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: '#6366f1',
        fontWeight: '700',
    },
    contractListCard: {
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 20,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        fontSize: 11,
        fontWeight: '700',
        color: '#374151',
    },
    applicantText: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '600',
    },
    contractTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
    },
    contractBudget: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
        marginVertical: 4,
    },
    contractLocation: {
        fontSize: 13,
        color: Colors.light.muted,
        marginBottom: 8,
    },
    contractDescription: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    applyBtn: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
    },
    emptyText: {
        color: Colors.light.muted,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 80,
        opacity: 1,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    }
});
