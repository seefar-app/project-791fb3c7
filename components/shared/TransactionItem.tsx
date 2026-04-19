import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const theme = useTheme();
  const isRedemption = transaction.pointsRedeemed > 0 && transaction.amount === 0;
  
  return (
    <Pressable 
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.card }, Shadows.sm]}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: isRedemption ? theme.successLight : theme.primaryLight }
      ]}>
        <Ionicons 
          name={isRedemption ? 'gift' : 'cafe'} 
          size={20} 
          color={isRedemption ? theme.success : theme.primary}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.storeName, { color: theme.text }]}>
          {transaction.storeName}
        </Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {format(transaction.timestamp, 'MMM d, h:mm a')}
        </Text>
        <Text style={[styles.items, { color: theme.textTertiary }]}>
          {transaction.items.map(i => i.menuItem.name).join(', ')}
        </Text>
      </View>
      
      <View style={styles.right}>
        {transaction.amount > 0 ? (
          <Text style={[styles.amount, { color: theme.text }]}>
            -${transaction.amount.toFixed(2)}
          </Text>
        ) : (
          <Text style={[styles.amount, { color: theme.success }]}>
            FREE
          </Text>
        )}
        
        <View style={styles.pointsRow}>
          {transaction.pointsEarned > 0 && (
            <View style={[styles.pointsBadge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.pointsText, { color: theme.success }]}>
                +{transaction.pointsEarned}
              </Text>
            </View>
          )}
          {transaction.pointsRedeemed > 0 && (
            <View style={[styles.pointsBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.pointsText, { color: theme.primary }]}>
                -{transaction.pointsRedeemed}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  items: {
    fontSize: 12,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pointsRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
  },
});