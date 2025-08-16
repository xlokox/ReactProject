import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { get_products, get_categorys } from '../store/reducers/homeReducer';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import FeatureProducts from '../components/FeatureProducts';
import Products from '../components/Products';
import Footer from '../components/Footer';
import ConnectionTest from '../components/ConnectionTest';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const {
    products,
    latest_product,
    topRated_product,
    discount_product
  } = useSelector((state) => state.home);

  useEffect(() => {
    dispatch(get_products());
    dispatch(get_categorys());
  }, [dispatch]);

  return (
    <ScrollView style={styles.container}>
      <Header navigation={navigation} />
      <ConnectionTest />
      <Banner />
      <Categories navigation={navigation} />

      <View style={styles.section}>
        {products && products.length > 0 && (
          <FeatureProducts products={products} navigation={navigation} />
        )}
      </View>

      <View style={styles.productsSection}>
        <View style={styles.productsGrid}>
          <View style={styles.productColumn}>
            {latest_product && latest_product.length > 0 && (
              <Products
                title="Latest Product"
                products={latest_product}
                navigation={navigation}
              />
            )}
          </View>

          <View style={styles.productColumn}>
            {topRated_product && topRated_product.length > 0 && (
              <Products
                title="Top Rated Product"
                products={topRated_product}
                navigation={navigation}
              />
            )}
          </View>

          <View style={styles.productColumn}>
            {discount_product && discount_product.length > 0 && (
              <Products
                title="Discount Product"
                products={discount_product}
                navigation={navigation}
              />
            )}
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    paddingVertical: 45,
  },
  productsSection: {
    paddingVertical: 40,
  },
  productsGrid: {
    width: '85%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productColumn: {
    width: '30%',
    marginBottom: 20,
  },
});
