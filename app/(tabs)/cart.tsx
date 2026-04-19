import React, { useState, useRef, useEffect } from 'react';
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
import { CartItemComponent } from '@/components/shared/CartItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Gradients, Shadows } from '@/constants/Colors';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    cart,
    cartTotal,
    pointsToEarn,
    pointsToRedeem,
    setPointsToRedeem,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    processPayment,
    isProcessingPayment,
  } = useStore();

  const [applyingPoints, setApplyingPoints] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const maxPointsToRedeem = Math.min(
    user?.currentPoints || 0,
    Math.floor(cartTotal * 100) // Max redeem = cart total (1 point = $0.01)
  );

  const handleApplyPoints = () => {
    if (maxPointsToRedeem === 0) {
      Alert.alert('No Points Available', 'You need more points to redeem.');
      return;
    }

    setApplyingPoints(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Redeem Points',
      `You have ${user?.currentPoints || 0} points available.\n\nRedeem points? (100 points = $1.00)`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setApplyingPoints(false) },
        {
          text: 'Redeem All',
          onPress: () => {
            setPointsToRedeem(maxPointsToRedeem);
            setApplyingPoints(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleRemovePoints = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPointsToRedeem(0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await processPayment();

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Order Placed! 🎉',
        `Your order has been confirmed.\n\nYou earned ${pointsToEarn} points!\n\nPlease pay $${total.toFixed(2)} in cash at the counter.`,
        [
          {
            text: 'View Order',
            onPress: () => router.push('/(tabs)/activity'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.push('/(tabs)/'),
          },
        ]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Order Failed',
        'There was an issue processing your order. Please try again.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }
  };

  const handleClearCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCart();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const subtotal = cartTotal;
  const discount = pointsToRedeem * 0.01;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Cart</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add some delicious items to get started
          </Text>
          <Button
            title="Browse Menu"
            onPress={() => router.push('/(tabs)/')}
            icon="cafe"
            iconPosition="left"
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cart</Text>
        <Pressable onPress={handleClearCart}>
          <Text style={[styles.clearButton, { color: theme.error }]}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Cart Items */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Items ({cart.length})
            </Text>

            {cart.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateCartItemQuantity(item.id, qty)}
                onRemove={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeFromCart(item.id);
                }}
              />
            ))}
          </View>

          {/* Points Section */}
          <View style={styles.section}>
            <Card variant="elevated" padding="lg">
              <View style={styles.pointsHeader}>
                <View style={styles.pointsHeaderLeft}>
                  <Ionicons name="star" size={20} color={theme.accent} />
                  <Text style={[styles.pointsTitle, { color: theme.text }]}>Loyalty Points</Text>
                </View>
                <Badge
                  label={`${user?.currentPoints || 0} pts`}
                  variant="primary"
                  size="sm"
                />
              </View>

              {pointsToRedeem > 0 ? (
                <View style={styles.pointsApplied}>
                  <View style={styles.pointsAppliedLeft}>
                    <Text style={[styles.pointsAppliedText, { color: theme.success }]}>
                      {pointsToRedeem} points applied
                    </Text>
                    <Text style={[styles.pointsAppliedValue, { color: theme.success }]}>
                      -${discount.toFixed(2)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleRemovePoints}
                    style={[styles.removePointsButton, { backgroundColor: theme.errorLight }]}
                  >
                    <Ionicons name="close" size={16} color={theme.error} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.pointsInfo}>
                  <Text style={[styles.pointsInfoText, { color: theme.textSecondary }]}>
                    You'll earn {pointsToEarn} points with this order
                  </Text>
                  {maxPointsToRedeem > 0 && (
                    <Button
                      title="Apply Points"
                      onPress={handleApplyPoints}
                      variant="outline"
                      size="sm"
                      style={{ marginTop: 12 }}
                    />
                  )}
                </View>
              )}
            </Card>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
            <Card variant="elevated" padding="md">
              <View style={styles.paymentMethod}>
                <View style={styles.paymentMethodLeft}>
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: theme.successLight },
                    ]}
                  >
                    <Ionicons name="cash" size={20} color={theme.success} />
                  </View>
                  <View>
                    <Text style={[styles.paymentMethodName, { color: theme.text }]}>
                      Cash Payment
                    </Text>
                    <Text style={[styles.paymentMethodExpiry, { color: theme.textSecondary }]}>
                      Pay at counter upon pickup
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
            <Card variant="elevated" padding="lg">
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>

              {pointsToRedeem > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.success }]}>
                    Points Discount
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.success }]}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Tax (8%)
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ${tax.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Total (Cash)</Text>
                <Text style={[styles.totalValue, { color: theme.success }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>

              <View style={styles.earnBadge}>
                <Ionicons name="star" size={16} color={theme.accent} />
                <Text style={[styles.earnText, { color: theme.textSecondary }]}>
                  You'll earn {pointsToEarn} points
                </Text>
              </View>
            </Card>
          </View>

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={[styles.bottomBarLabel, { color: theme.textSecondary }]}>Pay Cash</Text>
            <Text style={[styles.bottomBarTotal, { color: theme.text }]}>
              ${total.toFixed(2)}
            </Text>
          </View>

          <Button
            title={isProcessingPayment ? 'Processing...' : 'Place Order'}
            onPress={handleCheckout}
            icon="checkmark-circle"
            iconPosition="left"
            size="lg"
            loading={isProcessingPayment}
            disabled={isProcessingPayment}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pointsApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pointsAppliedLeft: {},
  pointsAppliedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsAppliedValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  removePointsButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsInfo: {
    marginTop: 8,
  },
  pointsInfoText: {
    fontSize: 14,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentMethodExpiry: {
    fontSize: 13,
    marginTop: 2,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  earnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  earnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...Shadows.lg,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomBarLabel: {
    fontSize: 13,
  },
  bottomBarTotal: {
    fontSize: 24,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
});