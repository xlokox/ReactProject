import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { get_card_products, reset_count } from '../store/reducers/cardReducer';

const { width } = Dimensions.get('window');

export default function Header({ navigation }) {
  const dispatch = useDispatch();
  const { categorys } = useSelector(state => state.home);
  const { userInfo } = useSelector(state => state.auth);
  const { card_product_count, wishlist_count } = useSelector(state => state.card);

  const [showSidebar, setShowSidebar] = useState(false);
  const [categoryShow, setCategoryShow] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');

  const search = () => {
    if (searchValue.trim()) {
      navigation.navigate('SearchProducts', { 
        category: category,
        searchValue: searchValue 
      });
    }
  };

  const redirectCardPage = () => {
    if (userInfo) {
      navigation.navigate('Cart');
    } else {
      navigation.navigate('Login');
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.id) {
      dispatch(get_card_products(userInfo.id));
    } else {
      dispatch(reset_count());
    }
  }, [userInfo, dispatch]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#ffffff" />
              <Text style={styles.contactText}>support@ecommerce.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={styles.contactText}>+1234567890</Text>
            </View>
          </View>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-facebook" size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-linkedin" size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-github" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.mainHeaderContent}>
          {/* Logo */}
          <TouchableOpacity 
            style={styles.logo}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.logoText}>E-Commerce</Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => setCategoryShow(!categoryShow)}
              >
                <Text style={styles.categoryButtonText}>
                  {category || 'All Category'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.searchInput}
                placeholder="What do you need"
                value={searchValue}
                onChangeText={setSearchValue}
                onSubmitEditing={search}
              />
              
              <TouchableOpacity style={styles.searchButton} onPress={search}>
                <Ionicons name="search" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Actions */}
          <View style={styles.userActions}>
            {userInfo ? (
              <TouchableOpacity 
                style={styles.userButton}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Ionicons name="person" size={20} color="#059473" />
                <Text style={styles.userButtonText}>{userInfo.name}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.userButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="lock-closed" size={20} color="#059473" />
                <Text style={styles.userButtonText}>Login</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="heart" size={20} color="#059473" />
              {wishlist_count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlist_count}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={redirectCardPage}>
              <Ionicons name="bag" size={20} color="#059473" />
              {card_product_count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{card_product_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Dropdown */}
      {categoryShow && (
        <View style={styles.categoryDropdown}>
          <ScrollView style={styles.categoryList}>
            <TouchableOpacity 
              style={styles.categoryItem}
              onPress={() => {
                setCategory('');
                setCategoryShow(false);
              }}
            >
              <Text style={styles.categoryItemText}>All Category</Text>
            </TouchableOpacity>
            {categorys.map((cat, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.categoryItem}
                onPress={() => {
                  setCategory(cat.name);
                  setCategoryShow(false);
                }}
              >
                <Text style={styles.categoryItemText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  topHeader: {
    backgroundColor: '#059473',
    paddingVertical: 8,
  },
  topHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contactInfo: {
    flexDirection: 'row',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  contactText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 4,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialIcon: {
    marginLeft: 12,
  },
  mainHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mainHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    marginRight: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059473',
  },
  searchContainer: {
    flex: 1,
    marginRight: 20,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  userButtonText: {
    fontSize: 14,
    color: '#059473',
    marginLeft: 4,
  },
  iconButton: {
    position: 'relative',
    marginLeft: 16,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 0,
    maxHeight: 200,
    zIndex: 1000,
  },
  categoryList: {
    maxHeight: 200,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#374151',
  },
});
