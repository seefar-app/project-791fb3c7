import React, { useRef } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Shadows } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizes = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, iconSize: 24 },
  };
  
  const currentSize = sizes[size];
  const isDisabled = disabled || loading;

  const renderContent = () => {
    const textColor = variant === 'primary' || variant === 'destructive' 
      ? '#fff' 
      : variant === 'outline' || variant === 'ghost'
        ? theme.primary
        : theme.text;
    
    return (
      <>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={currentSize.iconSize} 
                color={textColor}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[
              styles.text,
              { fontSize: currentSize.fontSize, color: textColor }
            ]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={currentSize.iconSize} 
                color={textColor}
                style={{ marginLeft: 8 }}
              />
            )}
          </>
        )}
      </>
    );
  };

  const buttonStyle: ViewStyle = {
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }, style]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[buttonStyle, Shadows.lg]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: theme.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: theme.error },
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[buttonStyle, variantStyles[variant], variant !== 'ghost' && Shadows.sm]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
});