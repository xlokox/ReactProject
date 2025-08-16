import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { customer_login, messageClear } from '../store/reducers/authReducer';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loader, errorMessage, successMessage, userInfo } = useSelector(state => state.auth);

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

  const login = () => {
    if (!state.email || !state.password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields'
      });
      return;
    }
    dispatch(customer_login(state));
  };

  useEffect(() => {
    if (successMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: successMessage
      });
      dispatch(messageClear());
    }
    if (errorMessage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage
      });
      dispatch(messageClear());
    }
    if (userInfo) {
      navigation.replace('Main');
    }
  }, [successMessage, errorMessage, userInfo, navigation, dispatch]);

  return (
    <View style={styles.container}>
      {loader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#059473" />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.loginContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={state.email}
                onChangeText={(text) => inputHandle('email', text)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={state.password}
                onChangeText={(text) => inputHandle('password', text)}
                placeholder="Password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={login}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.facebookButton}>
              <Ionicons name="logo-facebook" size={20} color="#ffffff" style={{marginRight: 8}} />
              <Text style={styles.socialButtonText}>Login With Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
              <Ionicons name="logo-google" size={20} color="#ffffff" style={{marginRight: 8}} />
              <Text style={styles.socialButtonText}>Login With Google</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't Have An Account?{' '}
                <Text
                  style={styles.registerLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  Register
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x300/059473/ffffff?text=E-Commerce' }}
              style={styles.loginImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(56, 48, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 500,
  },
  formContainer: {
    flex: 1,
    padding: 32,
  },
  imageContainer: {
    flex: 1,
    padding: 16,
  },
  loginImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#059473',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#64748b',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    marginTop: 8,
  },
  registerText: {
    textAlign: 'center',
    color: '#64748b',
  },
  registerLink: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});
