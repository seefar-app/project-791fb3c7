import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuItem } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { Shadows } from '@/constants/Colors';

interface MenuCardProps {
  item: MenuItem;
  onPress: () => void;
  variant?: 'default' | 'horizontal' | 'featured';
}

export function MenuCard({ item, onPress, variant = 'default' }: MenuCardProps) {
  const theme = useTheme();

  if (variant === 'featured') {
    return (
      <Pressable onPress={onPress} style={[styles.featuredCard, Shadows.lg]}>
        <Image
          source={{ uri: item.image }}
          style={styles.featuredImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.featuredGradient}
        >
          {item.popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
          <View style={styles.featuredContent}>
            <Text style={styles.featuredName}>{item.name}</Text>
            <Text style={styles.featuredDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.featuredPrice}>${item.price.toFixed(2)}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Pressable 
        onPress={onPress} 
        style={[styles.horizontalCard, { backgroundColor: theme.card }, Shadows.sm]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.horizontalImage}
          contentFit="cover"
        />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalHeader}>
            <Text style={[styles.horizontalName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.popular && <Badge label="Popular" variant="primary" size="sm" />}
          </View>
          <Text style={[styles.horizontalDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.horizontalFooter}>
            <Text style={[styles.horizontalPrice, { color: theme.primary }]}>
              ${item.price.toFixed(2)}
            </Text>
            <Text style={[styles.calories, { color: theme.textTertiary }]}>
              {item.calories} cal
            </Text>
          </View>
        </View>
        <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Ionicons name="add" size={20} color="#fff" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.card, { backgroundColor: theme.card }, Shadows.md]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        contentFit="cover"
      />
      {item.popular && (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Ionicons name="flame" size={10} color="#000" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.cardPrice, { color: theme.primary }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Featured variant
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredContent: {},
  featuredName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  featuredPrice: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  
  // Horizontal variant
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  horizontalContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  horizontalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  horizontalDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  horizontalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  calories: {
    fontSize: 12,
    marginLeft: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Default variant
  card: {
    width: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
});