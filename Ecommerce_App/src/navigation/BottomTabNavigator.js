import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size, badgeCount }) => (
  <View style={{ position: 'relative' }}>
    <Ionicons name={name} size={size} color={color} />
    {badgeCount > 0 && (
      <View style={{
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
        }}>
          {badgeCount}
        </Text>
      </View>
    )}
  </View>
);

export default function BottomTabNavigator() {
  const { card_product_count } = useSelector(state => state.card);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let badgeCount = 0;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
            badgeCount = card_product_count;
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <TabBarIcon
              name={iconName}
              color={color}
              size={size}
              badgeCount={badgeCount}
            />
          );
        },
        tabBarActiveTintColor: '#059473',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Shop'
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart'
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders'
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Account'
        }}
      />
    </Tab.Navigator>
  );
}
