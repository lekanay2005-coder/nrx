import { useState, useEffect } from 'react';
import { 
  Command, 
  ShoppingBag, 
  User, 
  Home, 
  Compass, 
  Sparkles, 
  FolderHeart, 
  SlidersHorizontal,
  Menu,
  X,
  CreditCard,
  Wallet,
  LogOut,
  LogIn,
  UserPlus,
  PlusCircle,
  MessageSquare,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subviews
import { HomeView } from './components/HomeView';
import { MarketplaceView } from './components/MarketplaceView';
import { DetailsView } from './components/DetailsView';
import { CheckoutView } from './components/CheckoutView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { GenesisStoreView } from './components/GenesisStoreView';
import { AuthView } from './components/AuthView';
import { SellAssetView } from './components/SellAssetView';
import { CommsView } from './components/CommsView';

// Core Types & Initial Assets
import { Product, CartItem, Order, UserProfile, ActiveTab } from './types';
import { INITIAL_PRODUCTS, INITIAL_USER_PROFILE, INITIAL_ORDERS } from './data';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('neo_genx_is_logged_in');
    return saved ? saved === 'true' : true;
  });
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup'>('signin');

  // Business State
  const [products, setProducts] = useState<Product[]>(() => {
    // Look in localStorage to persist likes/bids
    const saved = localStorage.getItem('neo_genx_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('neo_genx_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('neo_genx_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('neo_genx_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // Fetch initial states from full-stack system backend
  useEffect(() => {
    // 1. Fetch products
    fetch('/api/products')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(prev => {
            if (!prev) return data[0];
            const current = data.find((p: any) => p.id === prev.id);
            return current || data[0];
          });
        }
      })
      .catch(err => console.warn('Local fallback products active', err));

    // 2. Fetch profile
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUserProfile(data))
      .catch(err => console.warn('Local fallback profile active', err));

    // 3. Fetch orders
    fetch('/api/orders')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOrders(data))
      .catch(err => console.warn('Local fallback orders active', err));

    // 4. Fetch cart
    fetch('/api/cart')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCart(data))
      .catch(err => console.warn('Local fallback cart active', err));

    // 5. Fetch auth status
    fetch('/api/auth/status')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setIsLoggedIn(data.isLoggedIn))
      .catch(err => console.warn('Local fallback auth active', err));
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    localStorage.setItem('neo_genx_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('neo_genx_cart', JSON.stringify(cart));
    // Quietly sync cart with backend API
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart)
    }).catch(err => console.error('Cart sync err:', err));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('neo_genx_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('neo_genx_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('neo_genx_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Set default Details page subject
  useEffect(() => {
    if (!selectedProduct && products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  // Core Interactions Logic
  const handleAddToCart = (product: Product, selectedOption?: string) => {
    setCart((prevCart) => {
      // Find matches with same id AND same options preloaded
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedOption === selectedOption
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        return updated;
      }

      return [
        ...prevCart,
        {
          id: `${product.id}-${selectedOption || 'std'}-${Date.now()}`,
          product,
          quantity: 1,
          selectedOption: selectedOption || 'Standard Module Core'
        }
      ];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleBuyNow = (product: Product, selectedOption?: string) => {
    handleAddToCart(product, selectedOption);
    setActiveTab('checkout');
  };

  const handleLikeProduct = async (productId: string) => {
    // Optimistic local update
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const liked = !p.hasLiked;
          return {
            ...p,
            hasLiked: liked,
            likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const liked = !prev.hasLiked;
        return {
          ...prev,
          hasLiked: liked,
          likes: liked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
        };
      });
    }

    try {
      const res = await fetch(`/api/products/${productId}/like`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => p.id === productId ? updated : p));
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updated);
        }
      }
    } catch (err) {
      console.error('Error syncing like with server:', err);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    // Optimistic local update
    setProducts((prev) => [newProduct, ...prev]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const savedResult = await res.json();
        setProducts((prev) => prev.map((p) => p.id === newProduct.id ? savedResult.product : p));
        if (savedResult.profile) {
          setUserProfile(savedResult.profile);
        }
      } else {
        const errObj = await res.json();
        alert(errObj.error || "Failed to register new listing.");
        // Rollback state from database
        fetch('/api/products').then(r => r.json()).then(p => setProducts(p));
        fetch('/api/profile').then(r => r.json()).then(p => setUserProfile(p));
      }
    } catch (err) {
      console.error('Error saving new product to server:', err);
    }
  };

  const handlePlaceBid = async (productId: string, amount: number) => {
    // Optimistic local update
    setProducts((prev) => prev.map((p) => {
      if (p.id === productId) {
        return { ...p, hasBid: true, currentBid: amount };
      }
      return p;
    }));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => prev ? { ...prev, hasBid: true, currentBid: amount } : null);
    }

    try {
      const res = await fetch(`/api/products/${productId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const resultObj = await res.json();
        const updated = resultObj.product;
        setProducts((prev) => prev.map((p) => p.id === productId ? updated : p));
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updated);
        }
        if (resultObj.profile) {
          setUserProfile(resultObj.profile);
        }
        return true;
      } else {
        const errObj = await res.json();
        alert(errObj.error || "Failed to submit bid.");
        // Rollback state from database
        fetch('/api/products').then(r => r.json()).then(p => setProducts(p));
        fetch('/api/profile').then(r => r.json()).then(p => setUserProfile(p));
      }
    } catch (err) {
      console.error('Error syncing bid with server:', err);
    }
    return true; 
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    // Optimistic local update
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const result = await res.json();
        setOrders((prev) => prev.map((o) => o.id === newOrder.id ? result.order : o));
        setUserProfile(result.profile);
      } else {
        const errObj = await res.json();
        alert(errObj.error || "Failed to proceed checkout transaction.");
        // Rollback state from database
        fetch('/api/orders').then(r => r.json()).then(o => setOrders(o));
        fetch('/api/profile').then(r => r.json()).then(p => setUserProfile(p));
        fetch('/api/cart').then(r => r.json()).then(c => setCart(c));
      }
    } catch (err) {
      console.error('Error placing order on server:', err);
    }
  };

  const handleMinePoints = () => {
    fetch('/api/profile/mine', { method: 'POST' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUserProfile(data.profile);
      })
      .catch(err => {
        setUserProfile(prev => ({
          ...prev,
          points: (prev.points || 0) + 30
        }));
      });
  };

  const handleUpdatePoints = (newVal: number) => {
    setUserProfile(prev => ({
      ...prev,
      points: newVal
    }));
  };

  const handleRemoveOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleDeductBalance = async (amount: number, paymentSource: 'wallet' | 'stripe' | 'bank' = 'wallet') => {
    let nextProfile = { ...userProfile };
    if (paymentSource === 'bank' && userProfile.linkedBank) {
      nextProfile = {
        ...userProfile,
        linkedBank: {
          ...userProfile.linkedBank,
          balance: Math.max(0, userProfile.linkedBank.balance - amount)
        },
        lifetimeSpent: userProfile.lifetimeSpent + amount
      };
    } else {
      nextProfile = {
        ...userProfile,
        walletBalanceUSDC: Math.max(0, userProfile.walletBalanceUSDC - amount),
        lifetimeSpent: userProfile.lifetimeSpent + amount
      };
    }
    setUserProfile(nextProfile);

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProfile)
      });
    } catch (err) {
      console.error('Error syncing deducted balance with server:', err);
    }
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    setUserProfile(updated);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const saved = await res.json();
        setUserProfile(saved);
      }
    } catch (err) {
      console.error('Error updating profile on server:', err);
    }
  };

  const handleUpdatePreference = async (
    key: 'glassmorphism' | 'reduceMotion' | 'highContrast',
    value: boolean
  ) => {
    const nextProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        [key]: value
      }
    };
    setUserProfile(nextProfile);

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProfile)
      });
    } catch (err) {
      console.error('Error syncing preferences with server:', err);
    }
  };

  // Sync Auth Gate simulated authorize
  const handleAuthSuccess = async (connectedWalletHex: string, email?: string, username?: string, customProfile?: any) => {
    if (customProfile) {
      setUserProfile(customProfile);
      setIsLoggedIn(true);
      return;
    }

    const nextProfile = {
      ...userProfile,
      connectedWallet: connectedWalletHex,
      ...(email && { email }),
      ...(username && { username })
    };
    setUserProfile(nextProfile);
    setIsLoggedIn(true);

    try {
      await fetch('/api/auth/login', { method: 'POST' });
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProfile)
      });
    } catch (err) {
      console.error('Auth sync error:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    const loggedOutProfile = {
      ...userProfile,
      connectedWallet: 'Not Connected',
      username: 'Traveler_042',
      email: 'traveler@neo-genx.network'
    };
    setUserProfile(loggedOutProfile);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loggedOutProfile)
      });
    } catch (err) {
      console.error('Logout sync error:', err);
    }
  };

  // Derived Values
  const totalCartQty = cart.reduce((qt, item) => qt + item.quantity, 0);
  const preferences = userProfile.preferences;
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;
  const isHighContrast = preferences.highContrast;

  const currentThemeBorderClass = isHighContrast ? 'border-2 border-[#FF3E00]' : 'border border-zinc-800';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col justify-between selection:bg-[#FF3E00]/30 selection:text-white font-sans md:border-[12px] border-zinc-900 border-opacity-75">
      
      {/* Dynamic Header navigation pill rails */}
      <header className={`sticky top-0 z-40 transition-all border-b border-zinc-800 bg-[#0A0A0A]/90 ${isGlass ? 'backdrop-blur-md' : 'bg-[#0A0A0A]'}`} id="global-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo and Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group select-none"
            id="header-brand-logo"
          >
            <div className="w-9 h-9 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-850 group-hover:border-[#FF3E00] transition-colors">
              <Command className="w-5 h-5 text-[#FF3E00] group-hover:rotate-45 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black italic text-sm text-white tracking-wider leading-none">NEO-GENX</span>
              <span className="text-[8.5px] font-mono text-zinc-400 tracking-[0.2em] uppercase">Secure Depot Conport</span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden md:flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.25em] font-semibold" id="desktop-nav-menu">
            {[
              { id: 'home', label: 'Ecosystem', icon: Home },
              { id: 'marketplace', label: 'Marketplace', icon: Compass },
              { id: 'genesis-store', label: 'Genesis Store', icon: FolderHeart },
              { id: 'sell', label: 'Sell Asset', icon: PlusCircle },
              { id: 'comms', label: 'Secure Comms', icon: MessageSquare }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`px-4 py-2 flex items-center gap-2 transition-all cursor-pointer relative ${
                    isActive ? 'text-[#FF3E00] font-bold' : 'text-zinc-400 opacity-60 hover:opacity-100 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-4 right-4 h-px bg-[#FF3E00]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connected User Cockpit quick shortcuts */}
          <div className="flex items-center gap-3" id="quick-actions-bar">
            {isLoggedIn ? (
              <>
                {/* Network points (GP) tracker */}
                <button
                  onClick={() => setActiveTab('comms')}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-850 hover:border-[#FF3E00]/45 rounded-lg text-xs font-mono text-zinc-300 transition-all cursor-pointer"
                  id="header-gp-points-counter"
                  title="Secure Communications & Mine GP Points"
                >
                  <Coins className="w-3.5 h-3.5 text-[#FF3E00]" />
                  <span>{userProfile.points ?? 120} <span className="font-extrabold text-[9px] text-[#FF3E00]">GP</span></span>
                </button>

                {/* Connected Account status lock */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
                  id="wallet-con-shortcut"
                >
                  <div className="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse" />
                  <span className="tracking-wide text-zinc-300 hover:text-white transition-colors">{userProfile.connectedWallet}</span>
                  <span className="text-zinc-500">• {userProfile.walletBalanceUSDC} USDC</span>
                </button>

                {/* Cart Bag Icon with real count indicators */}
                <button
                  onClick={() => setActiveTab('checkout')}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-lg relative cursor-pointer text-zinc-400 hover:text-white"
                  id="shopping-cart-badge-trigger"
                  title="Checkout Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF3E00] text-white font-mono text-[9px] font-bold flex items-center justify-center animate-bounce">
                      {totalCartQty}
                    </span>
                  )}
                </button>

                {/* Quick dashboard profile gateway */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                  title="User Cockpit Dashboard"
                  id="header-user-dashboard-btn"
                >
                  <User className="w-4 h-4" />
                </button>

                {/* Log Out button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-red-950/50 hover:border-red-500 bg-red-950/10 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  id="header-logout-btn"
                  title="Disconnect Session / Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">LOG OUT</span>
                </button>
              </>
            ) : (
              <>
                {/* Cart Bag Icon with real count indicators */}
                <button
                  onClick={() => setActiveTab('checkout')}
                  className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-lg relative cursor-pointer text-zinc-400 hover:text-white"
                  id="shopping-cart-badge-trigger"
                  title="Checkout Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF3E00] text-white font-mono text-[9px] font-bold flex items-center justify-center animate-bounce">
                      {totalCartQty}
                    </span>
                  )}
                </button>

                {/* Log In Button */}
                <button
                  onClick={() => {
                    setAuthInitialTab('signin');
                    setActiveTab('auth');
                  }}
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-lg font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
                  id="header-login-btn"
                  title="Secure Gate Entrance"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#FF3E00]" />
                  <span>LOG IN</span>
                </button>

                {/* Sign Up Button */}
                <button
                  onClick={() => {
                    setAuthInitialTab('signup');
                    setActiveTab('auth');
                  }}
                  className="px-3.5 py-1.5 bg-[#FF3E00] hover:bg-[#E03600] text-white rounded-lg font-mono text-[9.5px] uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#FF3E00]/15"
                  id="header-signup-btn"
                  title="Register Decentralized Endpoint"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>SIGN UP</span>
                </button>
              </>
            )}

            {/* Mobile Menu responsive Drawer triggers */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu collapsible */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-2 font-mono text-xs">
            {[
              { id: 'home', label: 'Ecosystem Home', icon: Home },
              { id: 'marketplace', label: 'Ecosystem Marketplace', icon: Compass },
              { id: 'genesis-store', label: 'Genesis Aetheris Labs', icon: FolderHeart },
              { id: 'sell', label: 'Sell New Asset', icon: PlusCircle },
              { id: 'comms', label: 'Secure Comms', icon: MessageSquare },
              { id: 'dashboard', label: 'Logistics Dashboard', icon: User }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 hover:bg-zinc-900/40 text-zinc-400 hover:text-white ${
                  activeTab === item.id ? 'bg-zinc-900 text-[#FF3E00] font-bold' : ''
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}

            <div className="border-t border-zinc-900 pt-2 my-1" />

            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors font-bold cursor-pointer"
                id="mobile-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect [LOG OUT]</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthInitialTab('signin');
                    setActiveTab('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 hover:bg-zinc-900/40 text-zinc-350 hover:text-white cursor-pointer"
                  id="mobile-login-btn"
                >
                  <LogIn className="w-4 h-4 text-[#FF3E00]" />
                  <span>Secure Log In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthInitialTab('signup');
                    setActiveTab('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2 hover:bg-zinc-900/40 text-[#FF3E00] font-bold cursor-pointer animate-pulse"
                  id="mobile-signup-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Endpoint [SIGN UP]</span>
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Container Views Switch */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full position-relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={isReduced ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isReduced ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`w-full ${currentThemeBorderClass} rounded-2xl bg-zinc-950/40 p-5 sm:p-8 relative overflow-hidden`}
          >
            {/* Home View */}
            {activeTab === 'home' && (
              <HomeView
                onNavigate={setActiveTab}
                onSelectProduct={setSelectedProduct}
                featuredProducts={products}
                preferences={preferences}
              />
            )}

            {/* Marketplace Catalog View */}
            {activeTab === 'marketplace' && (
              <MarketplaceView
                products={products}
                onSelectProduct={setSelectedProduct}
                onNavigate={setActiveTab}
                onAddToCart={handleAddToCart}
                onLikeProduct={handleLikeProduct}
                preferences={preferences}
                onPlaceBid={handlePlaceBid}
              />
            )}

            {/* Details Specifications View */}
            {activeTab === 'details' && (
              <DetailsView
                product={selectedProduct}
                allProducts={products}
                onBack={() => setActiveTab('marketplace')}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onLikeProduct={handleLikeProduct}
                onSelectProduct={setSelectedProduct}
                onNavigate={setActiveTab}
                preferences={preferences}
                onPlaceBid={handlePlaceBid}
              />
            )}

            {/* Checkout Pipeline View */}
            {activeTab === 'checkout' && (
              <CheckoutView
                cart={cart}
                userProfile={userProfile}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onPlaceOrder={handlePlaceOrder}
                onNavigate={setActiveTab}
                onDeductBalance={handleDeductBalance}
                preferences={preferences}
              />
            )}

            {/* Logistics Cockpit Dashboard View */}
            {activeTab === 'dashboard' && (
              !isLoggedIn ? (
                <div className="max-w-xl mx-auto text-center py-16 px-6 border border-zinc-900 bg-zinc-950/20 rounded-2xl my-8 space-y-6" id="dashboard-not-auth-block">
                  <div className="w-14 h-14 rounded-full bg-[#FF3E00]/10 flex items-center justify-center border border-[#FF3E00]/20 mx-auto select-none">
                    <User className="w-6 h-6 text-[#FF3E00]" />
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-[#FF3E00] tracking-[0.2em] font-bold uppercase block">SECURITY PROTOCOL VERIFICATION REQUIRED</span>
                    <h3 className="font-display text-xl font-black italic text-white uppercase">Cockpit Gate Locked</h3>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed max-w-sm mx-auto">
                      Authorized login signature is required to index the logistics logs, dispatch local node telemetry, or track shipped hardware payloads.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setAuthInitialTab('signin');
                        setActiveTab('auth');
                      }}
                      className="px-6 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#FF3E00]" />
                      <span>SIGN IN GATE</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthInitialTab('signup');
                        setActiveTab('auth');
                      }}
                      className="px-6 py-2.5 bg-[#FF3E00] hover:bg-[#E03600] text-white rounded-lg font-mono text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3E00]/10"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>REGISTER ENDPOINT</span>
                    </button>
                  </div>
                </div>
              ) : (
                <DashboardView
                  userProfile={userProfile}
                  orders={orders}
                  onSelectProduct={setSelectedProduct}
                  onNavigate={setActiveTab}
                  preferences={preferences}
                  onRemoveOrder={handleRemoveOrder}
                  onLogout={handleLogout}
                />
              )
            )}

            {/* Parameters Settings View */}
            {activeTab === 'settings' && (
              <SettingsView
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onNavigate={setActiveTab}
                preferences={preferences}
                onUpdatePreference={handleUpdatePreference}
              />
            )}

            {/* Spec Creator Genesis Store View */}
            {activeTab === 'genesis-store' && (
              <GenesisStoreView
                products={products}
                onSelectProduct={setSelectedProduct}
                onNavigate={setActiveTab}
                onAddToCart={handleAddToCart}
                onLikeProduct={handleLikeProduct}
                preferences={preferences}
              />
            )}

            {/* Secure Entry authentication view */}
            {activeTab === 'auth' && (
              <AuthView
                onSuccess={handleAuthSuccess}
                onNavigate={setActiveTab}
                preferences={preferences}
                initialTab={authInitialTab}
              />
            )}

            {/* Sell Asset Syndication View */}
            {activeTab === 'sell' && (
              <SellAssetView
                userProfile={userProfile}
                onAddProduct={handleAddProduct}
                onNavigate={setActiveTab}
                preferences={preferences}
              />
            )}

            {/* Real-time Secure Comms View */}
            {activeTab === 'comms' && (
              <CommsView
                userProfile={userProfile}
                onMinePoints={handleMinePoints}
                onUpdatePoints={handleUpdatePoints}
                preferences={preferences}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Design layout */}
      <footer className="border-t border-zinc-800 bg-[#0A0A0A] py-10 mt-12" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
          
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-zinc-700" />
            <span>NEO-GENX COMMERCE SECURITY PROTOCOL PROV-42</span>
          </div>

          <div className="flex gap-4">
            <span className="hover:text-[#FF3E00] cursor-pointer transition-colors" onClick={() => setActiveTab('settings')}>Appearance</span>
            <span>•</span>
            <span className="hover:text-[#FF3E00] cursor-pointer transition-colors" onClick={() => setActiveTab('marketplace')}>Bids & Asks</span>
            <span>•</span>
            <span className="hover:text-[#FF3E00] cursor-pointer transition-colors" onClick={() => setActiveTab('dashboard')}>Security Logs</span>
          </div>

          <div>
            <span>© 2026 NEO-GENX DEPIN. BROADCST SECURE.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
