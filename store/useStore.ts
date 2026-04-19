import { create } from 'zustand';
import { CartItem, MenuItem, Transaction, Reward, UserRedemption, PaymentMethod } from '@/types';
import { supabase } from '@/lib/supabase';

interface StoreState {
  // Menu
  menuItems: MenuItem[];
  selectedCategory: string;
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  pointsToEarn: number;
  
  // Transactions
  transactions: Transaction[];
  
  // Rewards
  rewards: Reward[];
  userRedemptions: UserRedemption[];
  
  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  
  // Points to redeem
  pointsToRedeem: number;
  
  // Loading states
  isLoadingMenu: boolean;
  isLoadingTransactions: boolean;
  isProcessingPayment: boolean;
  
  // Actions
  setSelectedCategory: (category: string) => void;
  addToCart: (item: MenuItem, quantity: number, customizations: CartItem['customizations']) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setPointsToRedeem: (points: number) => void;
  selectPaymentMethod: (method: PaymentMethod) => void;
  processPayment: () => Promise<boolean>;
  redeemReward: (reward: Reward) => Promise<UserRedemption | null>;
  fetchMenu: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchRewards: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchUserRedemptions: () => Promise<void>;
}

const mapDatabaseMenuItemToMenuItem = (item: any): MenuItem => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: parseFloat(item.price),
  category: item.category,
  image: item.image,
  available: item.available,
  calories: item.calories,
  popular: item.popular,
});

const mapDatabaseRewardToReward = (reward: any): Reward => ({
  id: reward.id,
  name: reward.name,
  pointsRequired: reward.pointsRequired,
  description: reward.description,
  image: reward.image,
  category: reward.category,
  active: reward.active,
  expiryDays: reward.expiryDays,
});

const mapDatabaseTransactionToTransaction = (transaction: any): Transaction => ({
  id: transaction.id,
  userId: transaction.userId,
  amount: parseFloat(transaction.amount),
  pointsEarned: transaction.pointsEarned,
  pointsRedeemed: transaction.pointsRedeemed,
  items: [],
  timestamp: new Date(transaction.timestamp),
  receiptUrl: transaction.receiptUrl,
  status: transaction.status,
  storeName: transaction.storeName,
});

const mapDatabasePaymentMethodToPaymentMethod = (method: any): PaymentMethod => ({
  id: method.id,
  userId: method.userId,
  type: method.type,
  last4Digits: method.last4Digits,
  cardHolder: method.cardHolder,
  expiryDate: method.expiryDate,
  isDefault: method.isDefault,
});

