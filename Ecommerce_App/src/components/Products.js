import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import getProductImageSource from '../utils/image';

export default function Products({ title, products, navigation }) {
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [loadingProductId, setLoadingProductId] = useState(null);

  const addToCart = async (product) => {
    console.log('🛒 Add to Cart clicked!');
    console.log('User:', user);
    console.log('Product:', product.name);

    if (!user) {
      console.log('❌ User not logged in');
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים לעגלה', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      console.log('✅ User is logged in, adding to cart...');
      setLoadingProductId(product._id);
      const result = await addToCartContext(product, 1);

      console.log('Cart result:', result);

      if (result && result.success) {
        console.log('✅ Product added successfully!');
        Alert.alert('הצלחה!', 'המוצר נוסף לעגלה בהצלחה', [
          { text: 'המשך קניות', style: 'cancel' },
          { text: 'עבור לעגלה', onPress: () => navigation.navigate('Cart') }
        ]);
      } else {
        console.log('❌ Failed to add product:', result?.message);
        Alert.alert('שגיאה', result?.message || 'לא ניתן להוסיף את המוצר לעגלה');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('Error details:', error.message);
      Alert.alert('שגיאה', 'אירעה שגיאה בהוספת המוצר לעגלה: ' + error.message);
    } finally {
      setLoadingProductId(null);
    }
  };

  const addToWishlist = (product) => {
    if (!user) {
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
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₪{item.price}</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>
              ₪{Math.floor(item.price + (item.price * item.discount) / 100)}
            </Text>
          )}
        </View>

        <Text style={styles.shippingText}>משלוח: ₪10</Text>

        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < Math.floor(item.rating) ? "star" : "star-outline"}
              size={12}
              color="#fbbf24"
            />
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addToWishlist(item)}
          >
            <Ionicons name="heart-outline" size={16} color="#059473" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addToCart(item)}
            disabled={loadingProductId === item._id}
          >
            {loadingProductId === item._id ? (
              <ActivityIndicator size="small" color="#059473" />
            ) : (
              <Ionicons name="bag-add-outline" size={16} color="#059473" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059473',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  shippingText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
