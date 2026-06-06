import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Activity, Calendar, ShieldCheck, Truck, Clipboard, ExternalLink, Zap, CheckCircle2, Download, Trash2, LogOut } from 'lucide-react';
import { UserProfile, Order, Product } from '../types';

interface DashboardViewProps {
  userProfile: UserProfile;
  orders: Order[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
  onRemoveOrder?: (orderId: string) => void;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  orders,
  onSelectProduct,
  onNavigate,
  preferences,
  onRemoveOrder,
  onLogout,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Selected order details drawer state
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Processing' | 'Shipped' | 'Completed'>('All');

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(userProfile.connectedWallet);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Get active order (not completed) for the tracker bar
  const activeOrder = orders.find((o) => o.status !== 'Completed') || orders[0];

  // Helper for tracking steps mapping
  const getStepIndex = (status: 'Pending' | 'Processing' | 'Shipped' | 'Completed') => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Completed': return 3;
    }
  };

  const statusProgressLabels = ['RESERVED', 'PROCESSING', 'SHIPPED', 'COMPLETED'];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'All') return true;
    return order.status === statusFilter;
  });

  const handleDownloadCSV = () => {
    const headers = ['Invoice ID', 'Date', 'Items', 'Total Price (USDC)', 'Status', 'Tracking Code'];
    const rows = filteredOrders.map((order) => {
      const itemsString = order.items
        .map((it) => `${it.product.name} (x${it.quantity})`)
        .join('; ');
      return [
        `"${order.id}"`,
        `"${order.date}"`,
        `"${itemsString.replace(/"/g, '""')}"`,
        `"${order.total}"`,
        `"${order.status}"`,
        `"${order.trackingCode || ''}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `order_history_${statusFilter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-16" id="dashboard-view-container">
      {/* Header Personal Cockpit Banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950 p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="cockpit-welcome-banner">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF3E00]/5 rounded-full blur-3xl" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#FF3E00]/20 bg-[#FF3E00]/5 text-[9px] font-mono text-[#FF3E00]">
            <ShieldCheck className="w-3 h-3" /> SECURE LOGIN AUTHORIZED
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black italic text-white">
            Welcome back, <span className="text-[#FF3E00]">{userProfile.username}</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono tracking-wide">
            GATEWAY ACCESS GRANTED • SYSTEM METRICS NOMINAL • ID 94-042-X
          </p>
        </div>

        <div className="flex gap-4 z-10">
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 bg-white hover:bg-[#FF3E00] hover:text-white border border-white hover:border-[#FF3E00] text-black font-semibold font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
          >
            BUY HARDWARE
          </button>
          
          <button
            onClick={() => onNavigate('settings')}
            className="px-5 py-3 bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono uppercase tracking-widest text-[10px] transition-colors"
          >
            SYS PREFS
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-5 py-3 bg-red-950/10 hover:bg-red-500/10 hover:text-red-300 text-red-400 border border-red-950/40 hover:border-red-500 font-mono uppercase tracking-widest text-[10px] transition-colors flex items-center gap-1.5 cursor-pointer"
              id="dashboard-logout-btn"
              title="Terminate Secure Handshake / Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bento-metrics-grid">
        {/* Metric 1: Connected Wallet Snapshot */}
        <div className={`p-6 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-4 ${isGlass ? 'backdrop-blur-md' : ''}`} id="bento-metric-wallet">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Connected Wallet snapshot</span>
            <Wallet className="w-4 h-4 text-[#FF3E00]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white tracking-widest bg-zinc-900 px-2.5 py-1 rounded border border-zinc-850">
                {userProfile.connectedWallet}
              </span>
              <button
                onClick={handleCopyWalletAddress}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Copy address Hash"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {copiedText && <span className="font-mono text-[8px] text-[#FF3E00] block">Address Hash Copied!</span>}

            <div className="pt-2 grid grid-cols-2 gap-2 text-xs divide-x divide-zinc-900">
              <div>
                <span className="font-mono text-[8px] text-zinc-500 uppercase">USDC Resources</span>
                <span className="font-mono text-sm font-bold text-white block mt-0.5">
                  {userProfile.walletBalanceUSDC.toLocaleString()}
                </span>
              </div>
              <div className="pl-4">
                <span className="font-mono text-[8px] text-zinc-500 uppercase">Ether Gas</span>
                <span className="font-mono text-sm font-bold text-[#FF3E00] block mt-0.5">
                  {userProfile.walletBalanceETH.toLocaleString()} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Lifetime Purchases Total */}
        <div className={`p-6 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-4 ${isGlass ? 'backdrop-blur-md' : ''}`} id="bento-metric-spending">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">LIFETIME COMMERCE SPENT</span>
            <Activity className="w-4 h-4 text-[#FF3E00]" />
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-mono text-3xl font-extrabold text-white">
              {userProfile.lifetimeSpent.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">USDC</span>
            </span>
            <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
              Total locked in hardware smart-contracts
            </p>
          </div>
        </div>

        {/* Metric 3: Active Orders Tracking Pipeline bar */}
        <div className={`p-6 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-4 ${isGlass ? 'backdrop-blur-md' : ''}`} id="bento-metric-tracking">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Orbital Courier Status</span>
            <Truck className="w-4 h-4 text-[#FF3E00]" />
          </div>

          {activeOrder ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-300 font-bold">{activeOrder.id} ({activeOrder.status})</span>
                <span className="text-zinc-500">{activeOrder.trackingCode}</span>
              </div>

              {/* Progress Tracker bar line */}
              <div className="relative pt-2">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-900 -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-[#FF3E00] -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{ width: `${(getStepIndex(activeOrder.status) / 3) * 100}%` }}
                />

                <div className="relative flex justify-between">
                  {statusProgressLabels.map((lbl, idx) => {
                    const stepIdx = getStepIndex(activeOrder.status);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 relative z-10 ${
                            idx <= stepIdx
                              ? 'bg-[#FF3E00] border-[#FF3E00]'
                              : 'bg-zinc-950 border-zinc-800'
                          }`}
                        />
                        <span className="text-[7px] font-mono text-zinc-500 mt-2 block tracking-widest uppercase">
                          {lbl}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs font-mono text-zinc-650">
              No active logistical deliveries found
            </div>
          )}
        </div>
      </div>

      {/* Detailed Order History log tracker */}
      <section className="space-y-5" id="order-history-section">
        <div className="border-b border-zinc-850 pb-3 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4" id="decentralized-purchase-history-header">
          <div>
            <span className="font-mono text-[10px] text-[#FF3E00] tracking-[0.2em] uppercase mb-1 block">Ecosystem Logs</span>
            <h2 className="font-display text-xl sm:text-2xl font-black italic text-white leading-tight">Decentralized Purchase History</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto justify-end" id="filters-and-actions">
            {/* Status Filter buttons bar */}
            <div className="flex flex-wrap gap-1.5" id="status-filters">
              {(['All', 'Pending', 'Processing', 'Shipped', 'Completed'] as const).map((filter) => {
                const count = filter === 'All' 
                  ? orders.length 
                  : orders.filter(o => o.status === filter).length;
                
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer border rounded-md font-bold ${
                      isActive
                        ? 'bg-[#FF3E00] text-white border-[#FF3E00] shadow-sm shadow-[#FF3E00]/10'
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>

            {/* Download CSV button */}
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer border border-[#FF3E00]/25 hover:border-[#FF3E00] hover:bg-[#FF3E00]/10 text-[#FF3E00] rounded-md font-bold flex items-center justify-center gap-1.5 self-start sm:self-auto"
              id="download-csv-action"
              title="Download filtered CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="border border-zinc-850 rounded-xl bg-zinc-950/20 overflow-x-auto" id="history-logs-table-wrapper">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-850 font-mono text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-950/40">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">Transaction Date</th>
                <th className="p-4">Reserved Modules</th>
                <th className="p-4 text-right">Sum Encrypted</th>
                <th className="p-4 text-center">Protocol Status</th>
                <th className="p-4 text-center pr-6">Verify Logistics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="p-4 pl-6 font-mono text-white font-semibold">
                      {order.id}
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        {order.date}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300">
                      <span className="max-w-[200px] block truncate font-sans text-zinc-300">
                        {order.items.map((it) => `${it.product.name} (x${it.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-right text-white font-bold">
                      {order.total.toLocaleString()} USDC
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono leading-none ${
                          order.status === 'Completed'
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                            : order.status === 'Shipped'
                            ? 'bg-blue-500/5 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/5 text-amber-500/40 border-amber-500/20'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                            order.status === 'Completed' ? 'bg-emerald-400' : order.status === 'Shipped' ? 'bg-blue-400' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-1.5" id={`order-actions-${order.id}`}>
                        <button
                          onClick={() => setSelectedHistoryOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-zinc-800 hover:border-[#FF3E00] bg-zinc-950 font-mono text-[10px] text-zinc-400 hover:text-white rounded cursor-pointer group-hover:bg-zinc-900/40"
                          id={`check-order-${order.id}`}
                        >
                          <span>Check</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="inline-flex items-center justify-center p-1.5 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded cursor-pointer transition-colors"
                          title="Purge Order Log"
                          id={`delete-order-${order.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-mono text-zinc-500 text-xs">
                    No order logs found with state:{' '}
                    <span className="text-[#FF3E00] font-bold uppercase">{statusFilter}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logistics Status Side-Drawer Detail */}
      <AnimatePresence>
        {selectedHistoryOrder && (
          <div className="fixed inset-0 z-50 flex justify-end" id="logistics-drawer-overlay">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setSelectedHistoryOrder(null)}
            />

            {/* Slide block Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-w-md h-full bg-[#0A0A0A] border-l border-zinc-850 p-6 flex flex-col justify-between overflow-y-auto relative ${isGlass ? 'backdrop-blur-xl' : ''}`}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
                  <div>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Verification System</span>
                    <h3 className="font-display text-base font-bold italic text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#FF3E00]" /> Logistical Ledger #{selectedHistoryOrder.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedHistoryOrder(null)}
                    className="p-1 text-zinc-500 hover:text-white font-mono text-xs hover:bg-zinc-900 rounded"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Items loop details */}
                <div className="space-y-3">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Core Consigned Modules</span>
                  <div className="space-y-3">
                    {selectedHistoryOrder.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectProduct(item.product);
                          onNavigate('details');
                          setSelectedHistoryOrder(null);
                        }}
                        className="p-3 bg-zinc-900/40 border border-zinc-850 hover:border-[#FF3E00] rounded-lg flex items-center gap-4 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden bg-zinc-950 border border-zinc-900 flex-shrink-0">
                          <img src={item.product.images[0]} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-xs text-white font-bold group-hover:text-[#FF3E00] transition-colors truncate">
                            {item.product.name}
                          </h4>
                          <span className="font-mono text-[10px] text-zinc-500 block">
                            Sector: {item.product.category} (x{item.quantity})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistical Tracking status */}
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-4">
                  <span className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-widest block">Cargo Courier Metrics</span>

                  <div className="space-y-3.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Logistics Agent</span>
                      <span className="text-zinc-200">{selectedHistoryOrder.deliveryService}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">Telemetry Tracking Code</span>
                      <span className="text-[#FF3E00] hover:underline cursor-pointer flex items-center gap-1.5">
                        {selectedHistoryOrder.trackingCode} <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">Terminal Destination</span>
                      <span className="text-zinc-350 text-right">
                        {selectedHistoryOrder.recipientName} • {selectedHistoryOrder.address.line1}, {selectedHistoryOrder.address.city}, {selectedHistoryOrder.address.zip}
                      </span>
                    </div>

                    {selectedHistoryOrder.orderNotes && (
                      <div className="flex flex-col gap-1.5 border-t border-zinc-805 pt-3.5 text-left" id="drawer-order-notes-display">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-wider block font-bold">Logistical Drop-Off Instructions</span>
                        <span className="text-zinc-300 italic whitespace-pre-wrap leading-relaxed text-[10.5px] bg-zinc-950/90 p-2.5 border border-zinc-850/80 rounded">
                          {selectedHistoryOrder.orderNotes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900/60" id="drawer-footer-actions">
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setSelectedHistoryOrder(null)}
                    className="flex-1 py-2.5 bg-[#0D0D0D] hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs font-bold rounded-lg border border-zinc-850 hover:border-zinc-700 transition-all cursor-pointer"
                    id="drawer-dismiss-btn"
                  >
                    DISMISS
                  </button>
                  <button
                    onClick={() => {
                      setOrderToDelete(selectedHistoryOrder);
                      setSelectedHistoryOrder(null);
                    }}
                    className="px-4 py-2.5 bg-red-950/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-900/40 hover:border-red-500 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Delete historical order"
                    id="drawer-purge-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>PURGE</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal overlay block */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="delete-confirmation-modal-overlay">
            {/* Backdrop click to dismiss */}
            <div className="absolute inset-0" onClick={() => setOrderToDelete(null)} />

            {/* Modal Body card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-zinc-850 rounded-xl p-6 shadow-2xl space-y-5 z-10"
              id="delete-confirmation-modal"
            >
              <div className="space-y-2">
                <span className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-[0.2em] block font-bold">WARNING: CRITICAL STATE REMOVAL</span>
                <h3 className="font-display text-lg font-black italic text-white uppercase tracking-tight">Confirm Log Purge</h3>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  Are you absolutely certain you want to purge ledger index <span className="text-white font-mono font-bold">#{orderToDelete.id}</span>? This action is irreversible and permanently wipes the cryptographic order logs from your local system index.
                </p>
              </div>

              {/* Order quick overview */}
              <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-lg text-xs space-y-1.5" id="delete-modal-order-summary">
                <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase font-bold">
                  <span>DATE: {orderToDelete.date}</span>
                  <span>TOTAL: {orderToDelete.total.toLocaleString()} USDC</span>
                </div>
                <p className="font-sans text-zinc-300 truncate">
                  {orderToDelete.items.map((it) => `${it.product.name} (x${it.quantity})`).join(', ')}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 bg-[#0D0D0D] hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer rounded-md"
                  id="cancel-purge-btn"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    if (onRemoveOrder) {
                      onRemoveOrder(orderToDelete.id);
                    }
                    setOrderToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white border border-red-500 hover:border-red-400 font-mono text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer rounded-md flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/10"
                  id="confirm-purge-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CONFIRM PURGE</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
