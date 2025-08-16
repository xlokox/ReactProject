import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Banner() {
  return (
    <View style={styles.container}>
      <View style={styles.bannerContent}>
        <View style={styles.textContent}>
          <Text style={styles.title}>Best Collection</Text>
          <Text style={styles.subtitle}>
            You can buy your all of favorite products from our website
          </Text>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContent}>
          <Image
            source={{ 
              uri: 'https://via.placeholder.com/400x300/059473/ffffff?text=E-Commerce+Banner' 
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 40,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: width * 0.9,
    alignSelf: 'center',
  },
  textContent: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContent: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
});
