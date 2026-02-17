import { SKILLS_DATA } from '@/constants/skills';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { postJob } from '@/services/db/jobService';
import { mapErrorToProfessionalMessage } from '@/utils/error-mapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SelectedWorker {
    skillId: string;
    skillName: string;
    count: number;
}

export default function PostJobScreen() {
    const { profile } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showToast({ message: 'We need your permission to access your location so we can help you set the job address.', type: 'info' });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address) {
                const formattedLocation = [
                    address.street,
                    address.subregion || address.district,
                    address.city,
                ].filter(Boolean).join(', ');
                setForm({ ...form, location: formattedLocation });
            }
        } catch (error) {
            console.error(error);
            showToast({ message: "We're having trouble retrieving your current location. Please try entering it manually.", type: 'warning' });
        } finally {
            setLocationLoading(false);
        }
    };

    const [form, setForm] = useState({
        title: '',
        paymentType: 'Daily' as 'Daily' | 'Monthly',
        wage: '',
        description: '',
        location: profile?.address || '',
        toolsProvided: false,
        foodProvided: false,
        stayProvided: false,
    });

    const [selectedWorkers, setSelectedWorkers] = useState<SelectedWorker[]>([]);

    const toggleSkill = (skill: typeof SKILLS_DATA[0]) => {
        const exists = selectedWorkers.find(sw => sw.skillId === skill.id);
        if (exists) {
            setSelectedWorkers(selectedWorkers.filter(sw => sw.skillId !== skill.id));
        } else {
            setSelectedWorkers([...selectedWorkers, { skillId: skill.id, skillName: skill.name, count: 1 }]);
        }
    };

    const updateWorkerCount = (skillId: string, delta: number) => {
        setSelectedWorkers(selectedWorkers.map(sw => {
            if (sw.skillId === skillId) {
                const newCount = Math.max(1, sw.count + delta);
                return { ...sw, count: newCount };
            }
            return sw;
        }));
    };

    const handlePost = async () => {
        if (!form.title || !form.wage || !form.description || selectedWorkers.length === 0) {
            showToast({ message: "Almost there! Please make sure to fill in all the job details and select at least one worker type.", type: 'info' });
            return;
        }

        setLoading(true);
        try {
            await postJob({
                homeownerId: profile?.uid || '',
                homeownerName: profile?.name || 'Homeowner',
                title: form.title,
                category: selectedWorkers[0].skillName, // Primary category
                selectedWorkers: selectedWorkers,
                paymentType: form.paymentType,
                wage: form.wage,
                toolsProvided: form.toolsProvided,
                foodProvided: form.foodProvided,
                stayProvided: form.stayProvided,
                description: form.description,
                location: form.location,
            });
            showToast({ message: 'Great news! Your job has been posted successfully. Workers can now start applying.', type: 'success' });
            router.back();
        } catch (error: any) {
            showToast({ message: mapErrorToProfessionalMessage(error), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hire Workers</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        {/* Job Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Workers needed for house construction"
                                value={form.title}
                                onChangeText={(t) => setForm({ ...form, title: t })}
                            />
                        </View>

                        {/* Worker Category Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select Worker Types</Text>
                            <Text style={styles.subLabel}>Tap to select multiple categories</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillRow}>
                                {SKILLS_DATA.map((skill) => {
                                    const isSelected = selectedWorkers.some(sw => sw.skillId === skill.id);
                                    return (
                                        <TouchableOpacity
                                            key={skill.id}
                                            style={[styles.skillCard, isSelected && styles.skillCardSelected]}
                                            onPress={() => toggleSkill(skill)}
                                        >
                                            <Image source={skill.image} style={styles.skillImage} />
                                            <Text style={[styles.skillName, isSelected && styles.skillNameSelected]} numberOfLines={1}>
                                                {skill.name}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.checkBadge}>
                                                    <MaterialCommunityIcons name="check-circle" size={16} color="#000" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Selected Workers Counts */}
                        {selectedWorkers.length > 0 && (
                            <View style={styles.workerCountsContainer}>
                                <Text style={styles.label}>Number of Workers</Text>
                                {selectedWorkers.map((worker) => (
                                    <View key={worker.skillId} style={styles.workerCountRow}>
                                        <Text style={styles.workerSkillName}>{worker.skillName}</Text>
                                        <View style={styles.counterRow}>
                                            <TouchableOpacity
                                                style={styles.counterBtn}
                                                onPress={() => updateWorkerCount(worker.skillId, -1)}
                                            >
                                                <MaterialCommunityIcons name="minus" size={20} color="black" />
                                            </TouchableOpacity>
                                            <Text style={styles.counterText}>{worker.count}</Text>
                                            <TouchableOpacity
                                                style={styles.counterBtn}
                                                onPress={() => updateWorkerCount(worker.skillId, 1)}
                                            >
                                                <MaterialCommunityIcons name="plus" size={20} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Payment Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Basis</Text>
                            <View style={styles.paymentToggleContainer}>
                                <TouchableOpacity
                                    style={[styles.paymentBtn, form.paymentType === 'Daily' && styles.paymentBtnActive]}
                                    onPress={() => setForm({ ...form, paymentType: 'Daily' })}
                                >
                                    <Text style={[styles.paymentBtnText, form.paymentType === 'Daily' && styles.paymentBtnTextActive]}>Daily Wage</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.paymentBtn, form.paymentType === 'Monthly' && styles.paymentBtnActive]}
                                    onPress={() => setForm({ ...form, paymentType: 'Monthly' })}
                                >
                                    <Text style={[styles.paymentBtnText, form.paymentType === 'Monthly' && styles.paymentBtnTextActive]}>Monthly Salary</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Amount */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{form.paymentType === 'Daily' ? 'Daily Wage' : 'Monthly Salary'} (₹)</Text>
                            <View style={styles.currencyWrapper}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={[styles.input, { paddingLeft: 35 }]}
                                    placeholder={form.paymentType === 'Daily' ? "800" : "25000"}
                                    keyboardType="numeric"
                                    value={form.wage}
                                    onChangeText={(t) => setForm({ ...form, wage: t })}
                                />
                                <Text style={styles.perUnit}>/ {form.paymentType === 'Daily' ? 'day' : 'month'}</Text>
                            </View>
                        </View>

                        {/* Job Location */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Job Location</Text>
                                <TouchableOpacity
                                    onPress={getCurrentLocation}
                                    disabled={locationLoading}
                                    style={styles.locationBtn}
                                >
                                    {locationLoading ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color="#000" />
                                            <Text style={styles.locationBtnText}>Use current location</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Area, City"
                                value={form.location}
                                onChangeText={(t) => setForm({ ...form, location: t })}
                            />
                        </View>

                        {/* Facilities & Tools */}
                        <View style={styles.facilitiesGroup}>
                            <Text style={styles.label}>Facilities & Tools</Text>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLabelGroup}>
                                    <MaterialCommunityIcons name="tools" size={20} color="#666" />
                                    <Text style={styles.toggleLabel}>Tools Provided</Text>
                                </View>
                                <Switch
                                    value={form.toolsProvided}
                                    onValueChange={(v) => setForm({ ...form, toolsProvided: v })}
                                    trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                                    thumbColor={form.toolsProvided ? '#6366f1' : '#f4f3f4'}
                                />
                            </View>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLabelGroup}>
                                    <MaterialCommunityIcons name="food" size={20} color="#666" />
                                    <Text style={styles.toggleLabel}>Food Provided</Text>
                                </View>
                                <Switch
                                    value={form.foodProvided}
                                    onValueChange={(v) => setForm({ ...form, foodProvided: v })}
                                    trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                                    thumbColor={form.foodProvided ? '#6366f1' : '#f4f3f4'}
                                />
                            </View>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLabelGroup}>
                                    <MaterialCommunityIcons name="home-city" size={20} color="#666" />
                                    <Text style={styles.toggleLabel}>Stay Provided</Text>
                                </View>
                                <Switch
                                    value={form.stayProvided}
                                    onValueChange={(v) => setForm({ ...form, stayProvided: v })}
                                    trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                                    thumbColor={form.stayProvided ? '#6366f1' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Job Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe the specific tasks for the workers..."
                                multiline
                                numberOfLines={4}
                                value={form.description}
                                onChangeText={(t) => setForm({ ...form, description: t })}
                            />
                        </View>

                        {/* Job Summary */}
                        {selectedWorkers.length > 0 && (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Job Summary</Text>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTotalWorkers}>
                                        Total Workers: {selectedWorkers.reduce((acc, curr) => acc + curr.count, 0)}
                                    </Text>
                                </View>
                                {selectedWorkers.map(sw => (
                                    <View key={sw.skillId} style={styles.summaryItem}>
                                        <Text style={styles.summarySkill}>{sw.skillName}</Text>
                                        <Text style={styles.summaryCount}>x{sw.count}</Text>
                                    </View>
                                ))}
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Wage Basis:</Text>
                                    <Text style={styles.summaryValue}>{form.paymentType}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total Rate:</Text>
                                    <Text style={styles.summaryValue}>₹{form.wage} / {form.paymentType === 'Daily' ? 'day' : 'month'}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Location:</Text>
                                    <Text style={styles.summaryValue}>{form.location}</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryFacilities}>
                                    <Text style={styles.summaryFacilitiesTitle}>Facilities:</Text>
                                    <View style={styles.summaryFacilitiesIcons}>
                                        <View style={[styles.summaryFacilityTag, !form.toolsProvided && styles.inactiveFacility]}>
                                            <MaterialCommunityIcons name="tools" size={12} color={form.toolsProvided ? "#6366f1" : "#475569"} />
                                            <Text style={[styles.summaryFacilityText, !form.toolsProvided && styles.inactiveFacilityText]}>Tools</Text>
                                        </View>
                                        <View style={[styles.summaryFacilityTag, !form.foodProvided && styles.inactiveFacility]}>
                                            <MaterialCommunityIcons name="food" size={12} color={form.foodProvided ? "#6366f1" : "#475569"} />
                                            <Text style={[styles.summaryFacilityText, !form.foodProvided && styles.inactiveFacilityText]}>Food</Text>
                                        </View>
                                        <View style={[styles.summaryFacilityTag, !form.stayProvided && styles.inactiveFacility]}>
                                            <MaterialCommunityIcons name="home-city" size={12} color={form.stayProvided ? "#6366f1" : "#475569"} />
                                            <Text style={[styles.summaryFacilityText, !form.stayProvided && styles.inactiveFacilityText]}>Stay</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryDescSection}>
                                    <Text style={styles.summaryLabel}>Job Description:</Text>
                                    <Text style={styles.summaryDescText} numberOfLines={3}>{form.description}</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.postBtn, loading && styles.disabledBtn]}
                            onPress={handlePost}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.postBtnText}>Post job</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#F3F3F3',
        borderRadius: 8,
    },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
    },
    subLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: -4,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        color: '#111',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    skillRow: {
        paddingVertical: 4,
        gap: 12,
    },
    skillCard: {
        width: 100,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        position: 'relative',
    },
    skillCardSelected: {
        borderColor: '#000',
        backgroundColor: '#F3F3F3',
    },
    skillImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginBottom: 8,
    },
    skillName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4b5563',
        textAlign: 'center',
    },
    skillNameSelected: {
        color: '#000',
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    workerCountsContainer: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    workerCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    workerSkillName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    counterBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterText: {
        fontSize: 16,
        fontWeight: '800',
        minWidth: 20,
        textAlign: 'center',
    },
    paymentToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 4,
        borderRadius: 12,
        gap: 4,
    },
    paymentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    paymentBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6b7280',
    },
    paymentBtnTextActive: {
        color: '#000',
    },
    currencyWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencySymbol: {
        position: 'absolute',
        left: 16,
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        zIndex: 1,
    },
    perUnit: {
        position: 'absolute',
        right: 16,
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    facilitiesGroup: {
        gap: 12,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    summaryCard: {
        backgroundColor: '#111',
        padding: 20,
        borderRadius: 24,
        gap: 12,
    },
    summaryTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    summaryHeader: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 12,
    },
    summaryTotalWorkers: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summarySkill: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
    },
    summaryCount: {
        color: 'white',
        fontSize: 14,
        fontWeight: '800',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        color: '#94a3b8',
        fontSize: 13,
    },
    summaryValue: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    summaryFacilities: {
        gap: 8,
    },
    summaryFacilitiesTitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    summaryFacilitiesIcons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    summaryFacilityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    inactiveFacility: {
        backgroundColor: 'rgba(71, 85, 105, 0.15)',
    },
    summaryFacilityText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    inactiveFacilityText: {
        color: '#94a3b8',
    },
    summaryDescSection: {
        gap: 4,
    },
    summaryDescText: {
        color: '#cbd5e1',
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    postBtn: {
        backgroundColor: '#000',
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    postBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    disabledBtn: {
        opacity: 0.6,
    },
});
