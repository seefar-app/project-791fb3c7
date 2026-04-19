import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { MenuCard } from '@/components/shared/MenuCard';
import { PointsCard } from '@/components/shared/PointsCard';
import { MENU_CATEGORIES, TIER_INFO } from '@/constants/Data';
import { Gradients, Shadows } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { 
    menuItems, 
    selectedCategory, 
    setSelectedCategory,
    fetchMenu, 
    isLoadingMenu,
    cart,
  } = useStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchMenu();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  };
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);
  
  const popularItems = menuItems.filter(item => item.popular);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Coffee Lover'}</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable 
                style={styles.cartButton}
                onPress={() => router.push('/checkout')}
              >
                <Ionicons name="cart-outline" size={24} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>
              <Avatar 
                source={user?.avatar} 
                name={user?.name}
                size="md"
              />
            </View>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.currentPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{TIER_INFO[user?.tierLevel || 'bronze'].multiplier}x</Text>
              <Text style={styles.statLabel}>Multiplier</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalPointsEarned || 0}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>
        </LinearGradient>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Points Card */}
          <View style={styles.pointsCardContainer}>
            <PointsCard
              currentPoints={user?.currentPoints || 0}
              tierLevel={user?.tierLevel || 'bronze'}
              totalEarned={user?.totalPointsEarned || 0}
            />
          </View>
          
          {/* Popular Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🔥 Popular Right Now
              </Text>
              <Pressable>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
              </Pressable>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScroll}
            >
              {isLoadingMenu ? (
                [1, 2].map(i => (
                  <View key={i} style={{ width: 280, marginRight: 16 }}>
                    <Skeleton height={180} borderRadius={24} />
                  </View>
                ))
              ) : (
                popularItems.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    variant="featured"
                    onPress={() => router.push(`/menu/${item.id}`)}
                  />
                ))
              )}
            </ScrollView>
          </View>
          
          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Browse Menu
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {MENU_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === cat.id 
                        ? theme.primary 
                        : theme.backgroundSecondary,
                    }
                  ]}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={18} 
                    color={selectedCategory === cat.id ? '#fff' : theme.textSecondary}
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === cat.id ? '#fff' : theme.text }
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          
          {/* Menu Items */}
          <View style={[styles.section, { paddingBottom: 100 }]}>
            {isLoadingMenu ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : (
              filteredItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  variant="horizontal"
                  onPress={() => router.push(`/menu/${item.id}`)}
                />
              ))
            )}
            
            {!isLoadingMenu && filteredItems.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="cafe-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No items in this category
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
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#facc15',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  pointsCardContainer: {
    marginTop: -20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  popularScroll: {
    paddingRight: 20,
  },
  categoriesScroll: {
    paddingVertical: 4,
    marginTop: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});