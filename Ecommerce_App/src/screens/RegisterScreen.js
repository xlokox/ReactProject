import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    console.log('📝 Register button clicked');
    console.log('Form data:', { name: formData.name, email: formData.email, password: '***', confirmPassword: '***' });

    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in את כל השדות הנדרשים');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'הסיסמאות אינן תואמות');
      return;
    }

    console.log('✅ Calling register API...');
    console.log('📤 Sending to backend:', { name: formData.name, email: formData.email });

    const result = await register(formData);

    console.log('📥 Register result received:', result);

    if (result.success) {
      console.log('✅ Registration successful! Navigating to Main...');
      Alert.alert('Success!', result.message, [
        { text: 'אישור', onPress: () => navigation.replace('Main') }
      ]);
    } else {
      console.log('❌ Registration failed:', result.message);
      console.log('❌ Full error result:', result);
      Alert.alert('Error', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Register</Title>

            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />

            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <TextInput
              label="אימות Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              buttonColor="#059473"
              loading={loading}
              disabled={loading}
            >
              הירשם
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});
