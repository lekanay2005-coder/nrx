import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Palette, Wallet, Compass, Save, RefreshCw, LogOut, Check, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', label: 'AI Blue' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', label: 'Grid Green' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', label: 'Drone Yellow' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', label: 'Chrome Grid' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', label: 'Spectre Violet' },
];

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean; highContrast: boolean };
  onUpdatePreference: (key: 'glassmorphism' | 'reduceMotion' | 'highContrast', value: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  preferences,
  onUpdatePreference,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Active vertical sub-tab state: 'profile' | 'wallet' | 'appearance'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'wallet' | 'appearance'>('profile');

  // Input states
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [customWallet, setCustomWallet] = useState(userProfile.connectedWallet);
  
  // Network simulation choice
  const [selectedNetwork, setSelectedNetwork] = useState<string>('GENX Security Mainnet');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulated Avatar File Upload states/handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      username,
      email,
      avatar,
      connectedWallet: customWallet
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleWalletReset = () => {
    const randomHex = `0x${Math.floor(100000 + Math.random() * 900000).toString(16)}...${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
    setCustomWallet(randomHex);
  };

  return (
    <div className="space-y-8 pb-16" id="settings-view-container">
      {/* Header */}
      <div className="border-b border-zinc-850 pb-5">
        <span className="font-mono text-xs text-[#FF3E00] tracking-widest uppercase">Ecosystem Configuration</span>
        <h1 className="font-display text-3xl font-black italic text-white leading-tight mt-1">System Settings Cockpit</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">
          RECONFIGURE PROTOCOL PARAMS • ALTERNATIVE KEY VALS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left pane: vertical sub-tabs navigation helper */}
        <nav className="md:col-span-3 space-y-2.5" id="settings-navigation-rail">
          {[
            { id: 'profile', label: 'Consignee Profile', icon: User },
            { id: 'wallet', label: 'Ledger Wallet', icon: Wallet },
            { id: 'appearance', label: 'Core Appearance', icon: Palette }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'profile' | 'wallet' | 'appearance')}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest transition-all text-left cursor-pointer border ${
                  activeSubTab === tab.id
                    ? 'bg-zinc-950 border-[#FF3E00] text-white'
                    : 'bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-[#FF3E00]' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Glowing support banner widget */}
          <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 mt-8">
            <h4 className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Core Support Gate
            </h4>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              Facing validation issues with your physical storage arrays? Signal our decentralized support team on-chain.
            </p>
            <button
              onClick={() => alert("Dispatching beacon to system developers... Support pipeline open.")}
              className="w-full py-2 bg-[#0A0A0A] hover:bg-zinc-900 text-zinc-300 font-mono text-[9.5px] rounded border border-zinc-800 uppercase tracking-wider cursor-pointer font-semibold transition-colors"
            >
              BROADCAST BEACON HELP
            </button>
          </div>
        </nav>

        {/* Right pane settings inputs configs */}
        <main className="md:col-span-9" id="settings-content-pane">
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-6 sm:p-8">
            {activeSubTab === 'profile' && (
              /* Tab 1: Profile forms */
              <form onSubmit={handleSaveProfile} className="space-y-6" id="settings-profile-form">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="font-display text-base font-bold italic text-white tracking-widest uppercase">Consignee Profile Configuration</h3>
                  <p className="text-zinc-500 text-xs font-sans mt-0.5">Overwrite credentials for receiving shipping documents and secure notifications.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block">Terminal Alias</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded focus:border-[#FF3E00] text-xs text-white placeholder-zinc-700 focus:outline-none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block">Primary Mail Address</label>
                    <input
                      type="email"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded focus:border-[#FF3E00] text-xs text-white focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Futuristic Interactive Avatar portal */}
                  <div className="space-y-4 sm:col-span-2 border-t border-zinc-900 pt-6 mt-4" id="avatar-biometrification-portal">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#FF3E00]/10 text-[#FF3E00] border border-[#FF3E00]/25 font-mono text-[9px] uppercase tracking-widest font-black rounded">
                        Biometric Avatar Node
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      
                      {/* Sub-grid left: Avatar circular preview */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-3.5 relative" id="avatar-live-preview-box">
                        <span className="font-mono text-[8px] text-zinc-500 uppercase font-black tracking-widest block self-start">
                          Live Specimen
                        </span>
                        
                        <div className="relative group">
                          <img
                            src={avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80"}
                            alt="Active Avatar Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-zinc-900 group-hover:border-[#FF3E00] transition-colors"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] font-mono text-white font-bold tracking-widest select-none pointer-events-none uppercase">
                            ACTIVE NODE
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="font-mono text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">{username || 'Anonym Node'}</span>
                          <span className="font-mono text-[8px] text-zinc-600 block truncate max-w-[130px] font-light italic mt-0.5">
                            {avatar?.startsWith('data:') ? 'Local Cipher Source' : 'Linked Network URL'}
                          </span>
                        </div>
                      </div>

                      {/* Sub-grid right: interactive uploads & preset selection */}
                      <div className="md:col-span-8 space-y-4" id="avatar-upload-selectors">
                        
                        {/* Interactive Drag & Drop / Click upload box */}
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative ${
                            isDragging 
                              ? 'border-[#FF3E00] bg-[#FF3E00]/5 scale-[0.99]' 
                              : 'border-zinc-850 hover:border-zinc-750 bg-zinc-950/20'
                          }`}
                          id="avatar-dragging-dropzone"
                        >
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            id="avatar-file-hidden-input"
                          />
                          
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <UploadCloud className="w-7 h-7 text-[#FF3E00]" />
                            <div className="space-y-1">
                              <p className="text-xs font-mono font-bold text-zinc-350 uppercase select-none">
                                Drag & Drop Photo Here
                              </p>
                              <p className="text-[10px] text-zinc-500 select-none">
                                or click to browse local secure disk arrays
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Preset options horizontal list switcher */}
                        <div className="space-y-2" id="avatar-preset-switcher-panel">
                          <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">
                            Or Select Crypto Identity Preset:
                          </label>
                          <div className="flex gap-2 flex-wrap" id="presets-avatars-row">
                            {PRESET_AVATARS.map((av) => (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => setAvatar(av.url)}
                                className={`w-10 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer relative ${
                                  avatar === av.url 
                                    ? 'border-[#FF3E00] scale-102 ring-1 ring-[#FF3E00]/50' 
                                    : 'border-zinc-850 hover:border-zinc-750'
                                }`}
                                title={av.label}
                              >
                                <img src={av.url} alt={av.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                {avatar === av.url && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-[#FF3E00] stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Direct hotlink text input */}
                        <div className="space-y-1.5" id="avatar-url-hotlink-fallback">
                          <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">
                            External Avatar Hotlink (Optional URL)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-850 rounded focus:border-[#FF3E00] font-mono text-[10px] text-zinc-400 focus:outline-none placeholder-zinc-800"
                              placeholder="https://images.unsplash.com/..."
                              value={avatar?.startsWith('data:') ? '' : avatar}
                              onChange={(e) => setAvatar(e.target.value)}
                            />
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-900/40">
                  <span className="text-[10px] font-mono text-zinc-500">SYSTEM STYLING COMPLIANT</span>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-black font-semibold font-mono text-[10px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer border border-white hover:border-[#FF3E00] flex items-center gap-1.5"
                  >
                    {saveSuccess ? <Check className="w-4 h-4 text-black font-bold group-hover:text-white" /> : <Save className="w-4 h-4" />}
                    <span>{saveSuccess ? 'CONFIG BROADCASTED' : 'SAVE CHANGES'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeSubTab === 'wallet' && (
              /* Tab 2: Wallet configs configuration */
              <div className="space-y-6" id="settings-wallet-form">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="font-display text-base font-bold italic text-white tracking-widest uppercase">Cryptographic Wallet Relays</h3>
                  <p className="text-zinc-500 text-xs font-sans mt-0.5">Manage your ledger keys, alternative networks, and simulated resources.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase block">Active Wallet Hash ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-grow p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-zinc-350 font-mono focus:outline-none focus:border-[#FF3E00]"
                        value={customWallet}
                        onChange={(e) => setCustomWallet(e.target.value)}
                      />
                      <button
                        onClick={handleWalletReset}
                        className="px-4 bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-850 text-xs font-mono text-zinc-300 transition-colors uppercase cursor-pointer"
                        title="Regenerate Wallet Keys"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#FF3E00]" />
                        <span className="ml-1">RESET</span>
                      </button>
                    </div>
                  </div>

                  {/* Network checklist switcher */}
                  <div className="space-y-2 pt-2">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">Active Peer Network</label>
                    <div className="grid grid-cols-2 gap-2" id="settings-network-radios">
                      {[
                        'GENX Security Mainnet',
                        'Ethereum Beacon Core',
                        'Arbitrum Rollup Nitro',
                        'GEO-GENX Local Testnet'
                      ].map((net) => (
                        <button
                          key={net}
                          onClick={() => setSelectedNetwork(net)}
                          className={`p-3 text-left border rounded text-[11px] font-mono transition-colors uppercase tracking-wider cursor-pointer ${
                            selectedNetwork === net
                              ? 'bg-[#0D0D0D] border-[#FF3E00] text-white font-semibold'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-850 text-xs font-mono text-zinc-500 divide-y divide-zinc-900/30">
                    <div className="pb-1.5 flex justify-between">
                      <span>Simulated USDC Reserve</span>
                      <span className="text-white font-bold">{userProfile.walletBalanceUSDC} USDC</span>
                    </div>
                    <div className="pt-1.5 flex justify-between">
                      <span>Native Token Gas Balance</span>
                      <span className="text-[#FF3E00] font-semibold">{userProfile.walletBalanceETH} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'appearance' && (
              /* Tab 3: Appearance aesthetics customizations toggles */
              <div className="space-y-6" id="settings-appearance-toggles">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="font-display text-base font-bold italic text-white tracking-widest uppercase">Aesthetics Preferences</h3>
                  <p className="text-zinc-500 text-xs font-sans mt-0.5">Adjust user interface parameters to match computing capabilities.</p>
                </div>

                <div className="space-y-4">
                  {/* Glassmorphism Toggle */}
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-850 rounded-xl" id="toggle-glassmorphism">
                    <div>
                      <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Glassmorphism Blur Filter</h4>
                      <p className="text-[10px] text-zinc-500 max-w-md font-sans mt-0.5">
                        Applies rich backdrop-filter blurs to sidebar panels and cards, matching high fidelity visual screenshots.
                      </p>
                    </div>
                    <button
                      onClick={() => onUpdatePreference('glassmorphism', !preferences.glassmorphism)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                        preferences.glassmorphism ? 'bg-[#FF3E00]' : 'bg-zinc-900'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                        preferences.glassmorphism ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Reduce Motion Toggle */}
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-850 rounded-xl" id="toggle-reduce-motion">
                    <div>
                      <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Reduce motion configurations</h4>
                      <p className="text-[10px] text-zinc-500 max-w-md font-sans mt-0.5">
                        Disables staggering grid entrances and sliding effects for smoother accessibility.
                      </p>
                    </div>
                    <button
                      onClick={() => onUpdatePreference('reduceMotion', !preferences.reduceMotion)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                        preferences.reduceMotion ? 'bg-[#FF3E00]' : 'bg-zinc-900'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                        preferences.reduceMotion ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* High Contrast Toggle */}
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-850 rounded-xl" id="toggle-high-contrast">
                    <div>
                      <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">High Contrast Borders</h4>
                      <p className="text-[10px] text-zinc-500 max-w-md font-sans mt-0.5">
                        Thickens structural borders for visually distinct layouts on basic terminal screens.
                      </p>
                    </div>
                    <button
                      onClick={() => onUpdatePreference('highContrast', !preferences.highContrast)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                        preferences.highContrast ? 'bg-[#FF3E00]' : 'bg-zinc-900'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                        preferences.highContrast ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
