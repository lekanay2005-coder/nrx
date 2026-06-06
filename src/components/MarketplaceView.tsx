import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Heart, ShoppingBag, Eye, Star, RotateCcw, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface MarketplaceViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  onAddToCart: (product: Product) => void;
  onLikeProduct: (productId: string) => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
  onPlaceBid?: (productId: string, amount: number) => Promise<boolean>;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onAddToCart,
  onLikeProduct,
  preferences,
  onPlaceBid,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'likes-desc'>('price-asc');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Interaction feedback
  const [biddingProductId, setBiddingProductId] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState<string>('');
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setMaxPrice(4000);
    setSelectedStatuses([]);
    setSortBy('price-asc');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                            product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= maxPrice;
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(product.status);
      return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (sortBy === 'likes-desc') {
        return b.likes - a.likes;
      }
      return 0;
    });
  }, [products, search, selectedCategories, maxPrice, selectedStatuses, sortBy]);

  // Handle local Bid submission
  const handlePlaceBid = (productId: string, baselineMin: number) => {
    const numericBid = parseFloat(bidValue);
    if (isNaN(numericBid) || numericBid <= baselineMin) {
      alert(`Bid must be greater than current price/bid of ${baselineMin} USDC`);
      return;
    }

    setBidSuccess(productId);
    if (onPlaceBid) {
      onPlaceBid(productId, numericBid).then(() => {
        setBidSuccess(null);
        setBiddingProductId(null);
        setBidValue('');
      });
    } else {
      setTimeout(() => {
        // Find the product and update its current bid (simulated inside parent state, or we just alert success after close)
        const mockProduct = products.find(p => p.id === productId);
        if (mockProduct) {
          mockProduct.currentBid = numericBid;
          mockProduct.hasBid = true;
        }
        setBidSuccess(null);
        setBiddingProductId(null);
        setBidValue('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 pb-16" id="marketplace-view-container">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 pb-5" id="marketplace-header-banner">
        <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> SECURE TRADING ZONE
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-black italic text-white leading-tight">
          Decentralized Resource Marketplace
        </h1>
        <p className="text-zinc-400 text-xs font-light mt-2 max-w-2xl tracking-wide leading-relaxed">
          Purchase physical server blocks, high speed nodes, and cryptographic access keys direct from source developers.
        </p>
      </div>

      {/* Control Actions / Mobile Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" id="marketplace-controls">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search crypto arrays, nodes, router specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF3E00] transition-colors"
            id="market-search-input"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-805 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-805 transition-colors cursor-pointer md:hidden"
            id="mobile-filters-toggle-btn"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {selectedCategories.length + selectedStatuses.length > 0 && `(${selectedCategories.length + selectedStatuses.length})`}</span>
          </button>

          {(search !== '' || selectedCategories.length > 0 || selectedStatuses.length > 0 || maxPrice !== 4000) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-mono text-zinc-400 hover:text-[#FF3E00] transition-colors"
              id="clear-all-filters-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Full Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8" id="marketplace-grid-layout">
        {/* Sidebar Filters - Desktop mode */}
        <aside className={`md:block space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'} border border-zinc-850 p-5 rounded-xl bg-zinc-950/40 max-h-fit`} id="filters-sidebar">
          <div className="font-display text-sm font-black italic text-white tracking-wide border-b border-zinc-900 pb-2 flex justify-between items-center">
            <span>PARAMETER CHECKS</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          {/* Category checklist */}
          <div className="space-y-2.5" id="category-filter-group">
            <h4 className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-normal">Sectors</h4>
            <div className="space-y-2">
              {['Hardware Nodes', 'Compute Units', 'Genesis Keys', 'Special Modules'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-xs text-zinc-350 hover:text-white cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="rounded border-zinc-800 bg-zinc-900 text-[#FF3E00] accent-[#FF3E00] focus:ring-[#FF3E00]/20 cursor-pointer"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5" id="price-filter-group">
            <div className="flex justify-between items-center">
              <h4 className="font-mono text-[10px] text-zinc-405 uppercase tracking-widest font-normal">Max Price</h4>
              <span className="font-mono text-xs text-[#FF3E00] font-bold">{maxPrice.toLocaleString()} USDC</span>
            </div>
            <input
              type="range"
              min="100"
              max="4000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#FF3E00] cursor-pointer rounded"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-650">
              <span>100 USDC</span>
              <span>4k USDC</span>
            </div>
          </div>

          {/* Status checklist */}
          <div className="space-y-2.5" id="status-filter-group">
            <h4 className="font-mono text-[10px] text-zinc-405 uppercase tracking-widest font-normal">Availability</h4>
            <div className="space-y-2">
              {['In Stock', 'Launching Soon', 'Sold Out'].map((status) => (
                <label key={status} className="flex items-center gap-2.5 text-xs text-zinc-350 hover:text-white cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="rounded border-zinc-800 bg-zinc-900 text-[#FF3E00] accent-[#FF3E00] focus:ring-[#FF3E00]/20 cursor-pointer"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Catalog Grid */}
        <section className="md:col-span-3 space-y-8" id="catalog-products-section">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl space-y-4">
              <SlidersHorizontal className="w-8 h-8 mx-auto text-zinc-600" />
              <div className="space-y-1">
                <p className="text-zinc-300 font-medium">No resource arrays found</p>
                <p className="text-zinc-500 text-xs">Try adjusting your filter parameters or resetting the search key.</p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-white rounded border border-zinc-800 font-mono"
              >
                Reset Parameters
              </button>
            </div>
          ) : (
            <>
              {/* Product sorting option row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/25 border border-zinc-850 p-3 sm:px-4 rounded-xl mb-4" id="catalog-sort-header">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  AVAILABLE ASSETS: <span className="text-[#FF3E00] font-bold">{filteredProducts.length}</span> INDEXED
                </span>
                <div className="flex items-center gap-2" id="catalog-sort-select-container">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">SORT BY</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="p-1.5 bg-[#0A0A0A] border border-zinc-800 hover:border-[#FF3E00] hover:text-white text-xs font-mono text-zinc-300 rounded focus:outline-none focus:border-[#FF3E00] transition-colors cursor-pointer"
                    id="catalog-sort-dropdown"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="likes-desc">Most Liked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProducts.slice(0, visibleCount).map((product) => {
                    const baselineMin = product.hasBid && product.currentBid ? product.currentBid : product.price;
                    return (
                      <motion.div
                        layout={!isReduced}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={product.id}
                        className={`group flex flex-col justify-between border border-zinc-850 rounded-xl bg-zinc-950/40 overflow-hidden relative ${isGlass ? 'backdrop-blur-sm' : ''}`}
                        id={`product-card-${product.id}`}
                      >
                        {/* Heart Wishlist Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLikeProduct(product.id);
                          }}
                          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-950/90 border border-zinc-800 hover:border-[#FF3E00]/40 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer"
                          title="Like Item"
                        >
                          <Heart className={`w-3.5 h-3.5 ${product.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Bottom image overlay */}
                        <div
                          className="relative aspect-square w-full bg-zinc-900 cursor-pointer overflow-hidden border-b border-zinc-900/40"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-[10px] font-mono tracking-wider uppercase flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-[#FF3E00]" /> Secure Detailed Specs
                            </span>
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-wider font-semibold">
                                {product.category}
                              </span>
                              <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-400">
                                <Star className="w-3 h-3 text-[#FF3E00] fill-[#FF3E00]" />
                                <span>{product.likes}</span>
                              </span>
                            </div>

                            <h3
                              onClick={() => {
                                onSelectProduct(product);
                                onNavigate('details');
                              }}
                              className="font-display text-base font-bold italic text-white group-hover:text-[#FF3E00] transition-colors truncate cursor-pointer"
                            >
                              {product.name}
                            </h3>
                            
                            <p className="text-zinc-400 text-xs font-light line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

                          {/* Bid / Price States */}
                          <div className="pt-3 border-t border-zinc-900/60">
                            <div className="flex justify-between items-baseline mb-3">
                              <div>
                                <span className="font-mono text-[8px] text-zinc-500 uppercase block">Fixed Price</span>
                                <span className="font-mono text-xs font-semibold text-white">
                                  {product.price.toLocaleString()} USDC
                                </span>
                              </div>
                              {product.hasBid && (
                                <div className="text-right">
                                  <span className="font-mono text-[8px] text-[#FF3E00] uppercase block font-semibold">Highest Bid</span>
                                  <span className="font-mono text-xs font-bold text-[#FF3E00]">
                                    {product.currentBid?.toLocaleString()} USDC
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions bar inside card */}
                            <div className="flex gap-2 relative">
                              {biddingProductId === product.id ? (
                                <div className="absolute inset-0 bg-zinc-950 border border-zinc-800 rounded-lg p-2 z-20 flex items-center justify-between gap-1">
                                  <input
                                    type="number"
                                    placeholder={`min ${baselineMin + 10}`}
                                    value={bidValue}
                                    onChange={(e) => setBidValue(e.target.value)}
                                    className="w-1/2 p-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF3E00]"
                                  />
                                  <button
                                    onClick={() => handlePlaceBid(product.id, baselineMin)}
                                    disabled={bidSuccess === product.id}
                                    className="px-2 py-1 bg-[#FF3E00] hover:bg-orange-600 text-white text-[10px] font-bold font-mono rounded"
                                  >
                                    {bidSuccess === product.id ? 'VERIFY...' : 'SUBMIT'}
                                  </button>
                                  <button
                                    onClick={() => setBiddingProductId(null)}
                                    className="px-1 py-1 text-zinc-400 hover:text-white text-[10px]"
                                  >
                                    CANC
                                  </button>
                                </div>
                              ) : null}

                              {product.status === 'In Stock' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      onAddToCart(product);
                                    }}
                                    className="flex-1 py-1.5 px-3 bg-[#0A0A0A] hover:bg-[#FF3E00] hover:text-white border border-zinc-850 hover:border-[#FF3E00] text-xs font-mono font-medium rounded text-zinc-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setBiddingProductId(product.id);
                                      setBidValue((baselineMin + 15).toString());
                                    }}
                                    className="py-1.5 px-2.5 bg-zinc-950 hover:bg-[#FF3E00] hover:text-white border border-zinc-850 text-xs font-mono text-[#FF3E00] rounded cursor-pointer"
                                  >
                                    Bid
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    onSelectProduct(product);
                                    onNavigate('details');
                                  }}
                                  className="w-full py-1.5 bg-[#0A0A0A] hover:bg-[#FF3E00] hover:text-white border border-zinc-850 text-xs font-mono text-zinc-400 rounded cursor-pointer text-center"
                                >
                                  {product.status === 'Launching Soon' ? 'View Intel Core' : 'Sold Out Core'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Load More Trigger */}
              {filteredProducts.length > visibleCount && (
                <div className="flex justify-center pt-4" id="load-more-container">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="px-6 py-3 border border-zinc-800 bg-[#0A0A0A] hover:bg-[#FF3E00] hover:border-[#FF3E00] text-[10px] font-mono uppercase tracking-widest text-[#FF3E00] hover:text-white transition-all cursor-pointer"
                    id="load-more-assets-btn"
                  >
                    Load More Assets
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
