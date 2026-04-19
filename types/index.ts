export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
  totalPointsEarned: number;
  currentPoints: number;
  tierLevel: TierLevel;
}

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  pointsEarned: number;
  pointsRedeemed: number;
  items: OrderItem[];
  timestamp: Date;
  receiptUrl: string;
  status: TransactionStatus;
  storeName: string;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
  calories: number;
  customizations?: Customization[];
  popular?: boolean;
}

export type MenuCategory = 'coffee' | 'tea' | 'pastry' | 'sandwich' | 'smoothie' | 'seasonal';

export interface Customization {
  id: string;
  name: string;
  options: CustomizationOption[];
  required: boolean;
  maxSelections: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceModifier: number;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  subtotal: number;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
}

export interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  image: string;
  category: RewardCategory;
  active: boolean;
  expiryDays: number;
}

export type RewardCategory = 'drink' | 'food' | 'merchandise' | 'experience';

export interface UserRedemption {
  id: string;
  userId: string;
  reward: Reward;
  redeemedAt: Date;
  expiryDate: Date;
  status: RedemptionStatus;
  code: string;
}

export type RedemptionStatus = 'active' | 'used' | 'expired';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentType;
  last4Digits: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
}

export type PaymentType = 'visa' | 'mastercard' | 'amex' | 'apple_pay' | 'google_pay' | 'cash';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customizations: { name: string; options: string[]; extraCost: number }[];
  subtotal: number;
}

export interface TierInfo {
  level: TierLevel;
  name: string;
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  perks: string[];
  color: string;
  icon: string;
}