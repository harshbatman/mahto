import DashboardHeader from '@/components/DashboardHeader';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ShopDashboard() {
    const { profile } = useAuth();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader
                title={profile?.shopName || "My Shop"}
                subtitle={profile?.shopCategories?.join(', ')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Shop Banner */}
                {profile?.shopBanner && (
                    <Image source={{ uri: profile.shopBanner }} style={styles.banner} />
                )}

                <View style={styles.content}>
                    <View style={styles.shopBrief}>
                        <View style={styles.logoContainer}>
                            {profile?.shopLogo ? (
                                <Image source={{ uri: profile.shopLogo }} style={styles.logo} />
                            ) : (
                                <MaterialCommunityIcons name="storefront" size={40} color="#666" />
                            )}
                        </View>
                        <View style={styles.briefInfo}>
                            <Text style={styles.shopName}>{profile?.shopName}</Text>
                            <Text style={styles.ownerName}>Owner: {profile?.shopOwnerName}</Text>
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{profile?.yearsInBusiness || 0}</Text>
                            <Text style={styles.statLab}>Years</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{profile?.averageRating || 0}</Text>
                            <Text style={styles.statLab}>Rating</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons
                                name={profile?.isHomeDeliveryAvailable ? "truck-check" : "truck-remove"}
                                size={20}
                                color={profile?.isHomeDeliveryAvailable ? "#10b981" : "#ef4444"}
                            />
                            <Text style={styles.statLab}>Delivery</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Shop Information</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>{profile?.openingTime} - {profile?.closingTime}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>{profile?.address}</Text>
                            </View>
                            {profile?.gstNumber && (
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="file-document-outline" size={20} color="#666" />
                                    <Text style={styles.infoText}>GST: {profile.gstNumber}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push('/edit-shop' as any)}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color="white" />
                        <Text style={styles.editBtnText}>Edit Shop details</Text>
                    </TouchableOpacity>
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
    scrollContent: {
        paddingBottom: 40,
    },
    banner: {
        width: '100%',
        height: 200,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: Spacing.lg,
    },
    shopBrief: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -40,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f9fafb',
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    briefInfo: {
        marginLeft: 16,
        flex: 1,
    },
    shopName: {
        fontSize: 20,
        fontWeight: '900',
    },
    ownerName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statVal: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLab: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    infoSection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderRadius: 20,
        padding: 16,
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    editBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 10,
        marginTop: 40,
    },
    editBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    }
});
