import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, PlusCircle, Trash2, ArrowUpRight, Cpu, Check, HelpCircle, AlertCircle, ShoppingBag, Terminal } from 'lucide-react';
import { Product, UserProfile } from '../types';

interface SellAssetViewProps {
  userProfile: UserProfile;
  onAddProduct: (product: Product) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth' | 'sell') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
}

// Preset abstract tech/hardware illustrations for easy user selection
const PRESET_IMAGES = [
  {
    id: 'abstract-chip',
    name: 'Quantum SoC',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'server-array',
    name: 'Network Arrays',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cyberpunk-hardware',
    name: 'Encrypted Rig',
    url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'glowing-pcb',
    name: 'Cyber Core Block',
    url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80'
  }
];

export const SellAssetView: React.FC<SellAssetViewProps> = ({
  userProfile,
  onAddProduct,
  onNavigate,
  preferences
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('250.00');
  const [category, setCategory] = useState<'Hardware Nodes' | 'Compute Units' | 'Genesis Keys' | 'Special Modules'>('Hardware Nodes');
  const [status, setStatus] = useState<'In Stock' | 'Launching Soon' | 'Sold Out'>('In Stock');
  
  // Image handling (preset vs custom)
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_IMAGES[0].id);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUsingCustomImage, setIsUsingCustomImage] = useState(false);

  // Specs lists
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Preloaded SDK', value: 'GENX Secure Daemon' },
    { key: 'Hardware Level', value: 'Level-3 Security' },
    { key: 'Ecosystem Lock', value: 'Neo-Compatible' }
  ]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Highlights/Features
  const [features, setFeatures] = useState<string[]>([
    'Secure offline cryptographic handshake system',
    'Broadcasting encrypted microtelemetry metrics live'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Errors & Feedback status
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successProduct, setSuccessProduct] = useState<Product | null>(null);

  // Handle Specifications actions
  const addSpecRow = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs([...specs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Handle Features actions
  const addFeatureItem = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const removeFeatureItem = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // On form publish submit
  const handlePublishAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Asset Title / Name field is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please input a compelling technical specification summary or description.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Price must be a valid numeric quantity greater than 0 USDC.');
      return;
    }

    setIsSubmitting(true);

    // Formulate final images
    const activeImageUrl = isUsingCustomImage 
      ? (customImageUrl.trim() || PRESET_IMAGES[0].url)
      : (PRESET_IMAGES.find(p => p.id === selectedPresetId)?.url || PRESET_IMAGES[0].url);

    // Map rows array to Key Value Object matching standard Product schema
    const specsObject: Record<string, string> = {};
    specs.forEach(item => {
      specsObject[item.key] = item.value;
    });

    // Forge simulated ID
    const generatedId = `custom-asset-${Date.now()}`;

    const newProduct: Product = {
      id: generatedId,
      name: name.trim().toUpperCase(),
      description: description.trim(),
      price: parsedPrice,
      category,
      status,
      images: [activeImageUrl],
      specs: specsObject,
      features: features.length > 0 ? features : ['Standard authorized hardware module of the Neo-GenX decentralized topology'],
      creator: {
        name: userProfile.username || 'DePIN Merchant',
        avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
        verified: true,
        followers: 1,
        itemsCount: 1,
        volume: '0 USDC'
      },
      likes: 0,
      hasLiked: false
    };

    // Simulate cryptographic validation & indexing delay
    setTimeout(() => {
      setIsSubmitting(false);
      onAddProduct(newProduct);
      setSuccessProduct(newProduct);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="sell-something-view">
      
      {/* Header telemetry node */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8" id="sell-view-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#FF3E00]/10 text-[#FF3E00] border border-[#FF3E00]/20 font-mono text-[9px] uppercase tracking-widest font-black rounded">
              Depot Portal
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-black italic text-white uppercase tracking-tight">
            Syndicate New Asset
          </h2>
          <p className="text-zinc-400 text-xs font-light">
            Register and publish hardware nodes, genesis keys or custom modules into the decentralized Neo-GenX marketplace index.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-4 py-2 border border-zinc-850 hover:border-zinc-700 bg-zinc-950 font-mono text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer rounded"
          >
            Cancel Listing
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {successProduct ? (
          /* SUCCESS SCREEN DISPLAY */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-xl mx-auto border border-[#FF3E00]/40 bg-[#0C0C0C] p-8 rounded-2xl text-center space-y-6 shadow-2xl shadow-[#FF3E00]/5 my-6"
            id="sell-success-container"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 mx-auto flex items-center justify-center text-[#FF3E00] select-none">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-[0.2em] font-bold block">CRYPTO INDEXING HANDSHAKE COMPLETE</span>
              <h3 className="font-display text-xl font-black italic text-white uppercase">{successProduct.name} IS LIVE</h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed max-w-sm mx-auto">
                Your cryptographic asset block was generated, signed with matching credentials <span className="text-white font-mono font-bold block mt-1">{userProfile.connectedWallet}</span> and injected directly into the active decentralized catalog.
              </p>
            </div>

            {/* Micro receipt summary */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-4 font-mono text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between border-b border-zinc-900/40 pb-2 text-[10px] text-zinc-500 font-bold uppercase">
                <span>Property</span>
                <span>Value Log</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Node Gen-ID:</span>
                <span className="text-zinc-300"># {successProduct.id.substring(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Broadcast Category:</span>
                <span className="text-[#FF3E00] font-bold">{successProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Established Valuation:</span>
                <span className="text-white font-bold">{successProduct.price.toLocaleString()} USDC</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              <button
                onClick={() => {
                  // Reset form
                  setName('');
                  setDescription('');
                  setPrice('250.00');
                  setCategory('Hardware Nodes');
                  setStatus('In Stock');
                  setSpecs([
                    { key: 'Preloaded SDK', value: 'GENX Secure Daemon' },
                    { key: 'Hardware Level', value: 'Level-3 Security' },
                    { key: 'Ecosystem Lock', value: 'Neo-Compatible' }
                  ]);
                  setFeatures([
                    'Secure offline cryptographic handshake system',
                    'Broadcasting encrypted microtelemetry metrics live'
                  ]);
                  setSuccessProduct(null);
                }}
                className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-90 w-full rounded border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                List Another
              </button>
              <button
                onClick={() => onNavigate('marketplace')}
                className="flex-1 py-2.5 bg-[#FF3E00] hover:bg-[#E03600] text-white font-mono text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer rounded flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3E00]/15"
              >
                <span>VISIT MARKETPLACE</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* CORE INPUT FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="sell-form-layout">
            
            {/* Left Column: Input Fields */}
            <form onSubmit={handlePublishAsset} className="lg:col-span-8 space-y-6" id="sell-asset-form">
              
              {formError && (
                <div className="p-3.5 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400 flex items-center gap-2.5 font-mono animate-shake" id="sell-form-error-banner">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Segment 1: Core Parameters */}
              <div className="bg-zinc-950/25 border border-zinc-850 rounded-xl p-5 md:p-6 space-y-5" id="form-section-primary">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3" id="sec-1-title">
                  <Cpu className="w-4 h-4 text-[#FF3E00]" />
                  <span className="font-mono text-[10px] font-black uppercase text-zinc-300 tracking-wider">01 / GENERAL BLOCK CREDENTIALS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Asset Title / Name <span className="text-[#FF3E00]">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. ULTRA COMPUTATION CHIP V4"
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#FF3E00] transition-colors"
                      id="sell-input-name"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Brokered Category <span className="text-[#FF3E00]">*</span></label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-[#0A0A0A] border border-zinc-850 rounded text-xs text-zinc-300 focus:outline-none focus:border-[#FF3E00] cursor-pointer"
                      id="sell-select-category"
                    >
                      <option value="Hardware Nodes">Hardware Nodes</option>
                      <option value="Compute Units">Compute Units</option>
                      <option value="Genesis Keys">Genesis Keys</option>
                      <option value="Special Modules">Special Modules</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Initial Listing Value (USDC) <span className="text-[#FF3E00]">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="250.00"
                        className="w-full pl-3 pr-16 py-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white font-mono focus:outline-none focus:border-[#FF3E00] transition-colors"
                        id="sell-input-price"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-500 font-bold uppercase select-none">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Supply Allocation Status</label>
                    <div className="flex gap-3" id="sell-status-bullets">
                      {(['In Stock', 'Launching Soon', 'Sold Out'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st)}
                          className={`flex-1 py-2 px-3 border rounded text-2xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${
                            status === st 
                              ? 'border-[#FF3E00] bg-[#FF3E00]/5 text-white' 
                              : 'border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Persuasive Description / Specs Manual <span className="text-[#FF3E00]">*</span></label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly index the hardware framework, throughput metrics, or validation yields..."
                      rows={4}
                      className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00] font-light resize-none leading-relaxed"
                      id="sell-input-desc"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Segment 2: Visual Selection */}
              <div className="bg-zinc-950/25 border border-zinc-850 rounded-xl p-5 md:p-6 space-y-4" id="form-section-visuals">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3" id="sec-2-title">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF3E00]" />
                    <span className="font-mono text-[10px] font-black uppercase text-zinc-300 tracking-wider">02 / VISUAL INDEX THUMBNAIL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUsingCustomImage(false)}
                      className={`font-mono text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors cursor-pointer ${
                        !isUsingCustomImage ? 'bg-[#FF3E00] text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Preset Artwork
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUsingCustomImage(true)}
                      className={`font-mono text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors cursor-pointer ${
                        isUsingCustomImage ? 'bg-[#FF3E00] text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                {!isUsingCustomImage ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5" id="presets-selector-grid">
                    {PRESET_IMAGES.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`group relative overflow-hidden rounded-lg aspect-video border cursor-pointer transition-all ${
                          selectedPresetId === preset.id 
                            ? 'border-[#FF3E00] ring-1 ring-[#FF3E00]/50' 
                            : 'border-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-2">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-300 truncate block w-full">
                            {preset.name}
                          </span>
                        </div>
                        {selectedPresetId === preset.id && (
                          <div className="absolute top-1 right-1 bg-[#FF3E00] text-white p-0.5 rounded-full shadow-lg">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5" id="custom-image-url-field">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">External Asset Artwork URL (Unsplash/Imgur links recommended)</label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-1518770660439-4636190af475?..."
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white font-mono focus:outline-none focus:border-[#FF3E00]"
                      id="custom-image-input"
                    />
                  </div>
                )}
              </div>

              {/* Segment 3: Custom Technical Specifications */}
              <div className="bg-zinc-950/25 border border-zinc-850 rounded-xl p-5 md:p-6 space-y-4" id="form-section-specs">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3" id="sec-3-title">
                  <Terminal className="w-4 h-4 text-[#FF3E00]" />
                  <span className="font-mono text-[10px] font-black uppercase text-zinc-300 tracking-wider">03 / DETAILED TECHNICAL SPECS</span>
                </div>

                {/* Grid list of active specs */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="active-specs-row-display">
                  {specs.length === 0 ? (
                    <p className="text-zinc-650 font-mono text-[10px] italic py-2 text-center select-none">No custom specifications indexed.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {specs.map((spec, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-zinc-950/85 border border-zinc-900 rounded-md text-3s text-zinc-300 font-mono">
                          <span className="text-zinc-500 font-bold uppercase truncate max-w-[120px]" title={spec.key}>{spec.key}:</span>
                          <div className="flex items-center gap-2 max-w-[180px]">
                            <span className="text-zinc-150 truncate block" title={spec.value}>{spec.value}</span>
                            <button
                              type="button"
                              onClick={() => removeSpecRow(idx)}
                              className="text-zinc-500 hover:text-[#FF3E00] cursor-pointer transition-colors p-0.5"
                              title="Delete Specific Value row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub form for spec selection Addition */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2" id="spec-add-control-panel">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Key (e.g. Memory Size)"
                    className="flex-1 px-3 py-1.5 bg-zinc-950/90 border border-zinc-850 rounded text-3s font-mono text-zinc-300 placeholder-zinc-700"
                    id="new-spec-key"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Value (e.g. 128GB LPDDR5)"
                    className="flex-1 px-3 py-1.5 bg-zinc-950/90 border border-zinc-850 rounded text-3s font-mono text-zinc-300 placeholder-zinc-700"
                    id="new-spec-value"
                  />
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-[#FF3E00] hover:text-white hover:bg-[#FF3E00] transition-all font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer rounded"
                    id="add-spec-button"
                  >
                    ADD ROW
                  </button>
                </div>
              </div>

              {/* Segment 4: Feature Highlights bulletpoints list */}
              <div className="bg-zinc-950/25 border border-zinc-850 rounded-xl p-5 md:p-6 space-y-4" id="form-section-highlights">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3" id="sec-4-title">
                  <Check className="w-4 h-4 text-[#FF3E00]" />
                  <span className="font-mono text-[10px] font-black uppercase text-zinc-300 tracking-wider">04 / ASSET FEATURES & GAIN HIGHLIGHTS</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1" id="active-features-list">
                  {features.length === 0 ? (
                    <p className="text-zinc-655 font-mono text-[10px] italic py-2 text-center select-none">No feature highlights indexed.</p>
                  ) : (
                    features.map((feat, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-zinc-950/80 border border-zinc-900 rounded-lg text-xs text-zinc-300 gap-3">
                        <span className="font-light truncate leading-relaxed text-zinc-300 block w-full">{feat}</span>
                        <button
                          type="button"
                          onClick={() => removeFeatureItem(idx)}
                          className="text-zinc-550 hover:text-red-400 p-1 cursor-pointer transition-colors"
                          title="Purge bullet point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub input addition row */}
                <div className="flex gap-2 pt-1" id="feature-addition-sub-panel">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Highlight features (e.g. Ultra high density pass-through liquid heatsink)"
                    className="flex-1 px-3 py-2 bg-[#0C0C0C] border border-zinc-850 rounded text-xs text-zinc-300 placeholder-zinc-750"
                    id="new-feature-text"
                  />
                  <button
                    type="button"
                    onClick={addFeatureItem}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-[#FF3E00] hover:text-white hover:bg-[#FF3E00] font-mono text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all rounded"
                  >
                    ADD INDEX
                  </button>
                </div>
              </div>

              {/* Submit Syndication block */}
              <div className="pt-2" id="form-submit-block">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4.5 bg-[#FF3E00] hover:bg-[#E03600] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-850 text-white font-mono text-xs uppercase font-black tracking-widest transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 border-2 border-[#FF3E00] disabled:cursor-not-allowed shadow-xl shadow-[#FF3E00]/10"
                  id="sell-form-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                      <span>AUTHORIZING AND INJECTING SYNDICATE LOGS...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4.5 h-4.5" />
                      <span>AUTHORIZE BROADCST & PUBLISH ASSET LOGS</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Right Column: Pre-Visualization card */}
            <div className="lg:col-span-4" id="sell-pre-vis-column">
              <div className="sticky top-24 space-y-4" id="pre-vis-sticky-container">
                <div className="px-4 py-2 border border-zinc-900 bg-zinc-950/30 rounded-lg">
                  <span className="font-mono text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider block">PRE-BROADCST LIVE SPECIMEN</span>
                </div>

                <div className="border border-zinc-850 hover:border-zinc-700 bg-zinc-950/80 rounded-xl overflow-hidden transition-all duration-350 shadow-xl group">
                  <div className="relative aspect-video overflow-hidden border-b border-zinc-900 bg-zinc-950">
                    <img
                      src={
                        isUsingCustomImage 
                          ? (customImageUrl.trim() || PRESET_IMAGES[0].url)
                          : (PRESET_IMAGES.find(p => p.id === selectedPresetId)?.url || PRESET_IMAGES[0].url)
                      }
                      alt="Syndicate Preview"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5" id="preview-tags">
                      <span className="px-2 py-0.5 bg-zinc-950/90 text-xs text-zinc-150 uppercase font-mono border border-zinc-800 rounded">
                        {category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 shrink bg-[#FF3E00] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded leading-normal">
                      MOCK ACTIVE
                    </div>
                  </div>

                  <div className="p-4.5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-black italic uppercase tracking-tight text-white group-hover:text-[#FF3E00] transition-colors truncate">
                        {name.trim() ? name.trim().toUpperCase() : 'ASSET_IDENTIFIER_PENDING'}
                      </h4>
                      <p className="text-zinc-500 text-[11px] leading-relaxed font-light line-clamp-2 min-h-8">
                        {description.trim() ? description.trim() : 'Decentralized topology spec manual has not been generated yet...'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                      <div className="flex flex-col">
                        <span className="font-mono text-[8.5px] text-zinc-500 uppercase font-bold tracking-wider">VALUATION</span>
                        <span className="font-mono font-bold text-sm text-white">
                          {(parseFloat(price) || 0).toLocaleString()} USDC
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-mono text-[8.5px] text-zinc-500 uppercase font-bold tracking-wider">STATUS</span>
                        <span className="font-mono text-[9.5px] text-[#FF3E00] font-bold uppercase">
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2.5 border-t border-zinc-900/40 text-[10px] text-zinc-500 font-mono">
                      <img
                        src={userProfile.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80"}
                        alt="Merchant avatar"
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span>MERCHANT: <span className="text-zinc-350 font-bold">{userProfile.username}</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900/60 p-4.5 rounded-xl space-y-3.5" id="agreement-node-box">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-500 text-3s leading-relaxed font-mono uppercase font-bold">
                      By brokering a connection, you authorize listing indexing on standard client-side storage keys. Other simulator sandbox entities are simulated.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
