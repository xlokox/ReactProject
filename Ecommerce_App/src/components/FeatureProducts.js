import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import getProductImageSource from '../utils/image';

const { width } = Dimensions.get('window');

export default function FeatureProducts({ products, navigation }) {
  const { userInfo } = useSelector(state => state.auth);
  const { addToCart: addToCartContext } = useCart();
  const [loadingProductId, setLoadingProductId] = useState(null);

  const addToCart = async (product) => {
    if (!userInfo) {
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים לעגלה', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      setLoadingProductId(product._id);
      const result = await addToCartContext(product, 1);

      if (result.success) {
        Alert.alert('הצלחה!', 'המוצר נוסף לעגלה בהצלחה', [
          { text: 'המשך קניות', style: 'cancel' },
          { text: 'עבור לעגלה', onPress: () => navigation.navigate('Cart') }
        ]);
      } else {
        Alert.alert('שגיאה', result.message || 'לא ניתן להוסיף את המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בהוספת המוצר לעגלה');
    } finally {
      setLoadingProductId(null);
    }
  };

  const addToWishlist = (product) => {
    if (!userInfo) {
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים למועדפים', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    Alert.alert('הצלחה!', 'המוצר נוסף למועדפים');
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={getProductImageSource(item)}
          style={styles.productImage}
          resizeMode="cover"
        />
        
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addToWishlist(item)}
          >
            <Ionicons name="heart-outline" size={20} color="#059473" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addToCart(item)}
            disabled={loadingProductId === item._id}
          >
            {loadingProductId === item._id ? (
              <ActivityIndicator size="small" color="#059473" />
            ) : (
              <Ionicons name="bag-add-outline" size={20} color="#059473" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>
              ${Math.floor(item.price + (item.price * item.discount) / 100)}
            </Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < Math.floor(item.rating) ? "star" : "star-outline"}
              size={14}
              color="#fbbf24"
            />
          ))}
          <Text style={styles.ratingText}>({item.rating})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Products</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 32,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059473',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});
