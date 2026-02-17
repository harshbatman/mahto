import { LANGUAGES, LanguageCode } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const roles = [
    // ... (roles array remains the same)
];

const { width } = Dimensions.get('window');

export default function SelectRoleScreen() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [showLangModal, setShowLangModal] = useState(false);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!loading && user && profile) {
            router.replace(`/${profile.role}` as any);
        }
    }, [user, profile, loading]);

    const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const roles = [
        {
            id: 'homeowner',
            title: t.profile === 'प्रोफ़ाइल' ? 'होमओनर' : 'Homeowner',
            subtitle: t.home === 'होम' ? 'मैं अपना घर बनाना या मरम्मत करना चाहता हूं' : 'I want to build or renovate my home',
            image: require('@/assets/images/role_homeowner.png'),
        },
        {
            id: 'worker',
            title: t.workers,
            subtitle: t.home === 'होम' ? 'मैं दिहाड़ी काम की तलाश में हूं' : 'I am looking for daily wage work',
            image: require('@/assets/images/role_worker.png'),
        },
        {
            id: 'contractor',
            title: t.contractors,
            subtitle: t.home === 'होम' ? 'कामगार खोजें और ठेका प्राप्त करें' : 'Find Workers and Win Contracts',
            image: require('@/assets/images/role_contractor.png'),
        },
        {
            id: 'shop',
            title: t.materials === 'सामग्री' ? 'दुकानदार' : 'Shop Owner',
            subtitle: t.home === 'होम' ? 'मै निर्माण सामग्री बेचता हूं' : 'I sell construction materials',
            image: require('@/assets/images/3d_materials.png'),
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
            <View style={[styles.topActions, { justifyContent: 'flex-end' }]}>

                <TouchableOpacity
                    style={styles.langBtn}
                    onPress={() => setShowLangModal(true)}
                >
                    <MaterialCommunityIcons name="translate" size={20} color="#000" />
                    <Text style={styles.langBtnText}>{selectedLang.local}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose how you want to use MAHTO</Text>
                </View>

                <View style={styles.grid}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.card}
                            onPress={() => handleSelect(role.id)}
                        >
                            <View style={styles.iconBox}>
                                <Image source={role.image} style={styles.roleImage} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{role.title}</Text>
                                <Text style={styles.cardSub}>{role.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.loginLink}>
                    <Text style={styles.loginText}>
                        {t.home === 'होम' ? 'पहले से ही एक खाता है?' : 'Already have an account?'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.mahtoIdButton}
                    onPress={() => router.push('/(auth)/phone-login')}
                >
                    <Text style={styles.mahtoIdButtonText}>Continue with MAHTO ID</Text>
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
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#000" />
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
    topActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        lineHeight: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 56) / 2, // 20 padding each side + 16 gap
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardInfo: {
        alignItems: 'center',
        marginTop: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        textAlign: 'center',
    },
    cardSub: {
        fontSize: 12,
        color: '#717171',
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 16,
    },
    iconBox: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -10, // Pull character closer to text
    },
    roleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    loginLink: {
        marginTop: 40,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#545454',
        fontWeight: '500',
    },
    mahtoIdButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    mahtoIdButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    langBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '60%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    selectedLangItem: {
    },
    langName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    selectedLangText: {
    },
    langLocal: {
        fontSize: 14,
        color: '#545454',
        marginTop: 2,
    },
});
