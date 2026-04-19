import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TIER_INFO } from '@/constants/Data';
import { Gradients, Shadows } from '@/constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { paymentMethods } = useStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    if (showEditModal) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 600,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showEditModal]);
  
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
  
  const openEditModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setErrors({ name: '', email: '', phone: '' });
    setShowEditModal(true);
  };
  
  const closeEditModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditModal(false);
  };
  
  const validateForm = (): boolean => {
    const newErrors = { name: '', email: '', phone: '' };
    let isValid = true;
    
    // Name validation
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (editForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    // Email validation
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    // Phone validation
    if (!editForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[\d\s\-()]+$/.test(editForm.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    } else if (editForm.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const success = await updateProfile({
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
    });
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your profile has been updated successfully!');
      setShowEditModal(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Personal Information',
      sublabel: 'Update your profile details',
      onPress: openEditModal,
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
      
      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="none"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Animated.View 
            style={[
              styles.modalBackdrop,
              { opacity: backdropAnim }
            ]}
          >
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={closeEditModal} 
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                backgroundColor: theme.card,
                transform: [{ translateY: slideAnim }],
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Edit Profile
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Update your personal information
                </Text>
              </View>
              <Pressable onPress={closeEditModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
            
            <ScrollView 
              style={styles.modalForm}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Input
                label="Full Name"
                placeholder="Enter your name"
                icon="person-outline"
                value={editForm.name}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, name: text });
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                error={errors.name}
                autoCapitalize="words"
                editable={!isLoading}
              />
              
              <Input
                label="Email Address"
                placeholder="Enter your email"
                icon="mail-outline"
                value={editForm.email}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, email: text });
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              
              <Input
                label="Phone Number"
                placeholder="Enter your phone"
                icon="call-outline"
                value={editForm.phone}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, phone: text });
                  if (errors.phone) {
                    setErrors({ ...errors, phone: '' });
                  }
                }}
                error={errors.phone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={closeEditModal}
                  variant="outline"
                  style={{ flex: 1 }}
                  disabled={isLoading}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={isLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
});