import { SHOP_CATEGORIES } from '@/constants/shopCategories';
import { Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SelectShopCategoryScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleContinue = () => {
        if (selectedCategory) {
            router.push({
                pathname: '/setup-shop-profile',
                params: { category: selectedCategory }
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedCategory === item.name;
        return (
            <TouchableOpacity
                style={[styles.categoryCard, isSelected && styles.selectedCard]}
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.7}
            >
                <Image source={item.image} style={styles.categoryImage} resizeMode="cover" />
                <View style={[styles.overlay, isSelected && styles.selectedOverlay]}>
                    <Text style={[styles.categoryName, isSelected && styles.selectedText]}>{item.name}</Text>
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>What does your shop sell?</Text>
                <Text style={styles.subtitle}>Select the primary category of products you offer.</Text>
            </View>

            <FlatList
                data={SHOP_CATEGORIES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueBtn, !selectedCategory && styles.disabledBtn]}
                    onPress={handleContinue}
                    disabled={!selectedCategory}
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
        paddingTop: 10,
    },
    backBtn: {
        marginBottom: 20,
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
    categoryCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        position: 'relative',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedCard: {
        borderWidth: 3,
        borderColor: 'black',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    selectedOverlay: {
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    categoryName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '800',
    },
    selectedText: {
        color: 'black',
    },
    checkIcon: {
        position: 'absolute',
        top: -120,
        right: 8,
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
        alignItems: 'center',
    },
    continueBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        width: '100%',
        borderRadius: 16,
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.5,
        backgroundColor: '#ccc',
    },
    continueBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