const mapDatabaseUserRedemptionToUserRedemption = (redemption: any, reward: Reward): UserRedemption => ({
  id: redemption.id,
  userId: redemption.userId,
  reward,
  redeemedAt: new Date(redemption.redeemedAt),
  expiryDate: redemption.expiryDate ? new Date(redemption.expiryDate) : null,
  status: redemption.status,
  code: redemption.code,
});

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  menuItems: [],
  selectedCategory: 'all',
  cart: [],
  cartTotal: 0,
  pointsToEarn: 0,
  transactions: [],
  rewards: [],
  userRedemptions: [],
  paymentMethods: [],
  selectedPaymentMethod: null,
  pointsToRedeem: 0,
  isLoadingMenu: false,
  isLoadingTransactions: false,
  isProcessingPayment: false,

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addToCart: (item, quantity, customizations) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      c => c.menuItem.id === item.id && 
      JSON.stringify(c.customizations) === JSON.stringify(customizations)
    );
    
    const extraCost = customizations.reduce((sum, c) => sum + c.extraCost, 0);
    const subtotal = (item.price + extraCost) * quantity;
    
    let newCart: CartItem[];
    
    if (existingIndex >= 0) {
      newCart = cart.map((c, i) => 
        i === existingIndex 
          ? { ...c, quantity: c.quantity + quantity, subtotal: c.subtotal + subtotal }
          : c
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        menuItem: item,
        quantity,
        customizations,
        subtotal,
      };
      newCart = [...cart, newItem];
    }
    
    const cartTotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
    const pointsToEarn = Math.floor(cartTotal * 2); // 2 points per dollar
    
    set({ cart: newCart, cartTotal, pointsToEarn });
  },

  removeFromCart: (itemId) => {
    const { cart } = get();
    const newCart = cart.filter(c => c.id !== itemId);
    const cartTotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
    const pointsToEarn = Math.floor(cartTotal * 2);
    
    set({ cart: newCart, cartTotal, pointsToEarn });
  },

  updateCartItemQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    
    const { cart } = get();
    const newCart = cart.map(c => {
      if (c.id === itemId) {
        const extraCost = c.customizations.reduce((sum, cust) => sum + cust.extraCost, 0);
        const subtotal = (c.menuItem.price + extraCost) * quantity;
        return { ...c, quantity, subtotal };
      }
      return c;
    });
    
    const cartTotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
    const pointsToEarn = Math.floor(cartTotal * 2);
    
    set({ cart: newCart, cartTotal, pointsToEarn });
  },

  clearCart: () => set({ cart: [], cartTotal: 0, pointsToEarn: 0, pointsToRedeem: 0 }),

  setPointsToRedeem: (points) => set({ pointsToRedeem: points }),

  selectPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  processPayment: async () => {
    try {
      set({ isProcessingPayment: true });
      
      console.log('[processPayment] Starting payment processing...');
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[processPayment] Authentication error:', authError?.message || 'No user found');
        set({ isProcessingPayment: false });
        return false;
      }

      console.log('[processPayment] User authenticated:', user.id);

      const { cart, cartTotal, pointsToEarn, pointsToRedeem } = get();
      
      // Validate cart is not empty
      if (cart.length === 0) {
        console.error('[processPayment] Cart is empty');
        set({ isProcessingPayment: false });
        return false;
      }
      
      console.log('[processPayment] Cart total:', cartTotal);
      console.log('[processPayment] Points to earn:', pointsToEarn);
      console.log('[processPayment] Points to redeem:', pointsToRedeem);
      
      const finalAmount = Math.max(0, cartTotal - (pointsToRedeem * 0.01));
      console.log('[processPayment] Final amount:', finalAmount);
      
      // Create transaction with proper field mapping
      const transactionData = {
        userId: user.id,
        amount: finalAmount,
        pointsEarned: pointsToEarn,
        pointsRedeemed: pointsToRedeem,
        timestamp: new Date().toISOString(), // CRITICAL: Add timestamp field
        status: 'completed',
        storeName: 'BrewRewards Downtown',
        receiptUrl: null, // Optional field
      };

      console.log('[processPayment] Creating transaction with data:', transactionData);

      const { data: createdTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('[processPayment] Transaction creation error:', {
          message: transactionError.message,
          details: transactionError.details,
          hint: transactionError.hint,
          code: transactionError.code,
        });
        set({ isProcessingPayment: false });
        return false;
      }

      if (!createdTransaction) {
        console.error('[processPayment] No transaction data returned');
        set({ isProcessingPayment: false });
        return false;
      }

      console.log('[processPayment] Transaction created successfully:', createdTransaction.id);

      // Create order items
      const orderItemsToInsert = cart.map(c => ({
        transactionId: createdTransaction.id,
        menuItemId: c.menuItem.id,
        quantity: c.quantity,
        subtotal: c.subtotal,
      }));

      console.log('[processPayment] Creating order items:', orderItemsToInsert.length);

      if (orderItemsToInsert.length > 0) {
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert);

        if (orderItemsError) {
          console.error('[processPayment] Order items creation error:', {
            message: orderItemsError.message,
            details: orderItemsError.details,
            hint: orderItemsError.hint,
            code: orderItemsError.code,
          });
          set({ isProcessingPayment: false });
          return false;
        }

        console.log('[processPayment] Order items created successfully');
      }

      // Update user points
      console.log('[processPayment] Fetching user points...');
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('currentPoints, totalPointsEarned')
        .eq('id', user.id)
        .single();

      if (userFetchError) {
        console.error('[processPayment] User fetch error:', userFetchError.message);
        // Continue anyway - transaction was created
      }

      if (userData) {
        const newCurrentPoints = Math.max(0, (userData.currentPoints || 0) - pointsToRedeem + pointsToEarn);
        const newTotalPointsEarned = (userData.totalPointsEarned || 0) + pointsToEarn;

        console.log('[processPayment] Updating user points:', {
          oldPoints: userData.currentPoints,
          newPoints: newCurrentPoints,
          oldTotal: userData.totalPointsEarned,
          newTotal: newTotalPointsEarned,
        });

        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            currentPoints: newCurrentPoints,
            totalPointsEarned: newTotalPointsEarned,
          })
          .eq('id', user.id);

        if (userUpdateError) {
          console.error('[processPayment] User points update error:', userUpdateError.message);
          // Continue anyway - transaction was created
        } else {
          console.log('[processPayment] User points updated successfully');
        }
      }

      const newTransaction = mapDatabaseTransactionToTransaction(createdTransaction);
      const { transactions } = get();

      console.log('[processPayment] Payment processed successfully!');

      set({ 
        transactions: [newTransaction, ...transactions],
        cart: [],
        cartTotal: 0,
        pointsToEarn: 0,
        pointsToRedeem: 0,
        isProcessingPayment: false,
      });
      
      return true;
    } catch (error) {
      console.error('[processPayment] Unexpected error:', error);
      set({ isProcessingPayment: false });
      return false;
    }
  },

  redeemReward: async (reward) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const expiryDate = reward.expiryDays 
        ? new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000)
        : null;

      const code = `BREW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data: redemptionData, error } = await supabase
        .from('user_redemptions')
        .insert({
          userId: user.id,
          rewardId: reward.id,
          expiryDate: expiryDate?.toISOString(),
          status: 'active',
          code,
        })
        .select()
        .single();

      if (error || !redemptionData) {
        return null;
      }

      // Update user points
      const { data: userData } = await supabase
        .from('users')
        .select('currentPoints')
        .eq('id', user.id)
        .single();

      if (userData) {
        const newCurrentPoints = Math.max(0, (userData.currentPoints || 0) - reward.pointsRequired);
        await supabase
          .from('users')
          .update({ currentPoints: newCurrentPoints })
          .eq('id', user.id);
      }

      const newRedemption = mapDatabaseUserRedemptionToUserRedemption(redemptionData, reward);
      const { userRedemptions } = get();

      set({ userRedemptions: [newRedemption, ...userRedemptions] });
      
      return newRedemption;
    } catch (error) {
      return null;
    }
  },

  fetchMenu: async () => {
    try {
      set({ isLoadingMenu: true });
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);

      if (error) {
        set({ isLoadingMenu: false });
        return;
      }

      const menuItems = (data || []).map(mapDatabaseMenuItemToMenuItem);
      set({ menuItems, isLoadingMenu: false });
    } catch (error) {
      set({ isLoadingMenu: false });
    }
  },

  fetchTransactions: async () => {
    try {
      set({ isLoadingTransactions: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoadingTransactions: false });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        set({ isLoadingTransactions: false });
        return;
      }

      const transactions = (data || []).map(mapDatabaseTransactionToTransaction);
      set({ transactions, isLoadingTransactions: false });
    } catch (error) {
      set({ isLoadingTransactions: false });
    }
  },

  fetchRewards: async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('active', true);

      if (error) {
        return;
      }

      const rewards = (data || []).map(mapDatabaseRewardToReward);
      set({ rewards });
    } catch (error) {
      // Handle error silently
    }
  },

  fetchPaymentMethods: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('userId', user.id);

      if (error) {
        return;
      }

      const paymentMethods = (data || []).map(mapDatabasePaymentMethodToPaymentMethod);
      const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0] || null;
      
      set({ paymentMethods, selectedPaymentMethod: defaultMethod });
    } catch (error) {
      // Handle error silently
    }
  },

  fetchUserRedemptions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('user_redemptions')
        .select('*, rewards(*)')
        .eq('userId', user.id)
        .eq('status', 'active');

      if (error) {
        return;
      }

      const userRedemptions = (data || []).map(redemption => 
        mapDatabaseUserRedemptionToUserRedemption(
          redemption,
          mapDatabaseRewardToReward(redemption.rewards)
        )
      );
      
      set({ userRedemptions });
    } catch (error) {
      // Handle error silently
    }
  },
}));