import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import getProductImageSource from '../utils/image';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    loading,
    loadCart
  } = useCart();

  const SHIPPING_FEE = 10; // Fixed shipping fee: 10 ₪

  // Reload cart whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Cart screen focused - reloading cart');
      loadCart();
    }, [loadCart])
  );

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'הסרת מוצר',
      'האם אתה בטוח שברצונך להסיר את המוצר מהעגלה?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הסר', 
          style: 'destructive',
          onPress: () => removeFromCart(itemId)
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('עגלה ריקה', 'אנא הוסף מוצרים לעגלה לפני המעבר לתשלום');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }) => (
    <Card style={styles.cartItem}>
      <View style={styles.itemContainer}>
        <Image
          source={getProductImageSource(item.product)}
          style={styles.itemImage}
          resizeMode="cover"
        />
        
        <View style={styles.itemDetails}>
          <Paragraph style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </Paragraph>
          <Title style={styles.itemPrice}>₪{item.product.price}</Title>
          
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => handleQuantityChange(item._id, item.quantity - 1)}
              style={styles.quantityButton}
            />
            <Paragraph style={styles.quantity}>{item.quantity}</Paragraph>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => handleQuantityChange(item._id, item.quantity + 1)}
              style={styles.quantityButton}
            />
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <IconButton
            icon="delete"
            size={24}
            iconColor="#FF4444"
            onPress={() => handleRemoveItem(item._id)}
          />
          <Title style={styles.itemTotal}>
            ₪{(item.product.price * item.quantity).toFixed(2)}
          </Title>
        </View>
      </View>
    </Card>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Title style={styles.emptyTitle}>העגלה שלך ריקה</Title>
      <Paragraph style={styles.emptyText}>
        הוסף מוצרים לעגלה כדי להתחיל לקנות
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Products')}
        style={styles.shopButton}
        buttonColor="#059473"
      >
        התחל לקנות
      </Button>
    </View>
  );

  if (cartItems.length === 0) {
    return renderEmptyCart();
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Paragraph>סה"כ פריטים:</Paragraph>
            <Paragraph>{cartItems.length}</Paragraph>
          </View>

          <View style={styles.summaryRow}>
            <Paragraph>סה"כ כמות:</Paragraph>
            <Paragraph>
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </Paragraph>
          </View>

          <View style={styles.summaryRow}>
            <Paragraph>סכום ביניים:</Paragraph>
            <Paragraph>₪{getCartTotal().toFixed(2)}</Paragraph>
          </View>

          <View style={styles.shippingRow}>
            <Paragraph style={styles.shippingText}>משלוח:</Paragraph>
            <Paragraph style={styles.shippingText}>₪{SHIPPING_FEE.toFixed(2)}</Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.totalRow}>
            <Title>סה"כ לתשלום:</Title>
            <Title style={styles.totalAmount}>₪{(getCartTotal() + SHIPPING_FEE).toFixed(2)}</Title>
          </View>

          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            buttonColor="#059473"
            loading={loading}
            disabled={loading}
          >
            המשך לתשלום
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cartList: {
    padding: 16,
    paddingTop: 8,
  },
  cartItem: {
    marginBottom: 12,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    margin: 0,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shippingText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalAmount: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  checkoutButton: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 24,
  },
});
