import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Contract, getAvailableContracts, getBiddedContractIds, placeBid } from '@/services/db/contractService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BrowseContractsScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [biddedContractIds, setBiddedContractIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Bid Modal State
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [bidModalVisible, setBidModalVisible] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [proposal, setProposal] = useState('');
    const [bidding, setBidding] = useState(false);

    const fetchContracts = async () => {
        try {
            const data = await getAvailableContracts();
            setContracts(data);

            if (profile?.uid) {
                const biddedIds = await getBiddedContractIds(profile.uid);
                setBiddedContractIds(biddedIds);
            }
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

    const openBidModal = (contract: Contract) => {
        setSelectedContract(contract);
        setBidAmount('');
        setProposal('');
        setBidModalVisible(true);
    };

    const submitBid = async () => {
        if (!bidAmount || !proposal || !selectedContract) {
            Alert.alert('Incomplete', 'Please enter your bid amount and a short proposal.');
            return;
        }

        setBidding(true);
        try {
            await placeBid({
                contractId: selectedContract.id!,
                contractorId: profile?.uid!,
                contractorName: profile?.companyName || profile?.name || 'Contractor',
                contractorPhoto: profile?.companyLogo || profile?.photoURL,
                amount: bidAmount,
                proposal
            });
            Alert.alert('Success', 'Your bid has been placed!');
            setBidModalVisible(false);
            if (selectedContract.id) {
                setBiddedContractIds([...biddedContractIds, selectedContract.id]);
            }
            fetchContracts(); // Refresh to update applicant count
        } catch (error: any) {
            Alert.alert('Error', sanitizeError(error));
        } finally {
            setBidding(false);
        }
    };

    const renderContract = ({ item }: { item: Contract }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.budget}>₹{item.budget}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
                <Text style={styles.locationText}>{item.location}</Text>
            </View>

            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

            <View style={styles.footer}>
                <Text style={styles.applicants}>
                    <MaterialCommunityIcons name="account-group-outline" size={16} color="#6366f1" /> {item.applicantCount} Bids
                </Text>
                {biddedContractIds.includes(item.id!) ? (
                    <View style={styles.appliedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={16} color="#059669" />
                        <Text style={styles.appliedBadgeText}>Already Bidded</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.bidBtn} onPress={() => openBidModal(item)}>
                        <Text style={styles.bidBtnText}>Place Bid</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Contracts</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={contracts}
                    renderItem={renderContract}
                    keyExtractor={item => item.id!}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No available contracts found.</Text>
                        </View>
                    }
                />
            )}

            {/* Bid Modal */}
            <Modal visible={bidModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Place Your Bid</Text>
                            <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>for "{selectedContract?.title}"</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bid Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 50000"
                                keyboardType="numeric"
                                value={bidAmount}
                                onChangeText={setBidAmount}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Proposal / Details</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe why you are perfect for this job..."
                                multiline
                                numberOfLines={4}
                                value={proposal}
                                onChangeText={setProposal}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={submitBid}
                            disabled={bidding}
                        >
                            {bidding ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Proposal</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    budget: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 13,
        color: '#6b7280',
    },
    description: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    applicants: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6366f1',
    },
    bidBtn: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    bidBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    appliedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    appliedBadgeText: {
        color: '#059669',
        fontSize: 13,
        fontWeight: '700',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#6366f1',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
