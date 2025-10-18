import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Chip,
  ActivityIndicator,
  Divider,
  Text,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import moment from 'moment';
import getProductImageSource from '../utils/image';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      console.log('📦 Loading order details for:', orderId);

      const response = await api.get(`/home/customer/get-order-details/${orderId}`);

      console.log('✅ Order details loaded:', response.data);

      if (response.data?.order) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'unpaid': return '#FF9800';
      case 'refunded': return '#2196F3';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059473" />
        <Paragraph style={styles.loadingText}>Loading order details...</Paragraph>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#F44336" />
        <Title style={styles.errorTitle}>Order Not Found</Title>
        <Paragraph style={styles.errorText}>
          Unable to load order details. Please try again.
        </Paragraph>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Order Details</Title>
          <Paragraph style={styles.headerSubtitle}>{order.orderNumber}</Paragraph>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Title style={styles.sectionTitle}>Order Status</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(order.delivery_status) }]}
                textStyle={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}
              >
                {getStatusLabel(order.delivery_status)}
              </Chip>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Paragraph style={styles.infoText}>
                Order Date: {moment(order.createdAt).format('MMMM DD, YYYY')}
              </Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Paragraph style={styles.infoText}>
                Payment: {order.payment_method?.replace('_', ' ').toUpperCase()}
              </Paragraph>
              <Chip
                style={[styles.paymentChip, { backgroundColor: getPaymentStatusColor(order.payment_status) }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {order.payment_status?.toUpperCase()}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Customer Information</Title>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Paragraph style={styles.infoText}>{order.customerInfo?.name}</Paragraph>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#666" />
              <Paragraph style={styles.infoText}>{order.customerInfo?.email}</Paragraph>
            </View>
            {order.customerInfo?.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Paragraph style={styles.infoText}>{order.customerInfo.phone}</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Shipping Address */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Shipping Address</Title>
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={20} color="#059473" />
              <View style={styles.addressText}>
                <Paragraph>{order.shippingInfo?.street}</Paragraph>
                <Paragraph>
                  {order.shippingInfo?.city}, {order.shippingInfo?.zipCode}
                </Paragraph>
                <Paragraph>{order.shippingInfo?.country}</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Products */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              Products ({order.products?.length || 0} items)
            </Title>

            {order.products?.map((product, index) => (
              <View key={index}>
                {index > 0 && <Divider style={styles.productDivider} />}
                <View style={styles.productItem}>
                  <Image
                    source={getProductImageSource(product.images?.[0])}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Paragraph style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Paragraph>
                    <Paragraph style={styles.productQuantity}>
                      Qty: {product.quantity}
                    </Paragraph>
                    <Paragraph style={styles.productPrice}>
                      ${product.price?.toFixed(2)} each
                    </Paragraph>
                  </View>
                  <View style={styles.productTotal}>
                    <Paragraph style={styles.productTotalText}>
                      ${(product.price * product.quantity).toFixed(2)}
                    </Paragraph>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Order Summary</Title>

            <View style={styles.summaryRow}>
              <Paragraph style={styles.summaryLabel}>Subtotal</Paragraph>
              <Paragraph style={styles.summaryValue}>
                ${order.subtotal?.toFixed(2)}
              </Paragraph>
            </View>

            <View style={styles.summaryRow}>
              <Paragraph style={styles.summaryLabel}>Shipping Fee</Paragraph>
              <Paragraph style={styles.summaryValue}>
                ${order.shipping_fee?.toFixed(2)}
              </Paragraph>
            </View>

            <Divider style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Title style={styles.totalLabel}>Total</Title>
              <Title style={styles.totalValue}>${order.price?.toFixed(2)}</Title>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Details (if available) */}
        {order.payment_details?.cardLastFour && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Payment Details</Title>
              {order.payment_details.cardHolder && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={18} color="#666" />
                  <Paragraph style={styles.infoText}>
                    {order.payment_details.cardHolder}
                  </Paragraph>
                </View>
              )}
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={18} color="#666" />
                <Paragraph style={styles.infoText}>
                  •••• •••• •••• {order.payment_details.cardLastFour}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        )}
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#F44336',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    borderRadius: 16,
    height: 32,
  },
  paymentChip: {
    borderRadius: 12,
    height: 22,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  productDivider: {
    marginVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
  },
  productTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  productTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059473',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059473',
  },
});
