import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * FloatingChatButton - A floating action button that opens the AI chatbot
 * This component can be added to any screen to provide quick access to the chatbot
 */
export default function FloatingChatButton({ style }) {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation to draw attention
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handlePress = () => {
    // Haptic feedback on press (if available)
    if (Platform.OS === 'ios') {
      // You can add haptic feedback here if needed
    }
    
    navigation.navigate('ChatBot');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={28} color="#fff" />
          {/* Notification badge (optional - can be connected to unread messages) */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059473',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
  },
});

