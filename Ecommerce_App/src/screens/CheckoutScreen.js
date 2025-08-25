import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  TextInput,
  RadioButton,
} from 'react-native-paper';
import { useCart } from '../context/CartContext';
import api from '../api/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: 'ישראל',
  });

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city) {
      Alert.alert('שגיאה', 'אנא מלא את כתובת המשלוח');
      return;
    }

    try {
      setLoading(true);
      
      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        total_amount: getCartTotal(),
      };

      const orderResponse = await api.post('/order/place-order', orderData);

      if (orderResponse.data?.success) {
        const orderId = orderResponse.data.order?._id;

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
          Alert.alert('שגיאה בתשלום', paymentResponse.data.message);
        }
      } else {
        Alert.alert('שגיאה', orderResponse.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בעיבוד ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
          <View style={styles.totalRow}>
            <Title>סה"כ: ₪{getCartTotal().toFixed(2)}</Title>
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
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handlePlaceOrder}
        style={styles.orderButton}
        loading={loading}
        disabled={loading}
      >
        בצע הזמנה
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});
