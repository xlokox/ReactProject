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
import api from '../api/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const SHIPPING_FEE = 10; // Fixed shipping fee: 10 ₪
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: 'ישראל',
  });
  const [creditCard, setCreditCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city) {
      Alert.alert('שגיאה', 'אנא מלא את כתובת המשלוח');
      return;
    }

    // Validate credit card details if credit card payment is selected
    if (paymentMethod === 'credit_card') {
      if (!creditCard.cardNumber || !creditCard.cardHolder || !creditCard.expiryDate || !creditCard.cvv) {
        Alert.alert('שגיאה', 'אנא מלא את כל פרטי כרטיס האשראי');
        return;
      }
      // Basic card number validation (should be 16 digits)
      if (creditCard.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('שגיאה', 'מספר כרטיס אשראי לא תקין');
        return;
      }
      // Basic CVV validation (should be 3 digits)
      if (creditCard.cvv.length !== 3) {
        Alert.alert('שגיאה', 'CVV לא תקין');
        return;
      }
    }

    try {
      setLoading(true);

      // Prepare order data in the format expected by the backend
      const SHIPPING_FEE = 10; // Fixed shipping fee: 10 ₪
      const orderData = {
        userId: cartItems[0]?.userId || 'guest', // Get userId from cart items
        price: getCartTotal(),
        shipping_fee: SHIPPING_FEE,
        shippingInfo: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode}, ${shippingAddress.country}`,
        products: [{
          sellerId: cartItems[0]?.product?.sellerId || '507f1f77bcf86cd799439011', // Default seller ID
          price: getCartTotal(),
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

      console.log('Placing order with data:', orderData);
      const orderResponse = await api.post('/home/order/place-order', orderData);

      if (orderResponse.data?.message === 'Order Placed Successfully') {
        const orderId = orderResponse.data.orderId;

        // Process payment
        const paymentData = {
          order_id: orderId,
          amount: getCartTotal(),
          payment_method: paymentMethod,
        };

        const paymentResponse = await api.post('/payment/process', paymentData);

        if (paymentResponse.data?.success) {
          await clearCart();

          Alert.alert(
            'הזמנה בוצעה בהצלחה!',
            'ההזמנה שלך התקבלה ותעובד בקרוב',
            [
              {
                text: 'אישור',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert('שגיאה בתשלום', paymentResponse.data.message || 'תשלום נכשל');
        }
      } else {
        Alert.alert('שגיאה', orderResponse.data.message || 'ההזמנה נכשלה');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('שגיאה', error.response?.data?.message || 'אירעה שגיאה בעיבוד ההזמנה');
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
          <Title>סיכום הזמנה</Title>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Paragraph>{item.product.name}</Paragraph>
              <Paragraph>
                {item.quantity} x ₪{item.product.price} = ₪{(item.quantity * item.product.price).toFixed(2)}
              </Paragraph>
            </View>
          ))}
          <View style={styles.shippingRow}>
            <Paragraph style={styles.shippingText}>משלוח:</Paragraph>
            <Paragraph style={styles.shippingText}>₪{SHIPPING_FEE.toFixed(2)}</Paragraph>
          </View>
          <View style={styles.totalRow}>
            <Title>סה"כ לתשלום: ₪{(getCartTotal() + SHIPPING_FEE).toFixed(2)}</Title>
          </View>
        </Card.Content>
      </Card>

      {/* Shipping Address */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>כתובת משלוח</Title>
          
          <TextInput
            label="רחוב ומספר בית"
            value={shippingAddress.street}
            onChangeText={(text) => setShippingAddress({...shippingAddress, street: text})}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="עיר"
            value={shippingAddress.city}
            onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="מיקוד"
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
          <Title>אמצעי תשלום</Title>

          <RadioButton.Group
            onValueChange={setPaymentMethod}
            value={paymentMethod}
          >
            <View style={styles.radioItem}>
              <RadioButton value="credit_card" />
              <Paragraph>כרטיס אשראי</Paragraph>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="paypal" />
              <Paragraph>PayPal</Paragraph>
            </View>

            <View style={styles.radioItem}>
              <RadioButton value="cash_on_delivery" />
              <Paragraph>תשלום במזומן בעת המסירה</Paragraph>
            </View>
          </RadioButton.Group>

          {/* Credit Card Details - Show only when credit card is selected */}
          {paymentMethod === 'credit_card' && (
            <View style={styles.creditCardSection}>
              <TextInput
                label="מספר כרטיס אשראי"
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
                label="שם בעל הכרטיס"
                value={creditCard.cardHolder}
                onChangeText={(text) => setCreditCard({...creditCard, cardHolder: text})}
                mode="outlined"
                style={styles.input}
                placeholder="ישראל ישראלי"
              />

              <View style={styles.cardDetailsRow}>
                <TextInput
                  label="תוקף (MM/YY)"
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
          בצע הזמנה
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
