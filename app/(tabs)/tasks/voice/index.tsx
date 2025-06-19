import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const voiceTasks = [
  {
    id: '1',
    prompt: 'Di en voz alta: "El clima está perfecto para una caminata."',
    language: 'Español',
  },
  {
    id: '2',
    prompt: 'Leia em voz alta: "O Brasil é conhecido por suas belas praias."',
    language: 'Português',
  },
  {
    id: '3',
    prompt: 'Di en voz alta: "Me gusta mucho la comida típica de mi país."',
    language: 'Español',
  },
  {
    id: '4',
    prompt: 'Leia em voz alta: "A tecnologia está mudando o mundo rapidamente."',
    language: 'Português',
  },
  {
    id: '5',
    prompt: 'Di en voz alta: "¿Cuál es tu lugar favorito para visitar en Latinoamérica?"',
    language: 'Español',
  },
];

const { width } = Dimensions.get('window');

const VoiceTasksScreen = () => {
  const renderItem = ({ item }: any) => (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="mic-outline" size={24} color="#3B82F6" style={styles.icon} />
          <View style={[styles.languagePill, { backgroundColor: item.language === 'Español' ? '#37D2A0' : '#FF7E58' }] }>
            <Text style={styles.languageText}>{item.language}</Text>
          </View>
        </View>
        <Text style={styles.prompt}>{item.prompt}</Text>
        <TouchableOpacity style={styles.buttonContainer}>
          <LinearGradient
            colors={["#49A0FF", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Ionicons name="recording" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Comenzar grabación</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.header}>Record Your Voice</Text>
        <Text style={styles.subtext}>Ayuda a entrenar IA de voz para Latinoamérica</Text>
      </View>
      <FlatList
        data={voiceTasks}
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
    shadowColor: '#49A0FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: '#49A0FF',
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
    shadowColor: '#49A0FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#D6E6FA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
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
  prompt: {
    fontSize: 16,
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

export default VoiceTasksScreen; 