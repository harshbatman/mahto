import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const products = [
    { id: '1', name: 'Ultratech Cement', price: '₹380/bag', stock: '450 bags', category: 'Cement' },
    { id: '2', name: 'TMT Steel Bars 12mm', price: '₹62,000/ton', stock: '12 tons', category: 'Steel' },
    { id: '3', name: 'Standard Red Bricks', price: '₹7/pcs', stock: '15,000 pcs', category: 'Bricks' },
];

export default function ShopOwnerDashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title="MAHTO Shop" subtitle="Inventory & Sales Overview" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Today's Orders</Text>
                        <Text style={styles.metricValue}>14</Text>
                        <Text style={styles.metricTrend}>+12% vs yesterday</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Revenue</Text>
                        <Text style={styles.metricValue}>₹84.5k</Text>
                        <Text style={styles.metricTrend}>Top seller: Cement</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Inventory</Text>
                    <TouchableOpacity style={styles.addBtn}>
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                        <Text style={styles.addText}>Add Product</Text>
                    </TouchableOpacity>
                </View>

                {products.map(item => (
                    <View key={item.id} style={styles.productCard}>
                        <View style={styles.productIcon}><MaterialCommunityIcons name="cube-outline" size={24} color="black" /></View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productStats}>{item.category} • {item.stock}</Text>
                        </View>
                        <View style={styles.productPricing}>
                            <Text style={styles.productPrice}>{item.price}</Text>
                            <TouchableOpacity><MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.light.muted} /></TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>Order #9821</Text>
                        <View style={styles.pendingBadge}><Text style={styles.pendingText}>Processing</Text></View>
                    </View>
                    <Text style={styles.orderCustomer}>for Ramesh Construction</Text>
                    <Text style={styles.orderItems}>50 Bags Cement, 5kg Hardener</Text>
                    <View style={styles.orderFooter}>
                        <Text style={styles.orderTime}>25 mins ago</Text>
                        <Text style={styles.orderTotal}>Total: ₹24,500</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
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
    metricsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    metricCard: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    metricLabel: {
        fontSize: 12,
        color: Colors.light.muted,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    metricValue: {
        fontSize: 22,
        fontWeight: '800',
        marginVertical: 4,
    },
    metricTrend: {
        fontSize: 11,
        color: '#666',
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
    addBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    addText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    seeAll: {
        color: Colors.light.muted,
        fontWeight: '600',
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    productIcon: {
        width: 48,
        height: 48,
        backgroundColor: Colors.light.surface,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
    },
    productStats: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 2,
    },
    productPricing: {
        alignItems: 'flex-end',
        gap: 8,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
    },
    orderCard: {
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '800',
    },
    pendingBadge: {
        backgroundColor: '#FFF4E5',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    pendingText: {
        color: '#B76E00',
        fontSize: 11,
        fontWeight: '700',
    },
    orderCustomer: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderItems: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.light.surface,
    },
    orderTime: {
        fontSize: 12,
        color: Colors.light.muted,
    },
    orderTotal: {
        fontSize: 13,
        fontWeight: '700',
    }
});
