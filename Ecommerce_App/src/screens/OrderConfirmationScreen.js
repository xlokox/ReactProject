import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function OrderConfirmationScreen({ route, navigation }) {
  const {
    orderNumber,
    orderId,
    customerName,
    totalAmount,
    subtotal,
    shippingFee,
    paymentMethod,
    estimatedDelivery,
    products
  } = route.params;

  const [copied, setCopied] = useState(false);

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'credit_card':
        return 'כרטיס אשראי';
      case 'paypal':
        return 'PayPal';
      case 'cash_on_delivery':
        return 'תשלום במזומן במשלוח';
      default:
        return method;
    }
  };

  const handleCopyOrderNumber = async () => {
    try {
      await Clipboard.setStringAsync(orderNumber);
      setCopied(true);
      Alert.alert(
        '✅ הועתק בהצלחה!',
        'מספר ההזמנה הועתק ללוח. אתה יכול להשתמש בו כדי לעקוב אחר ההזמנה שלך עם הצ\'אטבוט שלנו! 🤖',
        [{ text: 'אישור', onPress: () => setCopied(false) }]
      );
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('שגיאה', 'לא ניתן להעתיק את מספר ההזמנה');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          <Text style={styles.headerTitle}>תודה על ההזמנה!</Text>
          <Text style={styles.headerSubtitle}>ההזמנה שלך התקבלה בהצלחה</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Order Number Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>מספר הזמנה</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
            <Text style={styles.orderIdText}>ID: {orderId}</Text>

            {/* Copy Order Number Button */}
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyOrderNumber}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={20}
                color={copied ? "#4CAF50" : "#059473"}
              />
              <Text style={[styles.copyButtonText, copied && styles.copiedText]}>
                {copied ? 'הועתק!' : 'העתק מספר הזמנה'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.copyHint}>
              💡 השתמש במספר זה כדי לעקוב אחר ההזמנה שלך עם הצ'אטבוט שלנו
            </Text>
          </Card.Content>
        </Card>

        {/* Customer Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>פרטי לקוח</Text>
            <Text style={styles.infoText}>שם: {customerName}</Text>
          </Card.Content>
        </Card>

        {/* Order Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>סיכום הזמנה</Text>
            
            {products && products.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>
                  {item.quantity} x ${item.product.price.toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>סכום ביניים:</Text>
              <Text style={styles.priceValue}>${subtotal?.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>משלוח:</Text>
              <Text style={styles.priceValue}>${shippingFee?.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>סה"כ:</Text>
              <Text style={styles.totalValue}>${totalAmount?.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment & Delivery Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>פרטי תשלום ומשלוח</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>אמצעי תשלום:</Text>
              <Text style={styles.infoValue}>{getPaymentMethodText(paymentMethod)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>משלוח משוער:</Text>
              <Text style={styles.infoValue}>{estimatedDelivery}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>סטטוס משלוח:</Text>
              <Text style={styles.statusPending}>ממתין לעיבוד</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Info Message */}
        <Card style={[styles.card, styles.infoCard]}>
          <Card.Content>
            <View style={styles.infoMessageRow}>
              <Ionicons name="information-circle" size={24} color="#2196F3" />
              <Text style={styles.infoMessage}>
                קיבלת אימייל עם פרטי ההזמנה. תוכל לעקוב אחר ההזמנה שלך בעמוד "ההזמנות שלי".
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {
              // Navigate to Main tabs and then to Profile (which has Orders)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Profile' } }],
              });
            }}
            style={styles.trackButton}
            buttonColor="#059473"
            icon="package-variant"
          >
            עקוב אחר ההזמנה
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })}
            style={styles.homeButton}
            textColor="#059473"
          >
            חזור לדף הבית
          </Button>
        </View>
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059473',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 1,
  },
  orderIdText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    marginVertical: 4,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  productName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059473',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusPending: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  infoMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoMessage: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  trackButton: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  homeButton: {
    paddingVertical: 8,
    borderColor: '#059473',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#059473',
  },
  copyButtonText: {
    fontSize: 16,
    color: '#059473',
    fontWeight: '600',
    marginLeft: 8,
  },
  copiedText: {
    color: '#4CAF50',
  },
  copyHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

