import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'sale',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=2940&q=80',
    title: 'Our Latest Deals',
    action: { type: 'sale' }
  },
  {
    id: 'electronics',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2940&q=80',
    title: 'Our Newst Electronics',
    action: { type: 'category', category: 'Electronics' }
  },
  {
    id: 'toys',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1600&q=80',
    title: 'Our Newst Toys',
    action: { type: 'category', category: 'Toys' }
  }
];

export default function Banner({ navigation }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (index + 1) % SLIDES.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, 3000);
    return () => clearInterval(t);
  }, [index]);

  const onPressSlide = (slide) => {
    if (!navigation) return;
    if (slide.action?.type === 'category') {
      navigation.navigate({ name: 'Products', params: { category: slide.action.category, fromCategory: true }, merge: true });
    } else if (slide.action?.type === 'sale') {
      navigation.navigate({ name: 'Products', merge: true });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressSlide(item)}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.overlayText} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Highlights</Text>
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 40,
  },
  carouselWrapper: {
    maxWidth: width * 0.94,
    alignSelf: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: width * 0.9,
    alignSelf: 'center',
  },
  textContent: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContent: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
});
