import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Gradients, Shadows } from '@/constants/Colors';
import { TIER_INFO } from '@/constants/Data';
import { TierLevel } from '@/types';

interface PointsCardProps {
  currentPoints: number;
  tierLevel: TierLevel;
  totalEarned: number;
}

export function PointsCard({ currentPoints, tierLevel, totalEarned }: PointsCardProps) {
  const tier = TIER_INFO[tierLevel];
  const nextTier = tierLevel === 'platinum' ? null : 
    tierLevel === 'gold' ? TIER_INFO.platinum :
    tierLevel === 'silver' ? TIER_INFO.gold : TIER_INFO.silver;
  
  const progress = nextTier 
    ? Math.min(1, (totalEarned - tier.minPoints) / (nextTier.minPoints - tier.minPoints))
    : 1;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Pulse animation for points
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <LinearGradient
      colors={Gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, Shadows.xl]}
    >
      <View style={styles.header}>
        <View style={styles.tierBadge}>
          <Ionicons name={tier.icon as any} size={16} color={tier.color} />
          <Text style={styles.tierName}>{tier.name}</Text>
        </View>
        <Text style={styles.multiplier}>{tier.multiplier}x Points</Text>
      </View>
      
      <Animated.View style={[styles.pointsContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.pointsLabel}>Available Points</Text>
        <Text style={styles.points}>{currentPoints.toLocaleString()}</Text>
      </Animated.View>
      
      {nextTier && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {totalEarned.toLocaleString()} / {nextTier.minPoints.toLocaleString()} pts
            </Text>
            <Text style={styles.progressText}>Next: {nextTier.name}</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
        </View>
      )}
      
      {tierLevel === 'platinum' && (
        <View style={styles.maxTier}>
          <Ionicons name="diamond" size={16} color="#fbbf24" />
          <Text style={styles.maxTierText}>You've reached the highest tier!</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  multiplier: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  points: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  maxTier: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  maxTierText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});