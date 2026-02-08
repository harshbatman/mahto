import { Spacing } from '@/constants/theme';
import { LANGUAGES, LanguageCode } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const roles = [
    {
        id: 'homeowner',
        title: 'Homeowner',
        subtitle: 'I want to build or renovate my home',
        icon: 'home-account',
        color: '#6366f1'
    },
    {
        id: 'worker',
        title: 'Worker / Labour',
        subtitle: 'I am looking for daily wage work',
        icon: 'account-hard-hat',
        color: '#a855f7'
    },
    {
        id: 'contractor',
        title: 'Contractor',
        subtitle: 'Find Workers and Win Contracts',
        icon: 'briefcase-account',
        color: '#ec4899'
    },
    {
        id: 'shop',
        title: 'Shop Owner',
        subtitle: 'I sell construction materials',
        icon: 'storefront',
        color: '#f59e0b'
    }
];

export default function SelectRoleScreen() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const [showLangModal, setShowLangModal] = useState(false);

    const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const roles = [
        {
            id: 'homeowner',
            title: t.profile === 'प्रोफ़ाइल' ? 'होमओनर' : 'Homeowner', // Fallback or add to translations
            subtitle: t.home === 'होम' ? 'मैं अपना घर बनाना या मरम्मत करना चाहता हूं' : 'I want to build or renovate my home',
            icon: 'home-account',
            color: '#6366f1'
        },
        {
            id: 'worker',
            title: t.workers,
            subtitle: t.home === 'होम' ? 'मैं दिहाड़ी काम की तलाश में हूं' : 'I am looking for daily wage work',
            icon: 'account-hard-hat',
            color: '#a855f7'
        },
        {
            id: 'contractor',
            title: t.contractors,
            subtitle: t.home === 'होम' ? 'कामगार खोजें और ठेका प्राप्त करें' : 'Find Workers and Win Contracts',
            icon: 'briefcase-account',
            color: '#ec4899'
        },
        {
            id: 'shop',
            title: t.materials === 'सामग्री' ? 'दुकानदार' : 'Shop Owner',
            subtitle: t.home === 'होम' ? 'मै निर्माण सामग्री बेचता हूं' : 'I sell construction materials',
            icon: 'storefront',
            color: '#f59e0b'
        }
    ];

    const handleSelect = (roleId: string) => {
        router.push({
            pathname: '/(auth)/register',
            params: { role: roleId }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topActions}>
                <TouchableOpacity
                    style={styles.langBtn}
                    onPress={() => setShowLangModal(true)}
                >
                    <MaterialCommunityIcons name="translate" size={20} color="#666" />
                    <Text style={styles.langBtnText}>{selectedLang.local}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t.welcome} to MAHTO</Text>
                    <Text style={styles.subtitle}>{t.home === 'होम' ? 'आप ऐप का उपयोग कैसे करना चाहेंगे?' : 'How would you like to use the app?'}</Text>
                </View>

                <View style={styles.grid}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.card}
                            onPress={() => handleSelect(role.id)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: role.color + '15' }]}>
                                <MaterialCommunityIcons name={role.icon as any} size={32} color={role.color} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{role.title}</Text>
                                <Text style={styles.cardSub}>{role.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.push('/(auth)/phone-login')}
                >
                    <Text style={styles.loginText}>
                        {t.home === 'होम' ? 'पहले से ही एक खाता है?' : 'Already have an account?'} <Text style={styles.loginBold}>{t.home === 'होम' ? 'लॉगिन' : 'Login'}</Text>
                    </Text>
                </TouchableOpacity>
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
                            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
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
        backgroundColor: '#fff',
    },
    content: {
        padding: Spacing.lg,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        fontWeight: '500',
    },
    grid: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    cardSub: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    loginLink: {
        marginTop: 40,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 15,
        color: '#666',
    },
    loginBold: {
        color: '#000',
        fontWeight: '800',
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: Spacing.lg,
        paddingTop: 20,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    langBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '70%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    selectedLangItem: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    langName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    selectedLangText: {
        color: '#10b981',
    },
    langLocal: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
});
