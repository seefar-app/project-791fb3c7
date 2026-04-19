import React, { useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { Avatar } from '@/components/ui/Avatar';
import { TIER_INFO } from '@/constants/Data';
import { Gradients, Shadows } from '@/constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { paymentMethods } = useStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const currentTier = TIER_INFO[user?.tierLevel || 'bronze'];
  
  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/edit');
  };
  
  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Personal Information',
      sublabel: 'Update your profile details',
      onPress: handleEditProfile,
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      sublabel: `${paymentMethods.length} cards saved`,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      sublabel: 'Manage push notifications',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      icon: 'location-outline',
      label: 'Saved Locations',
      sublabel: 'Home, Work, Favorites',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy & Security',
      sublabel: 'Data and security settings',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      sublabel: 'FAQs and contact us',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Policies',
      sublabel: 'Legal information',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.profileSection}>
            <Avatar 
              source={user?.avatar}
              name={user?.name}
              size="xl"
            />
            <Text style={styles.userName}>{user?.name || 'Coffee Lover'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            <View style={styles.tierBadge}>
              <Ionicons name={currentTier.icon as any} size={16} color={currentTier.color} />
              <Text style={styles.tierText}>{currentTier.name}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.currentPoints || 0}</Text>
              <Text style={styles.statName}>Points</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.totalPointsEarned || 0}</Text>
              <Text style={styles.statName}>Lifetime</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentTier.multiplier}x</Text>
              <Text style={styles.statName}>Bonus</Text>
            </View>
          </View>
        </LinearGradient>
        
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="qr-code" size={22} color={theme.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>My QR</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.successLight }]}>
                <Ionicons name="people" size={22} color={theme.success} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>Refer</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.warningLight }]}>
                <Ionicons name="star" size={22} color={theme.warning} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>Rate Us</Text>
            </Pressable>
          </View>
          
          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.onPress}
                style={[styles.menuItem, { backgroundColor: theme.card }, Shadows.sm]}
              >
                <View style={[styles.menuIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Ionicons name={item.icon as any} size={22} color={theme.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>
                    {item.sublabel}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>
          
          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.errorLight }]}
          >
            <Ionicons name="log-out-outline" size={22} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
          </Pressable>
          
          {/* App Version */}
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            BrewRewards v1.0.0
          </Text>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileSection: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  tierText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 24,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});