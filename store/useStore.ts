import { create } from 'zustand';
import { CartItem, MenuItem, Transaction, Reward, UserRedemption, PaymentMethod } from '@/types';
import { MENU_ITEMS, REWARDS, MOCK_TRANSACTIONS, MOCK_PAYMENT_METHODS, MOCK_REDEMPTIONS } from '@/constants/Data';

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
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  menuItems: [],
  selectedCategory: 'all',
  cart: [],
  cartTotal: 0,
  pointsToEarn: 0,
  transactions: [],
  rewards: [],
  userRedemptions: MOCK_REDEMPTIONS,
  paymentMethods: MOCK_PAYMENT_METHODS,
  selectedPaymentMethod: MOCK_PAYMENT_METHODS[0],
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
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { cart, cartTotal, pointsToEarn, pointsToRedeem, transactions } = get();
      
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        userId: 'user-001',
        amount: Math.max(0, cartTotal - (pointsToRedeem * 0.01)),
        pointsEarned: pointsToEarn,
        pointsRedeemed: pointsToRedeem,
        items: cart.map(c => ({
          menuItem: c.menuItem,
          quantity: c.quantity,
          customizations: [],
          subtotal: c.subtotal,
        })),
        timestamp: new Date(),
        receiptUrl: `receipt-${Date.now()}`,
        status: 'completed',
        storeName: 'BrewRewards Downtown',
      };
      
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
      set({ isProcessingPayment: false });
      return false;
    }
  },

  redeemReward: async (reward) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { userRedemptions } = get();
      
      const newRedemption: UserRedemption = {
        id: `red-${Date.now()}`,
        userId: 'user-001',
        reward,
        redeemedAt: new Date(),
        expiryDate: new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000),
        status: 'active',
        code: `BREW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };
      
      set({ userRedemptions: [newRedemption, ...userRedemptions] });
      
      return newRedemption;
    } catch (error) {
      return null;
    }
  },

  fetchMenu: async () => {
    set({ isLoadingMenu: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ menuItems: MENU_ITEMS, isLoadingMenu: false });
  },

  fetchTransactions: async () => {
    set({ isLoadingTransactions: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ transactions: MOCK_TRANSACTIONS, isLoadingTransactions: false });
  },

  fetchRewards: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ rewards: REWARDS });
  },
}));