import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { Gradients } from '@/constants/Colors';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoadingTransactions } = useStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchTransactions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };
  
  // Calculate stats
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPointsEarned = transactions.reduce((sum, t) => sum + t.pointsEarned, 0);
  const totalRedeemed = transactions.reduce((sum, t) => sum + t.pointsRedeemed, 0);
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(transaction.timestamp, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={Gradients.coral}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Activity</Text>
        <Text style={styles.headerSubtitle}>Your transaction history</Text>
      </LinearGradient>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="wallet" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${totalSpent.toFixed(2)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Spent
              </Text>
            </Card>
            
            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.successLight }]}>
                <Ionicons name="trending-up" size={20} color={theme.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalPointsEarned}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Points Earned
              </Text>
            </Card>
            
            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.warningLight }]}>
                <Ionicons name="gift" size={20} color={theme.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalRedeemed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Redeemed
              </Text>
            </Card>
          </View>
          
          {/* Transaction List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Transactions
            </Text>
            
            {isLoadingTransactions ? (
              [1, 2, 3].map(i => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Skeleton height={100} borderRadius={20} />
                </View>
              ))
            ) : transactions.length > 0 ? (
              Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                <View key={date}>
                  <Text style={[styles.dateHeader, { color: theme.textTertiary }]}>
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </Text>
                  {dateTransactions.map(transaction => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Ionicons name="receipt-outline" size={48} color={theme.textTertiary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Make your first purchase to start earning points!
                </Text>
              </View>
            )}
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
    paddingBottom: 24,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
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
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});