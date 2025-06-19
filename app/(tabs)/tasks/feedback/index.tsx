import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const feedbackTasks = [
  {
    id: '1',
    app: 'MercadoPago',
    description: 'Evalúa la experiencia de pago y la facilidad de uso en la app.',
    language: 'Español',
  },
  {
    id: '2',
    app: 'iFood',
    description: 'Dê sua opinião sobre o design e a navegação do app.',
    language: 'Português',
  },
  {
    id: '3',
    app: 'Rappi',
    description: '¿Qué tan intuitivo es pedir comida o mercado en la app?',
    language: 'Español',
  },
  {
    id: '4',
    app: 'Nubank',
    description: 'Avalie a clareza das informações financeiras apresentadas.',
    language: 'Português',
  },
  {
    id: '5',
    app: 'PedidosYa',
    description: '¿La app refleja bien la cultura local de tu país?',
    language: 'Español',
  },
];

const FeedbackTasksScreen = () => {
  const renderItem = ({ item }: any) => (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="star" size={22} color="#A259E6" style={styles.icon} />
          <Text style={styles.appName}>{item.app}</Text>
          <View style={[styles.languagePill, { backgroundColor: item.language === 'Español' ? '#37D2A0' : '#FF7E58' }] }>
            <Text style={styles.languageText}>{item.language}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity style={styles.buttonContainer}>
          <LinearGradient
            colors={["#A259E6", "#6C5DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Ionicons name="create-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Dar feedback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.header}>Give Feedback on an App</Text>
        <Text style={styles.subtext}>Ayuda a mejorar apps populares en Latinoamérica</Text>
      </View>
      <FlatList
        data={feedbackTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#A259E6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C5DD3',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: '#A259E6',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  cardOuter: {
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: '#A259E6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F8F7FF',
    borderWidth: 1.5,
    borderColor: '#E0DEFA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  appName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#6C5DD3',
    flex: 1,
  },
  languagePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  description: {
    fontSize: 15,
    color: '#222',
    marginBottom: 18,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export default FeedbackTasksScreen; 