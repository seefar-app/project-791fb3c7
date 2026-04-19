import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const theme = useTheme();
  
  const colors = {
    default: { bg: theme.backgroundSecondary, text: theme.textSecondary },
    success: { bg: theme.successLight, text: theme.success },
    warning: { bg: theme.warningLight, text: theme.warning },
    error: { bg: theme.errorLight, text: theme.error },
    info: { bg: theme.infoLight, text: theme.info },
    primary: { bg: theme.primaryLight, text: theme.primaryDark },
  };
  
  const currentColors = colors[variant];
  
  const padding = size === 'sm' ? { paddingHorizontal: 8, paddingVertical: 2 } : { paddingHorizontal: 12, paddingVertical: 4 };
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <View style={[styles.badge, padding, { backgroundColor: currentColors.bg }, style]}>
      <Text style={[styles.text, { color: currentColors.text, fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});