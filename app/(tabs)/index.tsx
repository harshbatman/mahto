import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.heroSection}>
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>MAHTO</Text>
            <Text style={styles.heroSubtitle}>Digital Excellence Redefined</Text>
          </View>
        </LinearGradient>
      </ThemedView>

      <ThemedView style={styles.mainContent}>
        <ThemedText type="title" style={styles.sectionTitle}>The Future is Now</ThemedText>
        <ThemedText style={styles.description}>
          We build premium mobile experiences that combine cutting-edge technology with world-class design.
        </ThemedText>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50k</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            style={styles.buttonGradient}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <ThemedView style={styles.cardContainer}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Featured Work</ThemedText>
          <View style={[styles.card, { backgroundColor: '#1e1e1e' }]}>
            <View style={styles.cardInfo}>
              <Text style={styles.workTitle}>Lumina App</Text>
              <Text style={styles.workDesc}>SaaS Design System for Mobile</Text>
            </View>
          </View>
        </ThemedView>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 350,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    fontWeight: '500',
  },
  mainContent: {
    padding: 24,
    backgroundColor: '#09090b',
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#a1a1aa',
    lineHeight: 24,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  ctaButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 40,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardContainer: {
    marginTop: 20,
    backgroundColor: '#09090b',
  },
  cardTitle: {
    marginBottom: 20,
  },
  card: {
    height: 200,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardInfo: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  workTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  workDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  }
});
