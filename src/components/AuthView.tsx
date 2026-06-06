import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, KeyRound, Sparkles, Database, ShieldAlert, Cpu } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (simulatedWallet: string, email?: string, username?: string, customProfile?: any) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
  initialTab?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onNavigate,
  preferences,
  initialTab = 'signin',
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Tabs: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Computing real-time password strength indicators
  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { score: 0, label: 'EMPTY', color: 'bg-zinc-800' };
    if (password.length < 6) return { score: 1, label: 'WEAK CORE', color: 'bg-rose-500' };
    
    // Check symbols & digits
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/g.test(password);
    const hasDigit = /[0-9]/g.test(password);

    if (hasSymbol && hasDigit && password.length >= 8) {
      return { score: 3, label: 'HIGH-SECURITY LINK', color: 'bg-[#FF3E00]' };
    }
    return { score: 2, label: 'GOOD SHIELD', color: 'bg-amber-500' };
  }, [password]);

  // Handle standard credentials Submission
  const handleSubmitCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (email === '' || password === '') {
      setAuthError('All configuration parameters are required.');
      return;
    }

    if (activeTab === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Secret key credentials do not match parameters.');
        return;
      }
      if (!agreeTerms) {
        setAuthError('You must agree to the decentralized protocol conditions.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = activeTab === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const bodyPayload = activeTab === 'signup'
        ? { email, password, username: email.split('@')[0] }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.profile.connectedWallet, data.profile.email, data.profile.username, data.profile);
        onNavigate('dashboard');
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'Authentication sequence failed.');
      }
    } catch (err) {
      console.error('Auth request error:', err);
      setAuthError('Network consensus timeout. Ensure node is responding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/20" id="auth-view-container">
      
      {/* Left Pane: Heavy immersive branding with telemetry heartbeat */}
      <div className="md:col-span-12 lg:col-span-5 bg-gradient-to-b from-zinc-950 to-zinc-900/40 p-6 sm:p-10 flex flex-col justify-between border-r border-[#FF3E00]/10 min-h-[400px]" id="auth-left-telemetry">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FF3E00]/10 flex items-center justify-center border border-[#FF3E00]/20">
              <Cpu className="w-4 h-4 text-[#FF3E00] animate-pulse" />
            </div>
            <span className="font-display font-black italic text-white text-sm tracking-widest uppercase">NEO-GENX COCKPIT</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">Decentralized Gateway</h2>
            <p className="text-zinc-400 text-xs font-light leading-relaxed">
              Verify cryptographic keys to unlock shipping orders, telemetry maps, and connected node configurations.
            </p>
          </div>
        </div>

        {/* Real-time terminal ticker simulations */}
        <div className="space-y-4 pt-10">
          <div className="flex items-center gap-2" id="telemetry-heartbeat">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[9px] text-zinc-400 tracking-wider">PROTOCOL HEIGHT STATE: ACTIVE</span>
          </div>

          <div className="p-3.5 rounded border border-zinc-850 bg-zinc-950/90 font-mono text-[9.5px] text-zinc-500 space-y-1">
            <p className="text-zinc-350">$ npx neo-genx-link auth --secure</p>
            <p>• Initializing client-side handshake...</p>
            <p className="text-[#FF3E00] font-semibold">✔ Peer consensus secured [100%]</p>
            <p>• Ready for cryptographic signature</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Sign up / Sign-in form configurations */}
      <div className="md:col-span-12 lg:col-span-7 p-6 sm:p-10 space-y-8" id="auth-right-form">
        <div className="flex border-b border-zinc-850">
          <button
            onClick={() => {
              setActiveTab('signin');
              setAuthError(null);
            }}
            className={`pb-3 px-4 font-mono text-xs uppercase tracking-widest font-bold transition-all relative cursor-pointer ${
              activeTab === 'signin' ? 'text-white' : 'text-zinc-500 hover:text-zinc-350'
            }`}
            id="auth-tab-signin"
            type="button"
          >
            <span>SIGN IN GATE</span>
            {activeTab === 'signin' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3E00]" />}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('signup');
              setAuthError(null);
            }}
            className={`pb-3 px-4 font-mono text-xs uppercase tracking-widest font-bold transition-all relative cursor-pointer ${
              activeTab === 'signup' ? 'text-white' : 'text-zinc-500 hover:text-zinc-350'
            }`}
            id="auth-tab-signup"
            type="button"
          >
            <span>REGISTER ENDPOINT</span>
            {activeTab === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3E00]" />}
          </button>
        </div>

        {authError && (
          <div className="p-3.5 bg-rose-955/20 border border-rose-900/40 rounded-xl text-rose-400 text-xs flex gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitCredential} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase block">Ecosystem Mail Address</label>
            <input
              type="email"
              placeholder="e.g. traveler@neo-genx.network"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded focus:border-[#FF3E00] text-xs text-white placeholder-zinc-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="font-mono text-[9px] text-zinc-500 uppercase block">Passcode Credentials</label>
              {passwordStrength.score > 0 && (
                <span className="font-mono text-[9.5px] text-[#FF3E00]">{passwordStrength.label}</span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-855 rounded focus:border-[#FF3E00] text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-650 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength visual meter bar */}
            {password.length > 0 && (
              <div className="h-1 w-full bg-zinc-900 rounded-full mt-1.5 overflow-hidden flex gap-0.5">
                <div className={`h-full flex-grow rounded-l-full ${passwordStrength.color}`} />
                <div className={`h-full flex-grow ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-zinc-900'}`} />
                <div className={`h-full flex-grow rounded-r-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-zinc-900'}`} />
              </div>
            )}
          </div>

          {activeTab === 'signup' && (
            <>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-zinc-500 uppercase block">Confirm Passcode</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-855 rounded focus:border-[#FF3E00] text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                    className="rounded border-zinc-805 bg-zinc-900 text-[#FF3E00] focus:ring-[#FF3E00]/20 cursor-pointer"
                  />
                  <span>I agree to the peer-to-peer telemetry terms and data caching conditions</span>
                </label>
              </div>
            </>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-[#FF3E00] hover:text-white border border-white hover:border-[#FF3E00] text-black font-semibold font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading 
                  ? 'SYNCHRONIZING CHAIN...' 
                  : activeTab === 'signin' 
                  ? 'AUTHORIZE GATE ACCESS' 
                  : 'BROADCAST ACCESS REGISTER'}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
