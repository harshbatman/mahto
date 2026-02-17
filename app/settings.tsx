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

        // Basic validation for matching phone number if profile exists
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
                            // In a real app, you would call a backend service here
                            // For now, we simulate the process and log out
                            setTimeout(async () => {
                                await logout();
                                router.replace('/(auth)/welcome');
                                setIsDeleting(false);
                            }, 2000);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
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
                        <View style={styles.menuRow}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
                                onPress={() => router.push('/notifications' as any)}
                            >
                                <View style={styles.rowInfo}>
                                    <MaterialCommunityIcons name="inbox-outline" size={24} color="black" />
                                    <Text style={styles.rowText}>Notification Inbox</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                            </TouchableOpacity>
                        </View>
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

            {/* Language Modal */}
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

            {/* Account Deletion Modal */}
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
                                <Text style={styles.deleteSubtitle}>To confirm, please enter your details</Text>
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
                                    placeholder="Enter your registered phone no"
                                    keyboardType="phone-pad"
                                    value={confirmPhone}
                                    onChangeText={setConfirmPhone}
                                    placeholderTextColor="#AFAFAF"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordInputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        secureTextEntry={!showPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholderTextColor="#AFAFAF"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        <MaterialCommunityIcons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color="#AFAFAF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.deleteConfirmBtn, isDeleting && styles.disabledBtn]}
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.deleteConfirmText}>Delete Permanently</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.deleteWarning}>
                                Note: This will permanently remove all your data, postings, and history from MAHTO.
                            </Text>
                        </View>
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
    },
    deleteModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    deleteModalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    deleteSubtitle: {
        fontSize: 14,
        color: '#545454',
        marginTop: 4,
        fontWeight: '500',
    },
    deleteForm: {
        marginTop: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    textInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    eyeBtn: {
        padding: 16,
    },
    deleteConfirmBtn: {
        backgroundColor: '#FF3B30',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteConfirmText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    deleteWarning: {
        fontSize: 12,
        color: '#AFAFAF',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '600',
        marginTop: 8,
    }
});
