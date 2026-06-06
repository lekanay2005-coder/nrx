import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, CheckCircle, Truck, ShieldAlert, Cpu, 
  Terminal, Coins, ShieldCheck, Activity, Zap, RefreshCw, UserCheck
} from 'lucide-react';
import { ChatThread, Message, UserProfile } from '../types';

interface CommsViewProps {
  userProfile: UserProfile;
  onMinePoints: () => void;
  onUpdatePoints: (newVal: number) => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
}

export const CommsView: React.FC<CommsViewProps> = ({
  userProfile,
  onMinePoints,
  onUpdatePoints,
  preferences
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMiningLocal, setIsMiningLocal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chats
  const fetchChats = () => {
    fetch('/api/chats')
      .then(res => res.ok ? res.json() : [])
      .then((data: ChatThread[]) => {
        setThreads(data);
        if (data.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data[0].id);
        }
      })
      .catch(err => console.error('Comms retrieval error:', err));
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000); // short-polling to simulate real-time
    return () => clearInterval(interval);
  }, [selectedThreadId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth' });
    }
  }, [threads, selectedThreadId, isReduced]);

  const activeThread = threads.find(t => t.id === selectedThreadId);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedThreadId) return;

    setIsSending(true);
    const textToSend = inputText;
    setInputText('');

    // Optimistic local update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThreadId) {
        return {
          ...t,
          messages: [...t.messages, tempMsg]
        };
      }
      return t;
    }));

    try {
      const res = await fetch(`/api/chats/${selectedThreadId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend, sender: 'user' })
      });
      if (res.ok) {
        const updatedThread = await res.json();
        setThreads(prev => prev.map(t => t.id === selectedThreadId ? updatedThread : t));
      }
    } catch (err) {
      console.error('Error posting secure payload text:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Update Status of transaction (Approve / Dispatch)
  const handleUpdateStatus = async (status: 'approved' | 'dispatched') => {
    if (!selectedThreadId) return;

    try {
      const res = await fetch(`/api/chats/${selectedThreadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedThread = await res.json();
        setThreads(prev => prev.map(t => t.id === selectedThreadId ? updatedThread : t));
        setSuccessToast(`Consensus success: node registered as "${status.toUpperCase()}"!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Telemetry status sync failed:', err);
    }
  };

  // Interact with native points miner
  const handleTriggerMining = async () => {
    setIsMiningLocal(true);
    try {
      const res = await fetch('/api/profile/mine', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        onUpdatePoints(result.points);
        setSuccessToast(`Uptime verified: Mined +30 GP Network Points!`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch (err) {
      console.error('Mining failure:', err);
    } finally {
      setIsMiningLocal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16" id="comms-panel-root">
      
      {/* Toast notifications */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-4 py-3 rounded-lg flex items-center gap-2 font-mono text-xs shadow-2xl animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Header Widget */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-5" id="comms-header-node">
        <div>
          <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase flex items-center gap-1.5 mb-2">
            <Terminal className="w-3.5 h-3.5" /> SECURE HANDSHAKE CHANNELS
          </span>
          <h1 className="font-sans font-medium tracking-tight text-xl text-zinc-100">
            Secure Comms Dispatch Center
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            Meet the strict protocol threshold: you can communicate, verify telemetry logs, and sign shipping contracts privately before finalizing dispatches.
          </p>
        </div>

        {/* Dynamic Point Miner Hub */}
        <div className="mt-4 sm:mt-0 p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-4 relative" id="point-miner-widget">
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider block">Current Network Energy</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Coins className="w-4 h-4 text-[#FF3E00]" />
              <span className="font-mono text-sm font-black text-zinc-100">{userProfile.points} <span className="text-[10px] text-[#FF3E00]">GP</span></span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTriggerMining}
            disabled={isMiningLocal}
            className="px-3.5 py-2 bg-[#FF3E00]/15 hover:bg-[#FF3E00]/25 text-[#FF3E00] border border-[#FF3E00]/25 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg flex items-center gap-1.5 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            title="Actively validate nearby node routers and mint GP rewards instantly"
          >
            {isMiningLocal ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            {isMiningLocal ? 'HASHING...' : 'MINE +30 GP'}
          </button>
        </div>
      </div>

      {/* Left Sidebar: Threads and Rules */}
      <div className="lg:col-span-4 space-y-4" id="comms-sidebar-rooms">
        
        {/* Network points cost guidelines panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold">Consensus Tariffs (GP)</span>
            <Activity className="w-3.5 h-3.5 text-[#FF3E00]" />
          </div>
          <div className="space-y-2 text-[10px] text-zinc-500">
            <div className="flex justify-between items-center bg-zinc-950 p-1.5 rounded">
              <span>Register new asset listing:</span>
              <span className="text-[#FF3E00] font-bold">-30 GP</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950 p-1.5 rounded">
              <span>Submit secure bid:</span>
              <span className="text-[#FF3E00] font-bold">-10 GP</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950 p-1.5 rounded">
              <span>Authorize order contract:</span>
              <span className="text-[#FF3E00] font-bold">-20 GP</span>
            </div>
            <div className="flex justify-between items-center bg-emerald-950/25 border border-emerald-900/40 p-1.5 rounded text-emerald-400">
              <span>Mine node validation verification:</span>
              <span className="font-black">+30 GP</span>
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 space-y-3" id="channels-list-card">
          <span className="font-mono text-[9px] text-zinc-500 uppercase font-black tracking-widest block">
            SECURE ROUTING CONNECTIONS ({threads.length})
          </span>

          {threads.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-900 rounded-xl">
              <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">No active connection loops.</p>
              <p className="text-[10px] text-zinc-700 mt-1">Buy, bid, or list a product to trigger communication arrays.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1" id="threads-scrollable">
              {threads.map((th) => {
                const isActive = th.id === selectedThreadId;
                const latestMsg = th.messages[th.messages.length - 1];
                return (
                  <button
                    key={th.id}
                    onClick={() => setSelectedThreadId(th.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer block ${
                      isActive 
                        ? 'border-[#FF3E00] bg-[#FF3E00]/5 ring-1 ring-[#FF3E00]/30' 
                        : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={th.counterpartyAvatar} 
                        alt={th.counterpartyName} 
                        className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-zinc-400 truncate max-w-[120px] font-bold uppercase tracking-wider">
                            {th.counterpartyName}
                          </span>
                          <span className={`px-1.5 py-0.5 font-mono text-[7px] font-bold rounded uppercase ${
                            th.role === 'seller' ? 'bg-[#FF3E00]/10 text-[#FF3E00]' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {th.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-300 font-sans font-medium mt-0.5 truncate">{th.productName}</p>
                        {latestMsg && (
                          <p className="text-[9px] text-zinc-500 font-mono truncate mt-1">
                            {latestMsg.sender === 'user' ? 'You: ' : ''}{latestMsg.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat Terminal Room */}
      <div className="lg:col-span-8" id="chat-terminal-zone">
        {activeThread ? (
          <div className="bg-zinc-950/90 border border-zinc-900 rounded-2xl flex flex-col h-[520px] overflow-hidden" id="chat-window-frame">
            
            {/* Room Header Info */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src={activeThread.counterpartyAvatar} 
                  alt={activeThread.counterpartyName}
                  className="w-9 h-9 rounded-full border border-zinc-800 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-350 uppercase">{activeThread.counterpartyName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                    Product Focus: <span className="text-zinc-400 font-bold">{activeThread.productName}</span>
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-850">
                <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">STATUS:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase ${
                  activeThread.status === 'dispatched'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : activeThread.status === 'approved'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {activeThread.status}
                </span>
              </div>
            </div>

            {/* Chat message streams list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-950/20" id="messages-box-stream">
              
              <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-xl space-y-1 text-center max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-1 text-[#FF3E00]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF3E00]" />
                  <span className="font-mono text-[8.5px] font-black uppercase tracking-widest text-[#FF3E00]">END-TO-END CIPHER APPLIED</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono">
                  Messages are encrypted through the DePIN validation ring. Handshake sequence complete.
                </p>
              </div>

              {activeThread.messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col max-w-[75%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="font-mono text-[7px] text-zinc-650 block mb-1 uppercase font-bold tracking-wider">
                      {isUser ? 'USER (HOST)' : 'RECIPIENT NODE'} • {m.timestamp}
                    </span>
                    <div className={`p-3 rounded-2xl text-[11px] font-sans leading-relaxed ${
                      isUser 
                        ? 'bg-zinc-850 text-zinc-200 rounded-tr-none' 
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Control Panel: If we are seller, we can "Verify & Dispatch" before we send it! */}
            {activeThread.role === 'seller' && (
              <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative" id="dispatch-authorized-trigger-bar">
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-850 rounded text-zinc-400">
                    <UserCheck className="w-4 h-4 text-[#FF3E00]" />
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-zinc-500 uppercase font-black tracking-widest block">Merchant Escrow Verification</span>
                    <p className="text-[10px] text-zinc-400 font-sans font-medium mt-0.5">Discuss cargo and parameters first, then authorize payload dispatch.</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={activeThread.status !== 'negotiating'}
                    onClick={() => handleUpdateStatus('approved')}
                    className={`px-3.5 py-2 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none transition-all ${
                      activeThread.status === 'negotiating'
                        ? 'bg-cyan-950/60 hover:bg-cyan-950/100 border border-cyan-500/30 text-cyan-400 active:scale-97'
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    APPROVE SIGNATURE
                  </button>

                  <button
                    type="button"
                    disabled={activeThread.status !== 'approved'}
                    onClick={() => handleUpdateStatus('dispatched')}
                    className={`px-3.5 py-2 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none transition-all ${
                      activeThread.status === 'approved'
                        ? 'bg-emerald-950/60 hover:bg-emerald-950/100 border border-emerald-500/30 text-emerald-400 active:scale-97'
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    DISPATCH CONTAINER
                  </button>
                </div>
              </div>
            )}

            {/* If we are buyer, show helper indicator */}
            {activeThread.role === 'buyer' && (
              <div className="px-4 py-2 bg-zinc-950/80 border-t border-zinc-900 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FF3E00]" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                  WAITING FOR SELLER TO DEPLOY CRYPTOGRAPHIC SIGNATURE & SHIPPED PAYLOAD
                </span>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2">
              <input
                type="text"
                placeholder="Secure uplink packet input..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-750 focus:border-[#FF3E00] focus:outline-none placeholder-zinc-700 text-zinc-300 rounded-xl px-4 py-2 text-xs font-mono"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="p-2.5 bg-[#FF3E00] hover:bg-[#E03500] text-black font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="bg-zinc-950/90 border border-zinc-900 rounded-xl flex flex-col h-[520px] items-center justify-center text-center p-8">
            <MessageSquare className="w-12 h-12 text-zinc-800 mb-3" />
            <h3 className="font-sans text-sm text-zinc-400 uppercase font-bold tracking-wider">No Handshake Selection</h3>
            <p className="text-xs text-zinc-600 font-mono mt-1 max-w-sm">
              Please select an active decentralized communication vector on the left side to engage secure telemetry chats.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
