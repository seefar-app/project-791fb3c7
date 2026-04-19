import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shadows } from '@/constants/Colors';
import { CartItem } from '@/types';

const { width, height } = Dimensions.get('window');

export default function MenuItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { addToCart, menuItems, fetchMenu, isLoadingMenu } = useStore();
  
  // Find item from store's menuItems (fetched from Supabase)
  const item = menuItems.find(m => m.id === id);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Fetch menu if not already loaded
    if (menuItems.length === 0) {
      fetchMenu();
    }
  }, []);
  
  useEffect(() => {
    if (item) {
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
      
      // Initialize default selections for required customizations
      if (item.customizations) {
        const defaults: Record<string, string[]> = {};
        item.customizations.forEach(cust => {
          if (cust.required && cust.options.length > 0) {
            defaults[cust.id] = [cust.options[0].id];
          }
        });
        setSelectedOptions(defaults);
      }
    }
  }, [item]);
  
  // Show loading state while fetching menu
  if (isLoadingMenu) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading menu...</Text>
      </View>
    );
  }
  
  // Show not found if item doesn't exist after loading
  if (!item) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.textTertiary} />
        <Text style={[styles.notFoundTitle, { color: theme.text }]}>Item Not Found</Text>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          This menu item is not available or has been removed.
        </Text>
        <Button
          title="Back to Menu"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }
  
  const handleOptionSelect = (customizationId: string, optionId: string, maxSelections: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedOptions(prev => {
      const current = prev[customizationId] || [];
      
      if (maxSelections === 1) {
        return { ...prev, [customizationId]: [optionId] };
      }
      
      if (current.includes(optionId)) {
        return { ...prev, [customizationId]: current.filter(id => id !== optionId) };
      }
      
      if (current.length >= maxSelections) {
        return { ...prev, [customizationId]: [...current.slice(1), optionId] };
      }
      
      return { ...prev, [customizationId]: [...current, optionId] };
    });
  };
  
  const calculateTotal = () => {
    let total = item.price;
    
    if (item.customizations) {
      item.customizations.forEach(cust => {
        const selected = selectedOptions[cust.id] || [];
        cust.options.forEach(opt => {
          if (selected.includes(opt.id)) {
            total += opt.priceModifier;
          }
        });
      });
    }
    
    return total * quantity;
  };
  
  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const customizations: CartItem['customizations'] = [];
    
    if (item.customizations) {
      item.customizations.forEach(cust => {
        const selected = selectedOptions[cust.id] || [];
        if (selected.length > 0) {
          const selectedOpts = cust.options.filter(o => selected.includes(o.id));
          const extraCost = selectedOpts.reduce((sum, o) => sum + o.priceModifier, 0);
          customizations.push({
            name: cust.name,
            options: selectedOpts.map(o => o.name),
            extraCost,
          });
        }
      });
    }
    
    addToCart(item, quantity, customizations);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Image Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent']}
          style={styles.imageGradient}
        />
        
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 10 }]}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        
        {item.popular && (
          <View style={[styles.popularBadge, { top: insets.top + 10 }]}>
            <Ionicons name="flame" size={14} color="#fff" />
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      
      <Animated.View 
        style={[
          styles.content,
          { 
            backgroundColor: theme.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
            
            <View style={styles.metaRow}>
              <Badge label={`${item.calories} cal`} variant="default" />
              <Text style={[styles.price, { color: theme.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
          </View>
          
          {/* Customizations */}
          {item.customizations?.map(customization => (
            <View key={customization.id} style={styles.customizationSection}>
              <View style={styles.customizationHeader}>
                <Text style={[styles.customizationTitle, { color: theme.text }]}>
                  {customization.name}
                </Text>
                {customization.required && (
                  <Badge label="Required" variant="primary" size="sm" />
                )}
              </View>
              
              <View style={styles.optionsGrid}>
                {customization.options.map(option => {
                  const isSelected = (selectedOptions[customization.id] || []).includes(option.id);
                  
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => handleOptionSelect(
                        customization.id, 
                        option.id, 
                        customization.maxSelections
                      )}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
                          borderColor: isSelected ? theme.primary : theme.border,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.optionName,
                        { color: isSelected ? '#fff' : theme.text }
                      ]}>
                        {option.name}
                      </Text>
                      {option.priceModifier > 0 && (
                        <Text style={[
                          styles.optionPrice,
                          { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                        ]}>
                          +${option.priceModifier.toFixed(2)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
          
          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: theme.text }]}>Quantity</Text>
            
            <View style={[styles.quantityControls, { backgroundColor: theme.backgroundSecondary }]}>
              <Pressable
                onPress={() => {
                  if (quantity > 1) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity(q => q - 1);
                  }
                }}
                style={styles.quantityButton}
              >
                <Ionicons 
                  name="remove" 
                  size={24} 
                  color={quantity > 1 ? theme.text : theme.textTertiary} 
                />
              </Pressable>
              
              <Text style={[styles.quantityValue, { color: theme.text }]}>{quantity}</Text>
              
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity(q => q + 1);
                }}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={24} color={theme.text} />
              </Pressable>
            </View>
          </View>
          
          <View style={{ height: 150 }} />
        </ScrollView>
      </Animated.View>
      
      {/* Bottom Action Bar */}
      <View style={[
        styles.bottomBar, 
        { 
          backgroundColor: theme.card,
          paddingBottom: insets.bottom + 16,
        }
      ]}>
        <View style={styles.totalSection}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>
            ${calculateTotal().toFixed(2)}
          </Text>
          <Text style={[styles.pointsEarn, { color: theme.success }]}>
            +{Math.floor(calculateTotal() * 2)} pts
          </Text>
        </View>
        
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          icon="cart"
          iconPosition="left"
          size="lg"
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  customizationSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  customizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customizationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 12,
    marginTop: 2,
  },
  quantitySection: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...Shadows.lg,
  },
  totalSection: {},
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  pointsEarn: {
    fontSize: 12,
    fontWeight: '600',
  },
});