import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  TextInput,
  RadioButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth(); // Get logged-in user info
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const SHIPPING_FEE = 5; // Fixed shipping fee: $5
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: 'United States',
  });
  const [creditCard, setCreditCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city) {
      Alert.alert('Error', 'Please fill in את Address הShipping');
      return;
    }

    // Validate credit card details if credit card payment is selected
    if (paymentMethod === 'credit_card') {
      if (!creditCard.cardNumber || !creditCard.cardHolder || !creditCard.expiryDate || !creditCard.cvv) {
        Alert.alert('Error', 'Please fill in את כל פרטי כרטיס האשראי');
        return;
      }
      // Basic card number validation (should be 16 digits)
      if (creditCard.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'מספר Credit Card Invalid');
        return;
      }
      // Basic CVV validation (should be 3 digits)
      if (creditCard.cvv.length !== 3) {
        Alert.alert('Error', 'CVV Invalid');
        return;
      }
    }

    try {
      setLoading(true);

      // Prepare order data in the format expected by the backend
      const SHIPPING_FEE = 5; // Fixed shipping fee: $5
      const subtotal = getCartTotal();
      const totalAmount = subtotal + SHIPPING_FEE;

      // Extract last 4 digits of card number (if credit card payment)
      let cardLastFour = '';
      if (paymentMethod === 'credit_card' && creditCard.cardNumber) {
        cardLastFour = creditCard.cardNumber.replace(/\s/g, '').slice(-4);
      }

      const orderData = {
        userId: user?.id || cartItems[0]?.userId || 'guest',
        // Customer information from logged-in user
        customerInfo: {
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          phone: user?.phone || ''
        },
        // Structured shipping address (NOT concatenated string)
        shippingInfo: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country
        },
        // Payment information
        payment_method: paymentMethod,
        payment_details: {
          cardHolder: paymentMethod === 'credit_card' ? creditCard.cardHolder : '',
          cardLastFour: cardLastFour,
          transactionId: '' // Will be filled by payment processor
        },
        // Pricing breakdown
        price: subtotal,
        shipping_fee: SHIPPING_FEE,
        // Products
        products: [{
          sellerId: cartItems[0]?.product?.sellerId || '507f1f77bcf86cd799439011',
          price: subtotal,
          products: cartItems.map(item => ({
            productInfo: {
              _id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              images: item.product.images || [],
              slug: item.product.slug || item.product.name.toLowerCase().replace(/\s+/g, '-'),
            },
            quantity: item.quantity,
            _id: item._id
          }))
        }]
      };

      console.log('📦 Placing order with data:', orderData);
      const orderResponse = await api.post('/home/order/place-order', orderData);
      console.log('✅ Order response:', orderResponse.data);

      if (orderResponse.data?.message === 'Order Placed Successfully') {
        const orderId = orderResponse.data.orderId;
        const orderNumber = orderResponse.data.orderNumber;

        // Process payment
        const paymentData = {
          order_id: orderId,
          amount: totalAmount,
          payment_method: paymentMethod,
        };

        console.log('💳 Processing payment:', paymentData);
        const paymentResponse = await api.post('/payment/process', paymentData);
        console.log('✅ Payment response:', paymentResponse.data);

        if (paymentResponse.data?.success) {
          console.log('✅ Payment successful! Clearing cart...');

          // Clear cart after successful payment
          const clearResult = await clearCart();
          console.log('🗑️ Clear cart result:', clearResult);

          // Navigate to Order Confirmation Screen with order details
          // Pass cartItems BEFORE clearing so they can be displayed
          navigation.replace('OrderConfirmation', {
            orderNumber: orderNumber,
            orderId: orderId,
            customerName: orderResponse.data.customerName,
            totalAmount: orderResponse.data.totalAmount,
            subtotal: orderResponse.data.subtotal,
            shippingFee: orderResponse.data.shippingFee,
            paymentMethod: orderResponse.data.paymentMethod,
            estimatedDelivery: orderResponse.data.estimatedDelivery,
            products: cartItems // Pass cart items before clearing
          });
        } else {
          Alert.alert('Error בתשלום', paymentResponse.data.message || 'תשלום נכשל');
        }
      } else {
        Alert.alert('Error', orderResponse.data.message || 'ההזמנה נכשלה');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'אירעה Error בעיבוד ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>תשלום</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
          <Title>Order Summary</Title>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Paragraph>{item.product.name}</Paragraph>
              <Paragraph>
                {item.quantity} x ${item.product.price} = ${(item.quantity * item.product.price).toFixed(2)}
              </Paragraph>
            </View>
          ))}
          <View style={styles.shippingRow}>
            <Paragraph style={styles.shippingText}>Shipping:</Paragraph>
            <Paragraph style={styles.shippingText}>${SHIPPING_FEE.toFixed(2)}</Paragraph>
          </View>
          <View style={styles.totalRow}>
            <Title>Total: ${(getCartTotal() + SHIPPING_FEE).toFixed(2)}</Title>
          </View>
        </Card.Content>
      </Card>

      {/* Shipping Address */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Shipping Address</Title>

          <TextInput
            label="Street Address"
            value={shippingAddress.street}
            onChangeText={(text) => setShippingAddress({...shippingAddress, street: text})}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="City"
            value={shippingAddress.city}
            onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="ZIP Code"
            value={shippingAddress.zipCode}
            onChangeText={(text) => setShippingAddress({...shippingAddress, zipCode: text})}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />
        </Card.Content>
      </Card>

      {/* Payment Method */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Payment Method</Title>

          <RadioButton.Group
            onValueChange={setPaymentMethod}
            value={paymentMethod}
          >
            <View style={styles.radioItem}>
              <RadioButton value="credit_card" />
              <Paragraph>Credit Card</Paragraph>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="paypal" />
              <Paragraph>PayPal</Paragraph>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="cash_on_delivery" />
              <Paragraph>Cash on Delivery</Paragraph>
            </View>
          </RadioButton.Group>

          {/* Credit Card Details - Show only when credit card is selected */}
          {paymentMethod === 'credit_card' && (
            <View style={styles.creditCardSection}>
              <TextInput
                label="Card Number"
                value={creditCard.cardNumber}
                onChangeText={(text) => {
                  // Format card number with spaces every 4 digits
                  const formatted = text.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                  setCreditCard({...creditCard, cardNumber: formatted});
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                maxLength={19} // 16 digits + 3 spaces
                placeholder="1234 5678 9012 3456"
              />

              <TextInput
                label="Cardholder Name"
                value={creditCard.cardHolder}
                onChangeText={(text) => setCreditCard({...creditCard, cardHolder: text})}
                mode="outlined"
                style={styles.input}
                placeholder="John Doe"
              />

              <View style={styles.cardDetailsRow}>
                <TextInput
                  label="Expiry (MM/YY)"
                  value={creditCard.expiryDate}
                  onChangeText={(text) => {
                    // Format expiry date as MM/YY
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
                    }
                    setCreditCard({...creditCard, expiryDate: formatted});
                  }}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="12/25"
                />

                <TextInput
                  label="CVV"
                  value={creditCard.cvv}
                  onChangeText={(text) => setCreditCard({...creditCard, cvv: text.replace(/\D/g, '')})}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="123"
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          style={styles.orderButton}
          buttonColor="#059473"
          loading={loading}
          disabled={loading}
        >
          Place Order
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#059473',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32, // Same width as back button for centering
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shippingText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  orderButton: {
    margin: 16,
    paddingVertical: 8,
  },
  creditCardSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
});
