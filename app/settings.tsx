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

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t.preferences}</Text>
                    <View style={styles.menuBox}>
                        <View style={styles.menuRow}>
                            <View style={styles.rowInfo}>
                                <MaterialCommunityIcons name="bell-outline" size={24} color="black" />
                                <Text style={styles.rowText}>{t.pushNotifications}</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#EEE', true: '#000' }}
                                thumbColor={notifications ? '#FFF' : '#FFF'}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.menuRow}
                            onPress={() => setShowLangModal(true)}
                        >
                            <View style={styles.rowInfo}>
                                <MaterialCommunityIcons name="translate" size={24} color="black" />
                                <Text style={styles.rowText}>{t.selectLanguage}</Text>
                            </View>
                            <View style={styles.rowValue}>
                                <Text style={styles.valueText}>{selectedLang.local}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support & Legal</Text>
                    <View style={styles.menuBox}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuRow}
                                onPress={() => {
                                    if (item.id === 'help') router.push('/help-support' as any);
                                    if (item.id === 'privacy') router.push('/privacy-policy' as any);
                                    if (item.id === 'terms') router.push('/terms-conditions' as any);
                                    if (item.id === 'about') router.push('/about-us' as any);
                                }}
                            >
                                <View style={styles.rowInfo}>
                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="black" />
                                    <Text style={styles.rowText}>{item.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.appTitle}>MAHTO</Text>
                    <Text style={styles.versionText}>Version 1.1.20</Text>
                </View>
            </ScrollView>

            <Modal
                visible={showLangModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLangModal(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setShowLangModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.langItem,
                                        selectedLang.id === item.id && styles.langItemActive
                                    ]}
                                    onPress={() => {
                                        setLanguage(item.id as LanguageCode);
                                        setShowLangModal(false);
                                    }}
                                >
                                    <View>
                                        <Text style={[
                                            styles.langName,
                                            selectedLang.id === item.id && styles.langNameActive
                                        ]}>{item.name}</Text>
                                        <Text style={styles.langLocal}>{item.local}</Text>
                                    </View>
                                    {selectedLang.id === item.id && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="black" />
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
    },
    section: {
        marginTop: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#AFAFAF',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    menuBox: {
        backgroundColor: '#FFF',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    rowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    rowValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    valueText: {
        fontSize: 14,
        color: '#545454',
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 60,
        paddingBottom: 40,
    },
    appTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
    },
    versionText: {
        fontSize: 12,
        color: '#AFAFAF',
        fontWeight: '700',
        marginTop: 4,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    langItemActive: {
        backgroundColor: '#F3F3F3',
    },
    langName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#545454',
    },
    langNameActive: {
        color: '#000',
    },
    langLocal: {
        fontSize: 14,
        color: '#AFAFAF',
        marginTop: 2,
    }
});
