import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Heart, HelpCircle, Star, ShoppingBag, Eye, Users, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface GenesisStoreViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  onAddToCart: (product: Product) => void;
  onLikeProduct: (productId: string) => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
}

export const GenesisStoreView: React.FC<GenesisStoreViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onAddToCart,
  onLikeProduct,
  preferences,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Filter products by seller creator: "AETHERIS LABS"
  const aetherisProducts = products.filter((p) => p.creator.name === 'AETHERIS LABS');

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(4802);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-10 pb-16" id="genesis-store-view-container">
      {/* Cover Banner image */}
      <div className="h-44 sm:h-56 w-full rounded-2xl overflow-hidden border border-zinc-950 relative" id="storefront-cover-banner">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1500&q=80"
          alt="Cover"
          className="w-full h-full object-cover saturate-[0.85] brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
        
        {/* Dynamic decorative badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-950/90 border border-[#FF3E00]/20 rounded font-mono text-[9px] text-[#FF3E00] tracking-wider">
          PRIMARY ECOSYSTEM CREDENTIALS SINCE EPOCH 0
        </div>
      </div>

      {/* Creator Profile block & counters */}
      <div className="relative px-6 -mt-16 sm:-mt-20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-zinc-850 pb-8" id="store-profile-cockpit">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-zinc-850 bg-zinc-950 flex-shrink-0 relative">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-black italic text-white tracking-tight">AETHERIS LABS</h1>
              <span className="px-2 py-0.5 rounded bg-[#FF3E00]/10 border border-[#FF3E00]/20 text-[9px] font-mono text-[#FF3E00] font-bold tracking-wider inline-flex items-center gap-1">
                SYSTEM VERIFIED <Check className="w-2.5 h-2.5 text-[#FF3E00]" />
              </span>
            </div>
            
            <p className="text-zinc-400 text-xs font-light max-w-md leading-relaxed">
              Decentralized hardware manufacturing collective designing enterprise neural blocks, low latency routers, and spatial storage rings.
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleFollowToggle}
            className={`flex-grow sm:flex-grow-0 px-6 py-3 font-mono font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${
              isFollowing
                ? 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-[#FF3E00]'
                : 'bg-white text-black border-white hover:bg-[#FF3E00] hover:text-white hover:border-[#FF3E00]'
            }`}
          >
            {isFollowing ? 'FOLLOWING HUB' : 'FOLLOW CREATOR'}
          </button>
        </div>
      </div>

      {/* Metrics Counters bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-zinc-950/60 border border-zinc-855 rounded-xl" id="store-metrics-panel">
        <div className="p-2 text-center" id="store-followers">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Ecosystem Followers</span>
          <span className="font-mono text-xl font-extrabold text-white flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4 text-[#FF3E00]" /> {followersCount.toLocaleString()}
          </span>
        </div>

        <div className="p-2 text-center" id="store-items-count">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Reserved Items</span>
          <span className="font-mono text-xl font-extrabold text-white">
            {aetherisProducts.length} Assemblies
          </span>
        </div>

        <div className="p-2 text-center" id="store-floor-price">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Sector floor price</span>
          <span className="font-mono text-xl font-extrabold text-[#FF3E00]">
            249 USDC
          </span>
        </div>

        <div className="p-2 text-center" id="store-cumulative-volume">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Protocol Volume Locked</span>
          <span className="font-mono text-xl font-extrabold text-white">
            1.42M USDC
          </span>
        </div>
      </div>

      {/* Assembly items grid */}
      <section className="space-y-6" id="genesis-catalog-grid-section">
        <div className="border-b border-zinc-850 pb-3">
          <h2 className="font-display text-xl sm:text-2xl font-black italic text-white uppercase tracking-wider">Aetheris Assemblies Grid</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aetherisProducts.map((product) => (
            <div
              key={product.id}
              className={`group flex flex-col justify-between border border-zinc-850 rounded-xl bg-zinc-950/40 overflow-hidden relative ${isGlass ? 'backdrop-blur-sm' : ''}`}
            >
              {/* Liked heart toggle */}
              <button
                onClick={() => onLikeProduct(product.id)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-950/95 border border-zinc-800 hover:border-[#FF3E00] text-zinc-400 hover:text-[#FF3E00] transition-colors cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${product.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <div
                className="relative aspect-video w-full bg-zinc-900 cursor-pointer overflow-hidden border-b border-zinc-950"
                onClick={() => {
                  onSelectProduct(product);
                  onNavigate('details');
                }}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase text-zinc-500">
                    <span>{product.category}</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      {product.likes}
                    </span>
                  </div>

                  <h3
                    onClick={() => {
                      onSelectProduct(product);
                      onNavigate('details');
                    }}
                    className="font-display text-sm font-bold italic text-white group-hover:text-[#FF3E00] transition-colors truncate cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-zinc-450 text-[10px] font-light line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[8px] text-zinc-500 uppercase block">Purchase Cost</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {product.price.toLocaleString()} USDC
                    </span>
                  </div>

                  {product.status === 'In Stock' ? (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="py-1.5 px-3 bg-[#0D0D0D] hover:bg-[#FF3E00] hover:text-white border border-zinc-800 hover:border-[#FF3E00] rounded font-mono text-[10px] text-zinc-300 cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add Cart</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-650 uppercase">{product.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
