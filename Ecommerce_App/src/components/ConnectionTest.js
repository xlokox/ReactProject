import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnection } from '../api/api';

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [lastTest, setLastTest] = useState(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setLastTest(new Date().toLocaleTimeString());
      } else {
        setConnectionStatus('failed');
        setLastTest(new Date().toLocaleTimeString());
      }
    } catch (error) {
      setConnectionStatus('failed');
      setLastTest(new Date().toLocaleTimeString());
      console.error('Connection test failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'failed': return '#ef4444';
      case 'testing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'testing': return 'time';
      default: return 'help-circle';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Backend Connected';
      case 'failed': return 'Connection Failed';
      case 'testing': return 'Testing Connection...';
      default: return 'Unknown Status';
    }
  };

  const showConnectionHelp = () => {
    Alert.alert(
      'Connection Help',
      'If connection failed:\n\n' +
      '1. Make sure your backend server is running on port 5001\n' +
      '2. Update the IP address in src/api/api.js\n' +
      '3. Ensure your phone and computer are on the same WiFi network\n' +
      '4. Check if firewall is blocking the connection',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        <Ionicons name={getStatusIcon()} size={16} color="#ffffff" />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {lastTest && (
        <Text style={styles.lastTestText}>Last test: {lastTest}</Text>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testBackendConnection}
        >
          <Ionicons name="refresh" size={16} color="#059473" />
          <Text style={styles.testButtonText}>Test Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={showConnectionHelp}
        >
          <Ionicons name="help-circle-outline" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  lastTestText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059473',
  },
  testButtonText: {
    color: '#059473',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  helpButton: {
    padding: 6,
  },
});
