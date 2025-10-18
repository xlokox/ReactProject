import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  Searchbar,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import getProductImageSource from '../utils/image';


export default function ProductsScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || '');
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalProduct, setTotalProduct] = useState(0);
  const [parPage, setParPage] = useState(12);
  const { addToCart } = useCart();

  useEffect(() => {
    // Reset and load first page when filters change
    setProducts([]);
    setPageNumber(1);
    loadProducts({ reset: true, nextPage: 1 });
    loadCategories();
  }, [searchQuery, selectedCategory]);

  const buildQueryString = (page) => {
    const qs = new URLSearchParams({
      category: selectedCategory || '',
      searchValue: searchQuery || '',
      lowPrice: '0',
      highPrice: '100000',
      pageNumber: String(page),
      parPage: String(parPage)
    }).toString();
    return qs;
  };

  const loadProducts = async ({ reset = false, nextPage = 1 } = {}) => {
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      const qs = buildQueryString(nextPage);
      const response = await api.get(`/home/query-products?${qs}`);
      const list = Array.isArray(response.data?.products) ? response.data.products : [];
      const total = response.data?.totalProduct || 0;
      const per = response.data?.parPage || parPage;
      setTotalProduct(total);
      setParPage(per);
      setProducts(prev => (reset ? list : [...prev, ...list]));
      setPageNumber(nextPage);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/home/get-categorys');
      if (response.data?.categorys) {
        setCategories(response.data.categorys);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    // Show feedback
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Card style={styles.card}>
        <Image
          source={getProductImageSource(item)}
          style={styles.productImage}
          resizeMode="cover"
        />
        <Card.Content style={styles.productContent}>
          <Paragraph numberOfLines={2} style={styles.productName}>
            {item.name}
          </Paragraph>
          <Title style={styles.productPrice}>₪{item.price}</Title>
          <Paragraph style={styles.shippingText}>משלוח: ₪10</Paragraph>
          <Button
            mode="contained"
            compact
            onPress={() => handleAddToCart(item)}
            style={styles.addButton}
            buttonColor="#059473"
          >
            הוסף לעגלה
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategory = (category) => (
    <Chip
      key={category._id}
      selected={selectedCategory === category.name}
      onPress={() => setSelectedCategory(
        selectedCategory === category.name ? '' : category.name
      )}
      style={styles.categoryChip}
    >
      {category.name}
    </Chip>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="חפש מוצרים..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Chip
          selected={!selectedCategory}
          onPress={() => setSelectedCategory('')}
          style={styles.categoryChip}
        >
          הכל
        </Chip>
        {categories.map(renderCategory)}
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            const loaded = products.length;
            if (!loadingMore && loaded < totalProduct) {
              loadProducts({ nextPage: pageNumber + 1 });
            }
          }}
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color="#2196F3" />
            </View>
          ) : null}
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
  },
  card: {
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addButton: {
    marginTop: 4,
  },
});
