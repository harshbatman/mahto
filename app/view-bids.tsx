import { Spacing } from '@/constants/theme';
import { Bid, getBidsForContract } from '@/services/db/contractService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ViewBidsScreen() {
    const { contractId, title } = useLocalSearchParams<{ contractId: string; title: string }>();
    const router = useRouter();
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (contractId) {
            loadBids();
        }
    }, [contractId]);

    const loadBids = async () => {
        try {
            const data = await getBidsForContract(contractId!);
            setBids(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderBid = ({ item }: { item: Bid }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.contractorInfo}>
                    <View style={styles.avatar}>
                        {item.contractorPhoto ? (
                            <Image source={{ uri: item.contractorPhoto }} style={styles.avatarImage} />
                        ) : (
                            <MaterialCommunityIcons name="account" size={24} color="#666" />
                        )}
                    </View>
                    <View>
                        <Text style={styles.contractorName}>{item.contractorName}</Text>
                        <Text style={styles.bidTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <Text style={styles.bidAmount}>₹{item.amount}</Text>
            </View>

            <View style={styles.proposalBox}>
                <Text style={styles.proposalLabel}>Proposal:</Text>
                <Text style={styles.proposalText}>{item.proposal}</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => { }}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => { }}>
                    <Text style={styles.acceptBtnText}>Accept Bid</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>Bids Received</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{title}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : bids.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="account-search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No bids received yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={bids}
                    renderItem={renderBid}
                    keyExtractor={item => item.id!}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    contractorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    contractorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    bidTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
    bidAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#10b981',
    },
    proposalBox: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    proposalLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    proposalText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    declineBtn: {
        backgroundColor: '#fef2f2',
    },
    acceptBtn: {
        backgroundColor: 'black',
    },
    declineBtnText: {
        color: '#dc2626',
        fontWeight: '700',
        fontSize: 14,
    },
    acceptBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
});
