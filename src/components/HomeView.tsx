import React from 'react';
import { motion } from 'motion/react';
import { Activity, Cpu, ShieldCheck, Database, Server, Compass, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  onSelectProduct: (product: Product) => void;
  featuredProducts: Product[];
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProduct,
  featuredProducts,
  preferences,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Animation variants scaled for accessibility
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: isReduced ? 0 : 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: isReduced ? 0 : 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const pulseEffect = isReduced ? {} : {
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: 2.5 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-16 pb-20"
      id="home-view-container"
    >
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF3E00]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#FF3E00]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Hero Gate */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 space-y-8" id="hero-gate-section">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-805 bg-zinc-950/90 text-[10px] font-mono tracking-[0.2em] text-[#FF3E00] uppercase"
          id="hero-badge"
        >
          <Zap className="w-3 h-3 text-[#FF3E00]" />
          <span>Neo-Genx Concurrent Protocol Active</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl sm:text-7xl font-black italic tracking-tight text-white leading-none pt-4"
          id="hero-header-title"
        >
          Explore the Future of <br />
          <span className="strikethrough-accent text-[#FF3E00] not-italic font-sans font-bold tracking-[0.1em] text-3xl sm:text-5xl uppercase mt-4 block">
            Decentralized Commerce
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-zinc-400 text-sm max-w-2xl mx-auto font-sans font-light leading-relaxed tracking-wide"
          id="hero-description"
        >
          Deploy hardware nodes, compute layers, and secure cryptographic key tokens. 
          The unified DePIN gateway for the secure exchange of digital-physical infrastructure assets.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6"
          id="hero-actions"
        >
          <button
            onClick={() => onNavigate('marketplace')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold font-mono text-[11px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 group border border-white hover:border-[#FF3E00]"
            id="explore-marketplace-btn"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onNavigate('auth')}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-[#FF3E00] border border-zinc-800 hover:border-[#FF3E00] text-zinc-300 hover:text-white font-semibold font-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
            id="enter-gateway-btn"
          >
            <span>Initialize Identity</span>
            <Sparkles className="w-4 h-4 text-[#FF3E00]" />
          </button>
        </motion.div>
      </section>

      {/* Protocol Live Metrics */}
      <motion.section 
        variants={itemVariants} 
        className="w-full max-w-7xl mx-auto"
        id="live-metrics-section"
      >
        <div className={`p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 ${isGlass ? 'backdrop-blur-md' : ''}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 divide-y md:divide-y-0 md:divide-x divide-zinc-850">
            <div className="flex flex-col justify-center items-center text-center p-3" id="metric-block-height">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-11">
                <Activity className="w-3.5 h-3.5 text-zinc-500" /> Network Height
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white">#14,842,912</span>
              <span className="text-[9px] font-mono text-[#FF3E00] uppercase tracking-wider mt-1">● Synced Realtime</span>
            </div>
            
            <div className="flex flex-col justify-center items-center text-center p-3 pt-6 md:pt-3" id="metric-active-nodes">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-11">
                <Server className="w-3.5 h-3.5 text-zinc-500" /> Active Nodes
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#FF3E00]">124,902 Units</span>
              <span className="text-[9px] font-mono text-[#FF3E00] uppercase tracking-wider mt-1">+14% Epoch Gain</span>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-3 pt-6 md:pt-3" id="metric-bandwidth">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-11">
                <Database className="w-3.5 h-3.5 text-zinc-500" /> Layer Cap
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white">14.24 Petabytes</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide mt-1">Decentralized SSD rings</span>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-3 pt-6 md:pt-3" id="metric-yield">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-11">
                <Cpu className="w-3.5 h-3.5 text-zinc-500" /> Active Stakers
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#FF3E00]">4.82% APR</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide mt-1">Verified via ZK Proofs</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Drops Carousel/List */}
      <section className="space-y-6 max-w-7xl mx-auto" id="featured-drops-section">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase mb-1 block">Ecosystem Prime Items</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black italic text-white leading-tight">Featured Hardware & Keys</h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 hover:text-[#FF3E00] transition-colors cursor-pointer group"
            id="view-all-featured-btn"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 3).map((product) => (
            <motion.div
              key={product.id}
              whileHover={isReduced ? {} : { y: -6, borderColor: '#FF3E00' }}
              className={`flex flex-col justify-between border border-zinc-850 rounded-xl bg-zinc-950/40 overflow-hidden cursor-pointer group ${isGlass ? 'backdrop-blur-sm' : ''}`}
              onClick={() => {
                onSelectProduct(product);
                onNavigate('details');
              }}
              id={`featured-card-${product.id}`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-800/40">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-zinc-950/95 text-[#FF3E00] border border-zinc-800 rounded">
                  {product.category}
                </span>
                {product.status !== 'In Stock' && (
                  <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-zinc-950/95 border rounded ${
                    product.status === 'Launching Soon' ? 'text-amber-400 border-amber-500/40' : 'text-rose-400 border-rose-500/40'
                  }`}>
                    {product.status}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold italic text-white group-hover:text-[#FF3E00] transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-900/40">
                  <div>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase block tracking-wider">Fixed Price</span>
                    <span className="font-mono text-sm font-bold text-white">{product.price.toLocaleString()} USDC</span>
                  </div>
                  {product.hasBid && (
                    <div className="text-right">
                      <span className="font-mono text-[9px] text-[#FF3E00] uppercase block tracking-wider font-semibold">Active Pool Bid</span>
                      <span className="font-mono text-sm font-bold text-[#FF3E00]">
                        {product.currentBid?.toLocaleString()} USDC
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* "Built for the Ecosystem" Bento Grid */}
      <section className="space-y-6 max-w-7xl mx-auto" id="ecosystem-bento-section">
        <div className="border-b border-zinc-800 pb-4">
          <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase mb-1 block">Engineering Specifications</span>
          <h2 className="font-display text-2xl sm:text-3xl font-black italic text-white leading-tight">Built for the Security Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Quantum Ledger */}
          <div className={`p-6 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-4 flex flex-col justify-between ${isGlass ? 'backdrop-blur-sm' : ''}`} id="bento-card-zk">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-855">
                <ShieldCheck className="w-5 h-5 text-[#FF3E00]" />
              </div>
              <h3 className="font-display text-lg font-black italic text-white">ZK-Ledger Encryption</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Zero-knowledge validation protocols guarantee total node telemetry security. Host hardware arrays anonymously while receiving rewards strictly via dual-key verified smart contracts.
              </p>
            </div>
            <span className="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase font-semibold">Layer 2 Validation Enabled</span>
          </div>

          {/* Card 2: GPU Render Mesh */}
          <div className={`p-6 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-4 flex flex-col justify-between ${isGlass ? 'backdrop-blur-sm' : ''}`} id="bento-card-gpu">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-855">
                <Cpu className="w-5 h-5 text-[#FF3E00]" />
              </div>
              <h3 className="font-display text-lg font-black italic text-white">GPU Power Grid</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Plug and play into global clusters designed for dynamic AI agent execution, 3D graphics rendering, or zero-knowledge proof mining pools. Sell your idle computing shares directly on-chain.
              </p>
            </div>
            <span className="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase font-semibold">Hyper-Scalable Multiplexing</span>
          </div>

          {/* Card 3: Mesh Routing Satellite */}
          <div className={`p-6 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-4 flex flex-col justify-between ${isGlass ? 'backdrop-blur-sm' : ''}`} id="bento-card-satellite">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-855">
                <Compass className="w-5 h-5 text-[#FF3E00]" />
              </div>
              <h3 className="font-display text-lg font-black italic text-white">Orbital Link Network</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Modular multi-band and satellite uplink expansion interfaces connect edge nodes under tough climatic conditions, creating fault-tolerant regional mesh network relays.
              </p>
            </div>
            <span className="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase font-semibold">LoRa & Ka-Band Overlays</span>
          </div>
        </div>
      </section>

      {/* Protocol Warning/Call to Action Footer Banner */}
      <motion.section 
        variants={itemVariants} 
        className="max-w-7xl mx-auto"
        id="cta-banner-section"
      >
        <div className="relative overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 p-8 sm:p-12 text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3E00]/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="font-display text-2xl sm:text-4xl font-black italic text-white leading-tight">Ready to deploy hardware node arrays?</h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Link your verified cryptographic keys, customize interface layouts, view stats feeds and start acquiring decentralized computational nodes.
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-8 py-4 bg-white text-black font-semibold font-mono text-[11px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer flex items-center gap-2 border border-white hover:border-[#FF3E00]"
              id="start-deploying-btn"
            >
              <span>Initialize Node Gateway</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
