import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'card';
}

export function ThemedView({ style, variant = 'default', ...props }: ThemedViewProps) {
  const theme = useTheme();
  
  const backgroundColors = {
    default: theme.background,
    secondary: theme.backgroundSecondary,
    tertiary: theme.backgroundTertiary,
    card: theme.card,
  };

  return (
    <View
      style={[{ backgroundColor: backgroundColors[variant] }, style]}
      {...props}
    />
  );
}