import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';

export default function ShippingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shipping Information</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
