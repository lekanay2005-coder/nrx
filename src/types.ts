export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Hardware Nodes' | 'Compute Units' | 'Genesis Keys' | 'Special Modules';
  status: 'In Stock' | 'Launching Soon' | 'Sold Out';
  images: string[];
  specs: Record<string, string>;
  features: string[];
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
    itemsCount: number;
    volume: string;
  };
  hasBid?: boolean;
  currentBid?: number;
  likes: number;
  hasLiked?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOption?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Completed';
  items: CartItem[];
  total: number;
  trackingCode: string;
  deliveryService: string;
  recipientName: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  orderNotes?: string;
}

export interface LinkedBank {
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
  balance: number; // Simulated external bank account balance
  verified: boolean;
}

export interface UserProfile {
  username: string;
  email: string;
  connectedWallet: string;
  walletBalanceUSDC: number;
  walletBalanceETH: number;
  lifetimeSpent: number;
  avatar: string;
  points: number; // GENX network points
  linkedBank?: LinkedBank;
  preferences: {
    glassmorphism: boolean;
    reduceMotion: boolean;
    highContrast: boolean;
  };
}

export type ActiveTab = 
  | 'home' 
  | 'marketplace' 
  | 'details' 
  | 'checkout' 
  | 'dashboard' 
  | 'settings' 
  | 'genesis-store' 
  | 'auth'
  | 'sell'
  | 'comms';

export interface Message {
  id: string;
  sender: 'user' | 'counterparty';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  productId: string;
  productName: string;
  counterpartyName: string;
  counterpartyAvatar: string;
  role: 'seller' | 'buyer';
  messages: Message[];
  status: 'negotiating' | 'approved' | 'dispatched';
}

