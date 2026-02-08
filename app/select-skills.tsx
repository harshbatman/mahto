import { SKILLS_DATA } from '@/constants/skills';
import { Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SelectSkillsScreen() {
    const router = useRouter();
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [moreSkills, setMoreSkills] = useState(false);

    const toggleSkill = (skillName: string) => {
        if (selectedSkills.includes(skillName)) {
            setSelectedSkills(prev => prev.filter(s => s !== skillName));
        } else {
            setSelectedSkills(prev => [...prev, skillName]);
        }
    };

    const handleContinue = () => {
        router.push({
            pathname: '/setup-worker-profile',
            params: { skills: JSON.stringify(selectedSkills) }
        });
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedSkills.includes(item.name);
        return (
            <TouchableOpacity
                style={[styles.skillCard, isSelected && styles.selectedCard]}
                onPress={() => toggleSkill(item.name)}
                activeOpacity={0.7}
            >
                <Image source={item.image} style={styles.skillImage} resizeMode="cover" />
                <View style={[styles.overlay, isSelected && styles.selectedOverlay]}>
                    <Text style={[styles.skillName, isSelected && styles.selectedText]}>{item.name}</Text>
                    {isSelected && (
                        <View style={styles.checkIcon}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>What are your skills?</Text>
                <Text style={styles.subtitle}>Select all the tasks you can perform proficiently.</Text>
            </View>

            <FlatList
                data={SKILLS_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <Text style={styles.selectedCount}>{selectedSkills.length} skills selected</Text>
                <TouchableOpacity
                    style={[styles.continueBtn, selectedSkills.length === 0 && styles.disabledBtn]}
                    onPress={handleContinue}
                    disabled={selectedSkills.length === 0}
                >
                    <Text style={styles.continueBtnText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        padding: Spacing.lg,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.muted,
        lineHeight: 24,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    skillCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        position: 'relative',
        elevation: 2,
    },
    selectedCard: {
        borderWidth: 3,
        borderColor: 'black',
    },
    skillImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    selectedOverlay: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    skillName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    selectedText: {
        color: 'black',
    },
    checkIcon: {
        position: 'absolute',
        top: -120, // Approximate top right position relative to bottom overlay
        right: 8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedCount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    continueBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.5,
        backgroundColor: '#ccc',
    },
    continueBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
