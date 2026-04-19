import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Pressable,
  Animated,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  value,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? theme.error : theme.border, error ? theme.error : theme.primary],
  });

  const isPassword = secureTextEntry !== undefined;
  const actualSecureEntry = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      
      <Animated.View 
        style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.backgroundSecondary,
            borderColor: borderColor,
          },
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? theme.primary : theme.textTertiary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            icon && { paddingLeft: 0 },
          ]}
          placeholderTextColor={theme.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={actualSecureEntry}
          value={value}
          {...props}
        />
        
        {isPassword && (
          <Pressable 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={theme.textTertiary}
            />
          </Pressable>
        )}
        
        {rightIcon && !isPassword && (
          <Pressable 
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={theme.textTertiary}
            />
          </Pressable>
        )}
      </Animated.View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
  },
});