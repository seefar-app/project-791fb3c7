import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Reward } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface RewardCardProps {
  reward: Reward;
  currentPoints: number;
  onPress: () => void;
}

export function RewardCard({ reward, currentPoints, onPress }: RewardCardProps) {
  const theme = useTheme();
  const canRedeem = currentPoints >= reward.pointsRequired;
  
  return (
    <Pressable 
      onPress={canRedeem ? onPress : undefined}
      style={[
        styles.container, 
        { backgroundColor: theme.card, opacity: canRedeem ? 1 : 0.6 },
        Shadows.md
      ]}
    >
      <Image
        source={{ uri: reward.image }}
        style={styles.image}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {reward.name}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {reward.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={[styles.pointsBadge, { backgroundColor: canRedeem ? theme.primary : theme.border }]}>
            <Ionicons name="star" size={12} color={canRedeem ? '#fff' : theme.textTertiary} />
            <Text style={[styles.points, { color: canRedeem ? '#fff' : theme.textTertiary }]}>
              {reward.pointsRequired}
            </Text>
          </View>
          
          {!canRedeem && (
            <Text style={[styles.needed, { color: theme.textTertiary }]}>
              Need {reward.pointsRequired - currentPoints} more
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  points: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  needed: {
    fontSize: 11,
    marginLeft: 8,
  },
});