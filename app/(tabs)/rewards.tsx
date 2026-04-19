import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RewardCard } from '@/components/shared/RewardCard';
import { TIER_INFO } from '@/constants/Data';
import { Gradients, Shadows } from '@/constants/Colors';

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, updateUser } = useAuthStore();
  const { rewards, userRedemptions, fetchRewards, redeemReward } = useStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchRewards();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const currentTier = TIER_INFO[user?.tierLevel || 'bronze'];
  const activeRedemptions = userRedemptions.filter(r => r.status === 'active');
  
  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (!user || user.currentPoints < reward.pointsRequired) return;
    
    Alert.alert(
      'Redeem Reward',
      `Are you sure you want to redeem ${reward.name} for ${reward.pointsRequired} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            const redemption = await redeemReward(reward);
            if (redemption) {
              updateUser({ 
                currentPoints: user.currentPoints - reward.pointsRequired 
              });
              Alert.alert(
                '🎉 Redeemed!',
                `Your code is: ${redemption.code}\n\nShow this code at checkout to claim your reward.`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={Gradients.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Rewards</Text>
        <Text style={styles.headerSubtitle}>Redeem your points for amazing perks</Text>
        
        <View style={styles.pointsDisplay}>
          <View style={styles.pointsCircle}>
            <Text style={styles.pointsValue}>{user?.currentPoints || 0}</Text>
            <Text style={styles.pointsLabel}>Available</Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Tier Card */}
          <View style={styles.section}>
            <Card 
              variant="elevated" 
              style={[styles.tierCard, { borderLeftColor: currentTier.color, borderLeftWidth: 4 }]}
            >
              <View style={styles.tierHeader}>
                <View style={[styles.tierIcon, { backgroundColor: currentTier.color + '20' }]}>
                  <Ionicons name={currentTier.icon as any} size={24} color={currentTier.color} />
                </View>
                <View style={styles.tierInfo}>
                  <Text style={[styles.tierName, { color: theme.text }]}>{currentTier.name}</Text>
                  <Text style={[styles.tierMultiplier, { color: theme.primary }]}>
                    {currentTier.multiplier}x Points on every purchase
                  </Text>
                </View>
              </View>
              
              <View style={styles.perksContainer}>
                <Text style={[styles.perksTitle, { color: theme.textSecondary }]}>Your Perks</Text>
                {currentTier.perks.map((perk, index) => (
                  <View key={index} style={styles.perkItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={[styles.perkText, { color: theme.text }]}>{perk}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
          
          {/* Active Redemptions */}
          {activeRedemptions.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🎁 Your Active Rewards
              </Text>
              
              {activeRedemptions.map(redemption => (
                <Card key={redemption.id} variant="elevated" style={styles.redemptionCard}>
                  <View style={styles.redemptionHeader}>
                    <Text style={[styles.redemptionName, { color: theme.text }]}>
                      {redemption.reward.name}
                    </Text>
                    <Badge label="Active" variant="success" />
                  </View>
                  
                  <View style={[styles.codeContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>Reward Code</Text>
                    <Text style={[styles.codeText, { color: theme.primary }]}>{redemption.code}</Text>
                  </View>
                  
                  <Text style={[styles.expiryText, { color: theme.textTertiary }]}>
                    Expires: {new Date(redemption.expiryDate).toLocaleDateString()}
                  </Text>
                </Card>
              ))}
            </View>
          )}
          
          {/* Available Rewards */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ⭐ Available Rewards
            </Text>
            
            {rewards.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                currentPoints={user?.currentPoints || 0}
                onPress={() => handleRedeem(reward)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  pointsDisplay: {
    alignItems: 'center',
    marginTop: 24,
  },
  pointsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  pointsLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  tierCard: {
    marginTop: -50,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    marginLeft: 14,
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700',
  },
  tierMultiplier: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  perksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  perksTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perkText: {
    fontSize: 14,
    marginLeft: 8,
  },
  redemptionCard: {
    marginBottom: 12,
  },
  redemptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  redemptionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  codeContainer: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});