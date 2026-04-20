import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  style?: ViewStyle;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showStatus = false,
  status = 'online',
  style,
}: AvatarProps) {
  const theme = useTheme();
  
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };
  
  const statusSizes = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  };
  
  const fontSizes = {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };
  
  const currentSize = sizes[size];
  const statusSize = statusSizes[size];
  
  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const statusColors = {
    online: '#10b981',
    offline: '#9ca3af',
    away: '#f59e0b',
  };

  // Add cache busting to source URL if it doesn't already have a timestamp
  const getCacheBustedSource = () => {
    if (!source) return undefined;
    
    // If URL already has timestamp parameter, use as is
    if (source.includes('?t=')) {
      return source;
    }
    
    // Add timestamp parameter to force cache refresh
    const separator = source.includes('?') ? '&' : '?';
    return `${source}${separator}t=${Date.now()}`;
  };

  const imageSource = getCacheBustedSource();

  return (
    <View style={[{ width: currentSize, height: currentSize }, style]}>
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={[
            styles.image,
            { width: currentSize, height: currentSize, borderRadius: currentSize / 2 },
          ]}
          contentFit="cover"
          transition={200}
          cachePolicy="none"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: currentSize,
              height: currentSize,
              borderRadius: currentSize / 2,
              backgroundColor: theme.primary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: fontSizes[size], color: '#fff' }]}>
            {getInitials()}
          </Text>
        </View>
      )}
      
      {showStatus && (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: statusColors[status],
              borderColor: theme.background,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e5e7eb',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});