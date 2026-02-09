import { Spacing } from '@/constants/theme';
import { LANGUAGES, LanguageCode } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Modal,
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
    const { language, setLanguage, t } = useLanguage();
    const [notifications, setNotifications] = useState(true);
    const [showLangModal, setShowLangModal] = useState(false);

    const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const menuItems = [
        { id: 'help', title: t.helpSupport, icon: 'help-circle-outline' },
        { id: 'about', title: t.aboutUs, icon: 'information-outline' },
        { id: 'terms', title: t.termsConditions, icon: 'file-document-outline' },
        { id: 'privacy', title: t.privacyPolicy, icon: 'shield-check-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.settings}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.preferences}</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <MaterialCommunityIcons name="bell-outline" size={22} color="black" />
                                <Text style={styles.rowLabel}>{t.pushNotifications}</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#ddd', true: '#10b981' }}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.row, { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}
                            onPress={() => setShowLangModal(true)}
                        >
                            <View style={styles.rowLeft}>
                                <MaterialCommunityIcons name="translate" size={22} color="black" />
                                <Text style={styles.rowLabel}>{t.selectLanguage}</Text>
                            </View>
                            <View style={styles.rowRight}>
                                <Text style={styles.rowValue}>{selectedLang.local}</Text>
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
                                onPress={() => {
                                    if (item.id === 'help') router.push('/help-support' as any);
                                    if (item.id === 'privacy') router.push('/privacy-policy' as any);
                                    if (item.id === 'terms') router.push('/terms-conditions' as any);
                                    if (item.id === 'about') router.push('/about-us' as any);
                                }}
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

            <Modal
                visible={showLangModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLangModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Language</Text>
                            <TouchableOpacity onPress={() => setShowLangModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.langItem,
                                        selectedLang.id === item.id && styles.selectedLangItem
                                    ]}
                                    onPress={() => {
                                        setLanguage(item.id as LanguageCode);
                                        setShowLangModal(false);
                                    }}
                                >
                                    <View>
                                        <Text style={[
                                            styles.langName,
                                            selectedLang.id === item.id && styles.selectedLangText
                                        ]}>{item.name}</Text>
                                        <Text style={styles.langLocal}>{item.local}</Text>
                                    </View>
                                    {selectedLang.id === item.id && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 4,
    },
    selectedLangItem: {
        backgroundColor: '#f0fdf4',
    },
    langName: {
        fontSize: 16,
        fontWeight: '700',
    },
    selectedLangText: {
        color: '#10b981',
    },
    langLocal: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    }
});
