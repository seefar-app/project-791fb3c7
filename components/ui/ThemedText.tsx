import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'inverse' | 'primary';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function ThemedText({ 
  style, 
  variant = 'default', 
  size = 'base',
  weight = 'normal',
  ...props 
}: ThemedTextProps) {
  const theme = useTheme();
  
  const textColors = {
    default: theme.text,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    inverse: theme.textInverse,
    primary: theme.primary,
  };
  
  const fontSizes = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  };
  
  const fontWeights: Record<string, '400' | '500' | '600' | '700'> = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  return (
    <Text
      style={[
        { 
          color: textColors[variant],
          fontSize: fontSizes[size],
          fontWeight: fontWeights[weight],
        },
        style,
      ]}
      {...props}
    />
  );
}