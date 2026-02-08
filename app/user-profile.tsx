import { Colors, Spacing } from '@/constants/theme';
import { getUserProfile } from '@/services/db/userProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // In a real app, we might fetch the latest data here using the ID
    // For now, we'll use the passed params for instant feedback
    const { name, role, category, rating, distance, phoneNumber, location, skills: skillsStr, experienceYears, about, dailyRate, isAvailable } = params;
    const isActuallyAvailable = isAvailable === 'true';
    const skills = skillsStr ? JSON.parse(skillsStr as string) : [];


    const [displayPhoto, setDisplayPhoto] = useState<string | undefined>(undefined);

    useEffect(() => {
        // 1. Initial set from params (for immediate feedback)
        const initialPhoto = Array.isArray(params.photoURL) ? params.photoURL[0] : params.photoURL;
        if (initialPhoto && initialPhoto !== 'null' && initialPhoto !== 'undefined' && initialPhoto !== '') {
            setDisplayPhoto(initialPhoto);
        }

        // 2. Fetch fresh data from Firestore to ensure valid URL
        const fetchLatestProfile = async () => {
            const uid = Array.isArray(params.id) ? params.id[0] : params.id;
            if (uid) {
                try {
                    const userProfile = await getUserProfile(uid);
                    if (userProfile && userProfile.photoURL) {
                        console.log('UserProfile - Fetched fresh photoURL:', userProfile.photoURL);
                        setDisplayPhoto(userProfile.photoURL);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        fetchLatestProfile();
    }, [params.id, params.photoURL]);

    const handleCall = () => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileHero}>
                    <TouchableOpacity
                        style={[styles.avatarContainer, { backgroundColor: '#e5e7eb' }]}
                        onPress={() => {
                            console.log('Avatar clicked, displayPhoto:', displayPhoto);
                            if (displayPhoto) setModalVisible(true);
                        }}
                        activeOpacity={displayPhoto ? 0.8 : 1}
                    >
                        {displayPhoto ? (
                            <Image
                                source={{ uri: displayPhoto }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                                onError={(e) => console.log('Profile Image Error:', e.nativeEvent.error)}
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name={role === 'shop' ? "store" : "account"}
                                size={60}
                                color="#9ca3af"
                            />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.userName}>{name}</Text>
                    <Text style={styles.userRole}>{category || role}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{rating || '4.5'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{distance || 'Nearby'}</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        {dailyRate && parseInt(dailyRate as string) > 0 && (
                            <>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#10b981' }]}>₹{dailyRate}</Text>
                                    <Text style={styles.statLabel}>Per Day</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {role === 'worker' && (
                        <View style={[
                            styles.availabilityBadge,
                            { backgroundColor: isActuallyAvailable ? '#f0fdf4' : '#fef2f2' }
                        ]}>
                            <View style={[
                                styles.availabilityDot,
                                { backgroundColor: isActuallyAvailable ? '#22c55e' : '#ef4444' }
                            ]} />
                            <Text style={[
                                styles.availabilityText,
                                { color: isActuallyAvailable ? '#166534' : '#991b1b' }
                            ]}>
                                {isActuallyAvailable ? 'Available for work' : 'Currently Unavailable'}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="phone" size={20} color={Colors.light.muted} />
                                <Text style={styles.infoText}>{phoneNumber || '+91 8595399583'}</Text>
                            </View>
                            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 12, paddingTop: 12 }]}>
                                <MaterialCommunityIcons name="map-marker" size={20} color={Colors.light.muted} />
                                <Text style={styles.infoText}>{location || 'New Delhi, India'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.aboutText}>
                            {about || `Professional ${category || role} with over ${experienceYears || '5'} years of experience in the construction industry. Verified member of the MAHTO platform.`}
                        </Text>
                    </View>

                    {skills.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            <View style={styles.skillsContainer}>
                                {skills.map((skill: string) => (
                                    <View key={skill} style={styles.skillBadge}>
                                        <Text style={styles.skillBadgeText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleCall}>
                        <MaterialCommunityIcons name="phone" size={20} color="white" />
                        <Text style={styles.primaryBtnText}>Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn}>
                        <MaterialCommunityIcons name="message-text" size={20} color="black" />
                        <Text style={styles.secondaryBtnText}>Send Message</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={30} color="white" />
                    </TouchableOpacity>
                    {displayPhoto && (
                        <Image
                            source={{ uri: displayPhoto }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    profileHero: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: 'black',
    },
    userRole: {
        fontSize: 16,
        color: Colors.light.muted,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 24,
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.muted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#ddd',
    },
    content: {
        padding: Spacing.lg,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 15,
        fontWeight: '500',
    },
    aboutText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    skillBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    primaryBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginBottom: 12,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 40,
    },
    secondaryBtnText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '700',

    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginTop: 16,
        gap: 6,
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    availabilityText: {
        fontSize: 13,
        fontWeight: '700',
    }
});
