import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';

/**
 * GlobalFloatingChatButton - A floating chat button that appears on all screens
 * Follows the user as they navigate and scroll through the app
 */
export default function GlobalFloatingChatButton() {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(true);

  // Get current route name safely
  const currentRouteName = useNavigationState(state => {
    if (!state) return null;
    const route = state.routes[state.index];
    return route?.name;
  });

  useEffect(() => {
    // Hide on ChatBot screen to avoid confusion
    if (currentRouteName) {
      setIsVisible(currentRouteName !== 'ChatBot');
    }
  }, [currentRouteName]);

  useEffect(() => {
    if (!isVisible) return;

    // Pulse animation to draw attention
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [isVisible]);

  const handlePress = () => {
    // Haptic feedback on press (if available)
    if (Platform.OS === 'ios') {
      // You can add haptic feedback here if needed
    }
    
    navigation.navigate('ChatBot');
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
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
          {/* Notification badge */}
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
    bottom: 90, // Above bottom navigation
    right: 20,
    zIndex: 9999, // Very high z-index to appear above everything
    elevation: 10, // Android shadow
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
