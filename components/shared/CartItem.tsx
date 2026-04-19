import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Image
        source={{ uri: item.menuItem.image }}
        style={styles.image}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {item.menuItem.name}
        </Text>
        
        {item.customizations.length > 0 && (
          <Text style={[styles.customizations, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.customizations.map(c => c.options.join(', ')).join(' • ')}
          </Text>
        )}
        
        <Text style={[styles.price, { color: theme.primary }]}>
          ${item.subtotal.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <Pressable 
          onPress={onRemove}
          style={[styles.removeButton, { backgroundColor: theme.errorLight }]}
        >
          <Ionicons name="trash-outline" size={16} color={theme.error} />
        </Pressable>
        
        <View style={[styles.quantityControls, { backgroundColor: theme.backgroundSecondary }]}>
          <Pressable 
            onPress={() => onUpdateQuantity(item.quantity - 1)}
            style={styles.quantityButton}
          >
            <Ionicons name="remove" size={18} color={theme.text} />
          </Pressable>
          
          <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
          
          <Pressable 
            onPress={() => onUpdateQuantity(item.quantity + 1)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  customizations: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
});