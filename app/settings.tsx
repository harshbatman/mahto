import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);

    const menuItems = [
        { id: 'about', title: 'About Us', icon: 'information-outline' },
        { id: 'terms', title: 'Terms & Conditions', icon: 'file-document-outline' },
        { id: 'privacy', title: 'Privacy Policy', icon: 'shield-check-outline' },
    ];

    const handleLanguageChange = () => {
        Alert.alert('Language', 'Language selection will be available in the next update.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <MaterialCommunityIcons name="bell-outline" size={22} color="black" />
                                <Text style={styles.rowLabel}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#ddd', true: '#10b981' }}
                            />
                        </View>
                        <TouchableOpacity style={[styles.row, { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]} onPress={handleLanguageChange}>
                            <View style={styles.rowLeft}>
                                <MaterialCommunityIcons name="translate" size={22} color="black" />
                                <Text style={styles.rowLabel}>Language</Text>
                            </View>
                            <View style={styles.rowRight}>
                                <Text style={styles.rowValue}>English</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Support & Legal</Text>
                    <View style={styles.card}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.row,
                                    index > 0 && { borderTopWidth: 1, borderTopColor: '#f0f0f0' }
                                ]}
                            >
                                <View style={styles.rowLeft}>
                                    <MaterialCommunityIcons name={item.icon as any} size={22} color="black" />
                                    <Text style={styles.rowLabel}>{item.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.versionText}>MAHTO App v1.0.0</Text>
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
        fontWeight: '700',
    },
    content: {
        padding: Spacing.lg,
    },
    section: {
        marginBottom: 16,
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
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rowValue: {
        fontSize: 14,
        color: '#666',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
    }
});
