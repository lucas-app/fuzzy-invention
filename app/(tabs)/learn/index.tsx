import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LEARNING_MODULES = [
  {
    title: 'Crypto Basics',
    description: 'Learn the fundamentals of cryptocurrency and blockchain technology',
    icon: 'school',
    lessons: 12,
    duration: '2 hours',
  },
  {
    title: 'Web3 Fundamentals',
    description: 'Understanding decentralized applications and smart contracts',
    icon: 'globe',
    lessons: 8,
    duration: '1.5 hours',
  },
  {
    title: 'Digital Wallets',
    description: 'How to securely store and manage your digital assets',
    icon: 'wallet',
    lessons: 6,
    duration: '1 hour',
  },
];

export default function LearnScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>
          Expand your knowledge of blockchain and crypto
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {LEARNING_MODULES.map((module, index) => (
          <View key={index} style={styles.moduleCard}>
            <View style={styles.moduleIcon}>
              <Ionicons name={module.icon} size={24} color="#00d4ff" />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
              <View style={styles.moduleStats}>
                <Text style={styles.moduleStat}>
                  <Ionicons name="book" size={14} color="#64748b" /> {module.lessons} lessons
                </Text>
                <Text style={styles.moduleStat}>
                  <Ionicons name="time" size={14} color="#64748b" /> {module.duration}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,212,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  moduleStats: {
    flexDirection: 'row',
    gap: 16,
  },
  moduleStat: {
    fontSize: 14,
    color: '#64748b',
  },
});