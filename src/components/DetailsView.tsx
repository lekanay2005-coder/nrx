import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Heart, Sparkles, ShieldCheck, Scale, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Product } from '../types';

const getBidHistory = (prodId: string, currentVal: number) => {
  let hash = 0;
  for (let i = 0; i < prodId.length; i++) {
    hash = prodId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash) % 100;

  // Simulate 5 increments culminating in the current active value/bid
  const p1 = Math.round(currentVal * (0.80 + (seed % 4) * 0.01));
  const p2 = Math.round(currentVal * (0.85 + ((seed + 2) % 4) * 0.01));
  const p3 = Math.round(currentVal * (0.90 + ((seed + 5) % 4) * 0.01));
  const p4 = Math.round(currentVal * (0.95 + ((seed + 7) % 3) * 0.01));
  const p5 = currentVal;

  return [
    { name: 'Bid Alpha', value: p1 },
    { name: 'Bid Beta', value: p2 },
    { name: 'Bid Gamma', value: p3 },
    { name: 'Bid Delta', value: p4 },
    { name: 'Active Bid', value: p5 },
  ];
};

interface DetailsViewProps {
  product: Product | null;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, selectedOption?: string) => void;
  onBuyNow: (product: Product, selectedOption?: string) => void;
  onLikeProduct: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
  onPlaceBid?: (productId: string, amount: number) => Promise<boolean>;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  product,
  allProducts,
  onBack,
  onAddToCart,
  onBuyNow,
  onLikeProduct,
  onSelectProduct,
  onNavigate,
  preferences,
  onPlaceBid,
}) => {
  if (!product) {
    return (
      <div className="text-center py-20" id="details-no-product">
        <p className="text-zinc-500">No core asset selected.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded font-mono text-xs">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('Standard Module Core');
  const [userBid, setUserBid] = useState<string>('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Set default active view image index
  useEffect(() => {
    setActiveImageIndex(0);
    setUserBid('');
    setBidSuccess(false);
  }, [product]);

  // Generate simulated 5 historical bids ending at the current price / active bid
  const bidHistoryData = getBidHistory(
    product.id,
    product.hasBid && product.currentBid ? product.currentBid : product.price
  );

  // Find related products
  const relatedProducts = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bidAmount = parseFloat(userBid);
    const minBidRequired = product.hasBid && product.currentBid ? product.currentBid : product.price;

    if (isNaN(bidAmount) || bidAmount <= minBidRequired) {
      alert(`Cryptographic bid must be at least more than ${minBidRequired} USDC`);
      return;
    }

    setBidSuccess(true);
    if (onPlaceBid) {
      onPlaceBid(product.id, bidAmount).then(() => {
        setBidSuccess(false);
        setUserBid('');
      });
    } else {
      setTimeout(() => {
        product.currentBid = bidAmount;
        product.hasBid = true;
        setBidSuccess(false);
        setUserBid('');
      }, 1800);
    }
  };

  const handleAddToCartLocal = () => {
    onAddToCart(product, selectedOption);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20" id={`details-view-container-${product.id}`}>
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-[#FF3E00] text-xs font-mono transition-colors cursor-pointer group"
          id="back-to-market-btn"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO CATALOG GRID</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Dynamic Gallery layout */}
        <div className="lg:col-span-7 space-y-4" id="gallery-container">
          <motion.div
            layoutId={isReduced ? undefined : `product-image-${product.id}`}
            className="aspect-video w-full rounded-xl bg-zinc-950/60 border border-zinc-900 overflow-hidden relative"
          >
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Sector indicator Badge */}
            <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-zinc-950/95 text-[#FF3E00] border border-zinc-800 rounded">
              {product.category}
            </span>
          </motion.div>

          {/* Thumbnails list */}
          <div className="flex gap-3 overflow-x-auto pb-1" id="gallery-thumbnails">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveImageIndex(idx)}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-14 rounded-lg overflow-hidden border transition-all relative ${
                  idx === activeImageIndex ? 'border-[#FF3E00]' : 'border-zinc-900 hover:border-zinc-700'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Features list bullet boxes */}
          <div className="p-6 bg-zinc-950/20 border border-zinc-900 rounded-xl space-y-4" id="bullets-list-specs">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF3E00]" /> Integrated Hardware Logic
            </h3>
            <ul className="space-y-3">
              {product.features.map((feature, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs text-zinc-400 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Core Buy Cockpit and technical forms */}
        <div className="lg:col-span-5 space-y-6" id="buy-options-pane">
          {/* Creator Profile line */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-lg">
            <div 
              onClick={() => {
                onNavigate('genesis-store');
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img src={product.creator.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
              <div>
                <span className="font-mono text-[9px] text-zinc-500 uppercase block tracking-wider">CREATOR FIRM</span>
                <span className="text-xs font-semibold text-white group-hover:text-[#FF3E00] transition-colors flex items-center gap-1">
                  {product.creator.name}
                  <span className="w-2.5 h-2.5 bg-[#FF3E00] rounded-full inline-flex items-center justify-center text-[7px] text-zinc-950 font-bold">✓</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => onLikeProduct(product.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 font-mono text-[10px] text-zinc-400 hover:text-[#FF3E00] transition-colors cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${product.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{product.likes} LIKES</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black italic text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-zinc-455 text-xs font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing & High Priority Bid metrics */}
          <div className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-850 divide-y divide-zinc-900/40 space-y-4">
            <div className="flex justify-between items-center pb-2">
              <div>
                <span className="font-mono text-[9px] text-zinc-500 uppercase block tracking-widest">Buyout Price</span>
                <span className="font-mono text-2xl font-bold text-white">
                  {product.price.toLocaleString()} <span className="text-xs text-[#FF3E00] font-normal">USDC</span>
                </span>
              </div>
              {product.hasBid && (
                <div className="text-right">
                  <span className="font-mono text-[9px] text-[#FF3E00] uppercase block tracking-widest font-semibold">Active Bid Threshold</span>
                  <span className="font-mono text-2xl font-bold text-[#FF3E00]">
                    {product.currentBid?.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">USDC</span>
                  </span>
                </div>
              )}
            </div>

            {/* Custom option options toggles */}
            <div className="pt-4 space-y-2">
              <label className="font-mono text-[10px] text-zinc-404 uppercase tracking-widest">Preloaded Configuration</label>
              <div className="grid grid-cols-2 gap-2" id="option-selector-radio">
                {[
                  'Standard Module Core',
                  'Enterprise Hyper-Link Array'
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-2.5 text-left border rounded text-[11px] font-mono transition-all ${
                      selectedOption === opt
                        ? 'bg-zinc-900 border-[#FF3E00] text-white font-semibold'
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-805'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action purchase triggers */}
            {product.status === 'In Stock' ? (
              <div className="pt-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCartLocal}
                    disabled={justAdded}
                    className="flex-1 py-3 bg-[#0A0A0A] hover:bg-[#FF3E00] text-white font-mono text-[11px] uppercase tracking-widest border border-zinc-800 hover:border-[#FF3E00] transition-all cursor-pointer flex items-center justify-center gap-2"
                    id="details-add-to-cart"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#FF3E00] group-hover:text-white" />
                    <span>{justAdded ? 'CONNECTED INC...' : 'ADD TO CART'}</span>
                  </button>

                  <button
                    onClick={() => onBuyNow(product, selectedOption)}
                    className="flex-1 py-4 bg-white text-black font-semibold font-mono text-[11px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer border border-white hover:border-[#FF3E00]"
                    id="details-buy-now"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 text-center py-3 bg-zinc-900/40 border border-zinc-900/60 rounded-lg text-xs font-mono text-zinc-500">
                {product.status === 'Launching Soon' ? 'SYSTEM REGISTERED - PRE-ORD ACTIVE VIA DISCORD' : 'RESOURCES DEPLETED'}
              </div>
            )}
          </div>

          {/* Interactive Bidding Portal widget */}
          {product.status === 'In Stock' && (
            <div className="p-5 rounded-xl bg-purple-950/5 border border-purple-900/20 space-y-3">
              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Consensus Bidding Lane
              </span>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                Unlock high-priority processing speeds by submitting an over-bidding smart contract. Total bid is locked in the contract state until consensus verification.
              </p>

              {/* Dynamic Sparkline Bid Trend visualization using Recharts */}
              <div className="bg-zinc-950/60 border border-purple-500/10 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-ping" />
                    <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-black">Bid Trend History & Sentiment</span>
                  </div>
                  <span className="font-mono text-[8px] text-purple-400 bg-purple-950/40 border border-purple-900/40 px-1.5 py-0.5 rounded tracking-wide font-extrabold uppercase">
                    5-Points Wave
                  </span>
                </div>

                <div className="h-20 w-full" id="bid-history-sparkline-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bidHistoryData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id="purpleGradientGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip
                        cursor={{ stroke: '#FF3E00', strokeWidth: 1, strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-zinc-950/95 border border-[#FF3E00]/30 p-2 rounded-lg text-left shadow-2xl font-mono text-[9px] max-w-[130px]">
                                <span className="text-zinc-500 block text-[8px] uppercase">{payload[0].payload.name}</span>
                                <span className="font-bold text-[#FF3E00] leading-none mt-0.5 block">{payload[0].value?.toLocaleString()} USDC</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#A855F7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#purpleGradientGlow)"
                        dot={{ r: 1.5, stroke: '#A855F7', strokeWidth: 1, fill: '#09090b' }}
                        activeDot={{ r: 4.5, stroke: '#FF3E00', strokeWidth: 1.5, fill: '#09090b' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sub-trend status badge indicators */}
                <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-purple-950/45 text-center font-mono text-[8px]">
                  {bidHistoryData.map((d, index) => {
                    const isLatest = index === bidHistoryData.length - 1;
                    return (
                      <div 
                        key={d.name} 
                        className={`flex flex-col p-1 rounded border ${
                          isLatest 
                            ? 'bg-[#FF3E00]/10 border-[#FF3E00]/25 text-[#FF3E00]' 
                            : 'bg-zinc-900/30 border-zinc-850 text-zinc-400'
                        }`}
                        title={`${d.name}: ${d.value} USDC`}
                      >
                        <span className="text-[7px] text-zinc-500 truncate leading-tight">{d.name.split(' ')[1]}</span>
                        <span className="font-semibold mt-0.5 leading-none">{d.value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCustomBid} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">USDC</span>
                  <input
                    type="number"
                    step="1"
                    placeholder={`min ${(product.hasBid && product.currentBid ? product.currentBid : product.price) + 15}`}
                    value={userBid}
                    onChange={(e) => setUserBid(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={bidSuccess}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {bidSuccess ? 'PLACING...' : 'PLACE BID'}
                </button>
              </form>
            </div>
          )}

          {/* Secure details blueprint parameters */}
          <div className="p-5 rounded-xl bg-zinc-950/20 border border-zinc-900 space-y-4" id="blueprint-details-sidebar">
            <h3 className="font-display text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Dynamic Telemetry Blueprint
            </h3>
            
            <div className="grid grid-cols-2 gap-3 divide-y divide-zinc-900/40 pt-1">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="pt-2 flex flex-col">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">{key}</span>
                  <span className="text-xs font-mono font-medium text-zinc-300 mt-0.5">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Related Items recommendation block */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-zinc-850" id="suggested-related-section">
          <div className="flex justify-between items-end">
            <div>
              <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase mb-1 block">System Matches</span>
              <h2 className="font-display text-xl sm:text-2xl font-black italic text-white">Suggested Resource Modules</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  setActiveImageIndex(0);
                }}
                className="border border-zinc-850 rounded-xl bg-zinc-950/40 hover:border-[#FF3E00] transition-all cursor-pointer p-4 flex gap-4 items-center group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-xs font-bold italic text-white truncate group-hover:text-[#FF3E00] transition-colors">
                    {p.name}
                  </h4>
                  <span className="font-mono text-[10px] text-[#FF3E00] block mt-0.5">{p.category}</span>
                  <span className="font-mono text-[11px] font-bold text-white group-hover:text-[#FF3E00] mt-1 block">
                    {p.price.toLocaleString()} USDC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
