import { LANGUAGES, LanguageCode } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const { logout, profile } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [showLangModal, setShowLangModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPhone, setConfirmPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const menuItems = [
        { id: 'help', title: t.helpSupport, icon: 'help-circle-outline' },
        { id: 'about', title: t.aboutUs, icon: 'information-outline' },
        { id: 'terms', title: t.termsConditions, icon: 'file-document-outline' },
        { id: 'privacy', title: t.privacyPolicy, icon: 'shield-check-outline' },
    ];

    const handleDeleteAccount = async () => {
        if (!confirmPhone || !confirmPassword) {
            Alert.alert('Error', 'Please enter your phone number and password to confirm.');
            return;
        }

        if (profile?.phoneNumber && !profile.phoneNumber.endsWith(confirmPhone)) {
            Alert.alert('Error', 'Phone number does not match your account.');
            return;
        }

        Alert.alert(
            'Permanent Deletion',
            'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            setTimeout(async () => {
                                await logout();
                                router.replace('/(auth)/welcome');
                                setIsDeleting(false);
                            }, 2000);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account.');
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

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
                        <TouchableOpacity
                            style={styles.menuRow}
                            onPress={() => router.push('/notifications' as any)}
                        >
                            <View style={styles.rowInfo}>
                                <MaterialCommunityIcons name="inbox-outline" size={24} color="black" />
                                <Text style={styles.rowText}>Notification Inbox</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                        </TouchableOpacity>

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
                        {menuItems.map((item) => (
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

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: '#FF3B30' }]}>Danger Zone</Text>
                    <View style={styles.menuBox}>
                        <TouchableOpacity
                            style={styles.menuRow}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <View style={styles.rowInfo}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="#FF3B30" />
                                <Text style={[styles.rowText, { color: '#FF3B30' }]}>Delete Account</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#FF3B30" />
                        </TouchableOpacity>
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
                                    style={[styles.langItem, selectedLang.id === item.id && styles.langItemActive]}
                                    onPress={() => {
                                        setLanguage(item.id as LanguageCode);
                                        setShowLangModal(false);
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.langName, selectedLang.id === item.id && styles.langNameActive]}>{item.name}</Text>
                                        <Text style={styles.langLocal}>{item.local}</Text>
                                    </View>
                                    {selectedLang.id === item.id && <MaterialCommunityIcons name="check-circle" size={24} color="black" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.deleteModalBackdrop}>
                    <View style={styles.deleteModalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Delete Account</Text>
                                <Text style={styles.deleteSubtitle}>Enter details to confirm permanent deletion</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.deleteForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Registered phone number"
                                    keyboardType="phone-pad"
                                    value={confirmPhone}
                                    onChangeText={setConfirmPhone}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Account password"
                                        secureTextEntry={!showPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.deleteConfirmBtn, isDeleting && { opacity: 0.7 }]}
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <ActivityIndicator color="white" /> : <Text style={styles.deleteConfirmText}>Permanently Delete Account</Text>}
                            </TouchableOpacity>
                            <Text style={styles.deleteWarning}>This action cannot be undone. All data will be lost.</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { paddingHorizontal: 20 },
    section: { marginTop: 24 },
    sectionLabel: { fontSize: 12, fontWeight: '800', color: '#AFAFAF', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
    menuBox: { backgroundColor: '#FFF' },
    menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F3F3' },
    rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowText: { fontSize: 16, fontWeight: '700' },
    rowValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    valueText: { fontSize: 14, color: '#545454', fontWeight: '600' },
    footer: { alignItems: 'center', marginTop: 60, paddingBottom: 40 },
    appTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
    versionText: { fontSize: 12, color: '#AFAFAF', fontWeight: '700', marginTop: 4 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800' },
    langItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
    langItemActive: { backgroundColor: '#F3F3F3' },
    langName: { fontSize: 16, fontWeight: '700', color: '#545454' },
    langNameActive: { color: '#000' },
    langLocal: { fontSize: 14, color: '#AFAFAF', marginTop: 2 },
    deleteModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    deleteModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
    deleteSubtitle: { fontSize: 14, color: '#545454', marginTop: 4 },
    deleteForm: { marginTop: 24, gap: 20 },
    inputGroup: { gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: '700' },
    textInput: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
    passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' },
    passwordInput: { flex: 1, padding: 16, fontSize: 16 },
    eyeBtn: { padding: 16 },
    deleteConfirmBtn: { backgroundColor: '#FF3B30', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
    deleteConfirmText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    deleteWarning: { fontSize: 12, color: '#AFAFAF', textAlign: 'center', marginTop: 8 },
});
