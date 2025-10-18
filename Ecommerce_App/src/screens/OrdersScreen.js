import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Chip,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      console.log('📦 Loading orders for user:', user.id);

      // Fetch all orders for the authenticated user
      const response = await api.get(`/home/customer/get-orders/${user.id}/all`);

      console.log('✅ Orders loaded:', response.data);

      if (response.data?.orders) {
        // Sort orders by creation date (most recent first)
        const sortedOrders = response.data.orders.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderNumberContainer}>
              <Ionicons name="receipt-outline" size={20} color="#059473" />
              <Title style={styles.orderNumber}>{item.orderNumber}</Title>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.delivery_status) }]}
              textStyle={{ color: 'white', fontSize: 12 }}
            >
              {getStatusLabel(item.delivery_status)}
            </Chip>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Paragraph style={styles.orderDate}>
                {moment(item.createdAt).format('MMM DD, YYYY')}
              </Paragraph>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={16} color="#666" />
              <Paragraph style={styles.orderItems}>
                {item.products?.length || 0} item{item.products?.length !== 1 ? 's' : ''}
              </Paragraph>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View>
              <Paragraph style={styles.totalLabel}>Total Amount</Paragraph>
              <Title style={styles.orderTotal}>${item.price?.toFixed(2)}</Title>
            </View>

            <Chip
              style={[styles.paymentChip, { backgroundColor: getPaymentStatusColor(item.payment_status) }]}
              textStyle={{ color: 'white', fontSize: 11 }}
            >
              {item.payment_status?.toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Title style={styles.emptyTitle}>No Orders Yet</Title>
      <Paragraph style={styles.emptyText}>
        You haven't placed any orders yet.
      </Paragraph>
      <Paragraph style={styles.emptyText}>
        Start shopping to see your orders here!
      </Paragraph>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059473" />
        <Paragraph style={styles.loadingText}>Loading your orders...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Order History</Title>
        <Paragraph style={styles.headerSubtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Paragraph>
      </View>

      {orders.length === 0 ? (
        renderEmptyOrders()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#059473']}
            />
          }
        />
      )}
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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
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
  ordersList: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    borderRadius: 16,
    height: 28,
  },
  orderInfo: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDate: {
    color: '#666',
    fontSize: 14,
  },
  orderItems: {
    color: '#666',
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderTotal: {
    color: '#059473',
    fontSize: 22,
    fontWeight: 'bold',
  },
  paymentChip: {
    borderRadius: 12,
    height: 24,
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
    fontSize: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
});
