import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {
  Title,
  Paragraph,
  Button,
  Card,
  Chip,
} from 'react-native-paper';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const result = await addToCart(product, quantity);
    if (result.success) {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: (Array.isArray(product.images) && product.images[0]) ? product.images[0] : 'https://via.placeholder.com/400x300'
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.productName}>{product.name}</Title>
          <Title style={styles.productPrice}>₪{product.price}</Title>
          
          {product.category && (
            <Chip style={styles.categoryChip}>{product.category}</Chip>
          )}
          
          <Paragraph style={styles.description}>
            {product.description || 'אין תיאור זמין למוצר זה.'}
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addButton}
            buttonColor="#059473"
          >
            הוסף לעגלה
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: width,
    height: 300,
  },
  detailsCard: {
    margin: 16,
    elevation: 4,
  },
  productName: {
    fontSize: 24,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#2196F3',
    marginBottom: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  addButton: {
    paddingVertical: 8,
  },
});
