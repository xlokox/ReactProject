import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

export default function LoginScreen({ navigation }) {
  const { login: authLogin, loading } = useAuth();

  const [state, setState] = useState({
    email: '',
    password: ''
  });

  const inputHandle = (name, value) => {
    setState({
      ...state,
      [name]: value
    });
  };

  const login = async () => {
    console.log('🔐 Login button clicked');
    console.log('Email:', state.email);
    console.log('Password:', state.password ? '***' : 'empty');

    if (!state.email || !state.password) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    console.log('✅ Calling login API...');
    const result = await authLogin(state.email, state.password);

    console.log('Login result:', result);

    if (result.success) {
      console.log('✅ Login successful! Navigating to Main...');
      Alert.alert('הצלחה', 'התחברת בהצלחה!', [
        { text: 'אישור', onPress: () => navigation.replace('Main') }
      ]);
    } else {
      console.log('❌ Login failed:', result.message);
      Alert.alert('שגיאה', result.message || 'ההתחברות נכשלה');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#059473" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={60} color="#059473" />
            <Text style={styles.logoText}>EasyShop</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>התחברות</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>אימייל</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={state.email}
                onChangeText={(text) => inputHandle('email', text)}
                placeholder="הכנס את האימייל שלך"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>סיסמה</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={state.password}
                onChangeText={(text) => inputHandle('password', text)}
                placeholder="הכנס את הסיסמה שלך"
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginButtonText}>התחבר</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>או</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.facebookButton}>
            <Ionicons name="logo-facebook" size={22} color="#ffffff" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>התחבר עם Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton}>
            <Ionicons name="logo-google" size={22} color="#ffffff" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>התחבר עם Google</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              אין לך חשבון?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                הירשם עכשיו
              </Text>
            </Text>
          </View>
        </View>

        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/login-page-4468581-3783954.png' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059473',
    marginTop: 12,
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#059473',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#059473',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4267B2',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#4267B2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#DB4437',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  registerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 15,
  },
  registerLink: {
    color: '#059473',
    fontWeight: 'bold',
    fontSize: 16,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  illustration: {
    width: 280,
    height: 200,
  },
});
