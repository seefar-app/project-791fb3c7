import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient' | 'outline';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  gradientColors?: readonly [string, string, ...string[]];
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'md',
  gradientColors,
}: CardProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const paddingSizes = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 24,
  };

  const baseStyle: ViewStyle = {
    borderRadius: 24,
    padding: paddingSizes[padding],
    overflow: 'hidden',
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: theme.card, ...Shadows.sm },
    elevated: { backgroundColor: theme.card, ...Shadows.lg },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
    gradient: {},
  };

  const content = variant === 'gradient' && gradientColors ? (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[baseStyle, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[baseStyle, variantStyles[variant], style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return content;
}