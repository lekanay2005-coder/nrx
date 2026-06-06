import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, MapPin, Wallet, CreditCard, ShieldAlert, Sparkles, CheckCircle2, Trash, Plus, Minus, Landmark } from 'lucide-react';
import { CartItem, UserProfile, Order } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  userProfile: UserProfile;
  onUpdateCartQuantity: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onPlaceOrder: (newOrder: Order) => void;
  onNavigate: (tab: 'home' | 'marketplace' | 'details' | 'checkout' | 'dashboard' | 'settings' | 'genesis-store' | 'auth') => void;
  onDeductBalance: (amount: number, source?: 'wallet' | 'stripe' | 'bank') => void;
  preferences: { glassmorphism: boolean; reduceMotion: boolean };
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  userProfile,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onPlaceOrder,
  onNavigate,
  onDeductBalance,
  preferences,
}) => {
  const isGlass = preferences.glassmorphism;
  const isReduced = preferences.reduceMotion;

  // Active Pipeline Step: 0 = Cart View, 1 = Shipping Forms, 2 = Payment Selection, 3 = Completed Splash
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  // Form states
  const [recipient, setRecipient] = useState(userProfile.username);
  const [line1, setLine1] = useState('9880 Quantum Boulevard, Suite 40');
  const [city, setCity] = useState('Aetheris Springs');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94030');
  const [country, setCountry] = useState('USA');
  const [billingMatches, setBillingMatches] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment configuration state
  const [paymentOption, setPaymentOption] = useState<'wallet' | 'stripe' | 'bank'>('wallet');

  // Completed Order simulation tracking
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Computing Subtotals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryCharge = 15.00;
  const totalCharge = cartSubtotal + deliveryCharge;

  const handleNextStep = () => {
    if (pipelineStep < 2) {
      setPipelineStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (pipelineStep > 0) {
      setPipelineStep((prev) => prev - 1);
    }
  };

  const handleConfirmOrder = () => {
    if (paymentOption === 'wallet' && userProfile.walletBalanceUSDC < totalCharge) {
      alert(`Insufficient balance in connected cryptographic wallet. Total needed: ${totalCharge} USDC. Your balance: ${userProfile.walletBalanceUSDC} USDC.`);
      return;
    }

    if (paymentOption === 'bank') {
      if (!userProfile.linkedBank) {
        alert("Please link your bank account in Settings or Dashboard before checking out using bank debit.");
        return;
      }
      if (userProfile.linkedBank.balance < totalCharge) {
        alert(`Insufficient balance in your linked bank account. Total needed: $${totalCharge.toLocaleString()}. Current bank balance: $${userProfile.linkedBank.balance.toLocaleString()}.`);
        return;
      }
    }

    // Process simulation
    onDeductBalance(totalCharge, paymentOption);

    const generatedOrderId = `OR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newSimulatedOrder: Order = {
      id: generatedOrderId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending',
      items: [...cart],
      total: totalCharge,
      recipientName: recipient,
      trackingCode: `GX-${Math.floor(100000 + Math.random() * 900000)}-US`,
      deliveryService: 'NEO-GENX Secure Orbital Carrier',
      address: {
        line1,
        city,
        state,
        zip,
        country
      },
      orderNotes: orderNotes.trim() ? orderNotes.trim() : undefined
    };

    onPlaceOrder(newSimulatedOrder);
    setPlacedOrder(newSimulatedOrder);
    setPipelineStep(3); // Go to Success screen
  };

  // Step indicator tags helper
  const steps = ['Verify Cart', 'Terminal Shipping', 'Consensus Pay'];

  if (cart.length === 0 && pipelineStep !== 3) {
    return (
      <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl space-y-4 max-w-2xl mx-auto" id="checkout-empty-state">
        <ShoppingBag className="w-12 h-12 mx-auto text-zinc-600" />
        <div className="space-y-1">
          <p className="text-zinc-300 font-medium">Your marketplace cart is empty</p>
          <p className="text-zinc-500 text-xs text-center max-w-sm mx-auto">Explore product configurations in the marketplace to reserve compute cores.</p>
        </div>
        <button
          onClick={() => onNavigate('marketplace')}
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded hover:bg-zinc-800"
        >
          EXPLORE CATALOG
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" id="checkout-wrapper">
      {/* Dynamic Multi-Step Pipeline indicator Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-855 pb-5 gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest">TRANSACTION GATEWAY</span>
          <h1 className="font-display text-2xl font-black italic text-white leading-tight mt-1">Purchase Pipeline</h1>
        </div>

        {pipelineStep !== 3 ? (
          <div className="flex items-center gap-3">
            {steps.map((label, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      pipelineStep >= idx
                        ? 'bg-[#FF3E00] text-white'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-xs font-mono uppercase tracking-wider ${
                      pipelineStep === idx
                        ? 'text-[#FF3E00] font-bold'
                        : pipelineStep > idx
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-zinc-800" />}
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>

      {pipelineStep === 3 ? (
        /* Order Completed Splash Panel */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto border border-zinc-850 bg-zinc-950 p-8 rounded-xl text-center space-y-6"
          id="checkout-success-splash"
        >
          <div className="w-12 h-12 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/20 mx-auto flex items-center justify-center text-[#FF3E00]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase block">Consensus Verified</span>
            <h2 className="font-display text-2xl font-black italic text-white leading-tight">Transaction Successfully Broadcast!</h2>
            <p className="text-zinc-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
              Your shipping invoice was generated under hash <span className="font-mono text-[#FF3E00]">{placedOrder?.id}</span>. Hardware clusters are reserved for orbital logistics.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-850 text-left font-mono text-[11px] space-y-2.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Invoice Hash ID</span>
              <span className="text-white font-bold">{placedOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Secured Consignee</span>
              <span className="text-white">{placedOrder?.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Telemetry Tracking Code</span>
              <span className="text-[#FF3E00] hover:underline cursor-pointer">{placedOrder?.trackingCode}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800/40 pt-2 text-xs">
              <span className="text-zinc-400 font-medium">Total USDC Locked</span>
              <span className="text-[#FF3E00] font-bold">{placedOrder?.total.toLocaleString()} USDC</span>
            </div>
            {placedOrder?.orderNotes && (
              <div className="border-t border-zinc-800/40 pt-2 text-[10px] space-y-1" id="success-order-notes-display">
                <span className="text-zinc-500 block uppercase font-bold tracking-wider">Delivery Instructions / Notes</span>
                <span className="text-zinc-350 block italic whitespace-pre-line leading-relaxed">{placedOrder.orderNotes}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 bg-white text-black font-semibold font-mono text-[11px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer border border-white hover:border-[#FF3E00]"
            >
              ACCESS COCKPIT
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex-1 py-3 bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono uppercase tracking-widest text-[11px] transition-colors cursor-pointer"
            >
              MARKETPLACE
            </button>
          </div>
        </motion.div>
      ) : (
        /* Standard checkout views */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Input actions pipeline */}
          <div className="lg:col-span-7 space-y-8" id="checkout-pipeline-left">
            <AnimatePresence mode="wait">
              {pipelineStep === 0 && (
                /* Step 0: Shopping Cart View */
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                  id="step-cart-edit"
                >
                  <h3 className="font-display text-sm font-semibold text-white tracking-widest uppercase mb-1">Verified Cart Listings</h3>
                  <div className="divide-y divide-zinc-900 border border-zinc-850 rounded-xl bg-zinc-950/20 p-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 items-center group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-display text-xs font-bold text-white group-hover:text-[#FF3E00] transition-colors truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveFromCart(item.id)}
                              className="text-zinc-600 hover:text-rose-400 p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <span className="font-mono text-[9px] text-zinc-500 block">
                            Sector: {item.product.category}
                          </span>
                          {item.selectedOption && (
                            <span className="font-mono text-[9px] text-[#FF3E00] bg-zinc-900/60 px-1.5 py-0.5 rounded inline-block mt-1">
                              Config: {item.selectedOption}
                            </span>
                          )}

                          {/* Quantities adjuster */}
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center border border-zinc-850 rounded bg-zinc-950">
                              <button
                                onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)}
                                className="p-1 px-1.5 text-zinc-400 hover:text-[#FF3E00]"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono text-xs text-white px-2.5">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                                className="p-1 px-1.5 text-zinc-400 hover:text-[#FF3E00]"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="font-mono text-xs font-bold text-[#FF3E00]">
                                {(item.product.price * item.quantity).toLocaleString()} USDC
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-white text-black font-semibold font-mono text-[10px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer border border-white hover:border-[#FF3E00] flex items-center gap-1"
                    >
                      <span>Proceed with Shipping Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {pipelineStep === 1 && (
                /* Step 1: Shipping Addresses Form Details */
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                  id="step-shipping-form"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF3E00]" />
                    <h3 className="font-display text-sm font-semibold text-white tracking-widest uppercase">Secure Terminal Address</h3>
                  </div>

                  <form className="grid grid-cols-6 gap-4 p-5 bg-zinc-950/20 border border-zinc-850 rounded-xl">
                    <div className="col-span-6 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">Secured Recipient Name</label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-6 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">Address Line 1</label>
                      <input
                        type="text"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-3 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-1 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">ZIP Code</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-6 space-y-1.5">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white focus:outline-none focus:border-[#FF3E00]"
                      />
                    </div>

                    <div className="col-span-6 space-y-1.5" id="order-notes-container">
                      <label className="font-mono text-[9px] text-zinc-500 uppercase block">Order Notes / Delivery Instructions (Optional)</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g. Leave with gate proxy, ring sub-panel unit 4B on arrival..."
                        rows={3}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF3E00] resize-none"
                        id="order-notes-input"
                      />
                    </div>

                    <div className="col-span-6 pt-2">
                      <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={billingMatches}
                          onChange={() => setBillingMatches(!billingMatches)}
                          className="rounded border-zinc-800 bg-zinc-900 text-[#FF3E00] focus:ring-[#FF3E00]/20 cursor-pointer"
                        />
                        <span>Billing address is identical to shipping address parameters</span>
                      </label>
                    </div>
                  </form>

                  <div className="flex justify-between items-center bg-zinc-950/40 p-3.5 border border-zinc-850 rounded-lg">
                    <button
                      onClick={handlePrevStep}
                      className="px-5 py-3 bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
                    >
                      Return to Cart List
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-white text-black font-semibold font-mono text-[10px] uppercase tracking-widest hover:bg-[#FF3E00] hover:text-white transition-all cursor-pointer border border-white hover:border-[#FF3E00] flex items-center gap-1"
                    >
                      <span>Forward to Payments Lock</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {pipelineStep === 2 && (
                /* Step 2: Payment Selector options */
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                  id="step-payment"
                >
                  <h3 className="font-display text-sm font-semibold text-white tracking-widest uppercase">Select Secure Ledger Lane</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="payment-lane-radios">
                    {/* Option 1: Cryptographic wallet */}
                    <button
                      onClick={() => setPaymentOption('wallet')}
                      type="button"
                      className={`p-5 text-left border rounded-xl flex flex-col justify-between space-y-4 transition-all ${
                        paymentOption === 'wallet'
                          ? 'bg-zinc-950 border-[#FF3E00]'
                          : 'bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="p-2 border border-[#FF3E00]/20 rounded bg-zinc-950">
                          <Wallet className="w-5 h-5 text-[#FF3E00]" />
                        </div>
                        <input
                          type="radio"
                          checked={paymentOption === 'wallet'}
                          onChange={() => setPaymentOption('wallet')}
                          className="accent-[#FF3E00] cursor-pointer"
                        />
                      </div>
                      <div>
                        <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Web3 Secure Wallet</h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">
                          Consensus payment via connected wallet: <span className="text-zinc-350">{userProfile.connectedWallet}</span>
                        </p>
                        <span className="font-mono text-xs text-[#FF3E00] font-semibold block mt-1">
                          Balance: {userProfile.walletBalanceUSDC.toLocaleString()} USDC
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Credit Card with mock Stripe integration */}
                    <button
                      onClick={() => setPaymentOption('stripe')}
                      type="button"
                      className={`p-5 text-left border rounded-xl flex flex-col justify-between space-y-4 transition-all ${
                        paymentOption === 'stripe'
                          ? 'bg-zinc-950 border-[#FF3E00]'
                          : 'bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-950">
                          <CreditCard className="w-5 h-5 text-zinc-400" />
                        </div>
                        <input
                          type="radio"
                          checked={paymentOption === 'stripe'}
                          onChange={() => setPaymentOption('stripe')}
                          className="accent-[#FF3E00] cursor-pointer"
                        />
                      </div>
                      <div>
                        <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Unified Credit Card</h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">
                          Secure payment checkout via Stripe tokenization relays.
                        </p>
                        <span className="font-mono text-xs text-zinc-500 font-semibold block mt-1">
                          No direct wallet interaction needed
                        </span>
                      </div>
                    </button>

                    {/* Option 3: Direct Bank Debit */}
                    <button
                      onClick={() => setPaymentOption('bank')}
                      type="button"
                      className={`p-5 text-left border rounded-xl flex flex-col justify-between space-y-4 transition-all ${
                        paymentOption === 'bank'
                          ? 'bg-zinc-950 border-[#FF3E00]'
                          : 'bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="p-2 border border-[#FF3E00]/20 rounded bg-zinc-950">
                          <Landmark className="w-5 h-5 text-[#FF3E00]" />
                        </div>
                        <input
                          type="radio"
                          checked={paymentOption === 'bank'}
                          onChange={() => setPaymentOption('bank')}
                          className="accent-[#FF3E00] cursor-pointer"
                        />
                      </div>
                      <div>
                        <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Direct Bank Debit</h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">
                          {userProfile.linkedBank ? (
                            <span>Debit linked account: <span className="text-zinc-300 font-bold block mt-0.5">{userProfile.linkedBank.bankName} ({userProfile.linkedBank.accountNumber})</span></span>
                          ) : (
                            <span className="text-amber-500 italic">No bank source linked correctly. Link via Dashboard.</span>
                          )}
                        </p>
                        {userProfile.linkedBank ? (
                          <span className="font-mono text-xs text-[#FF3E00] font-semibold block mt-1">
                            Balance: ${userProfile.linkedBank.balance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-zinc-600 block mt-1">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </button>
                  </div>

                  {paymentOption === 'wallet' && userProfile.walletBalanceUSDC < totalCharge && (
                    <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-400 text-xs flex gap-2.5 align-middle">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <span className="font-bold font-mono">CRITICAL DEFICIT:</span> Current wallet has insufficient USDC resources. Please clear your cart or top up.
                      </div>
                    </div>
                  )}

                  {paymentOption === 'bank' && !userProfile.linkedBank && (
                    <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-400 text-xs flex gap-2.5 items-start">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono">NO BANK ACCOUNT LINKED:</span> Please link or verify your bank account details under the Dashboard Cockpit first to complete direct bank debit purchases.
                      </div>
                    </div>
                  )}

                  {paymentOption === 'bank' && userProfile.linkedBank && userProfile.linkedBank.balance < totalCharge && (
                    <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-400 text-xs flex gap-2.5 items-start">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono">INSUFFICIENT BANK BALANCE:</span> Your linked bank account balance of ${userProfile.linkedBank.balance.toLocaleString()} is insufficient to cover this checkout total of ${totalCharge.toLocaleString()}; consider executing a transfer or using a wallet instead.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-zinc-950/40 p-3.5 border border-zinc-850 rounded-lg">
                    <button
                      onClick={handlePrevStep}
                      className="px-5 py-3 bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
                    >
                      Back to Address
                    </button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={paymentOption === 'wallet' && userProfile.walletBalanceUSDC < totalCharge}
                      className={`px-8 py-3.5 font-display font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 border uppercase tracking-widest ${
                        paymentOption === 'wallet' && userProfile.walletBalanceUSDC < totalCharge
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-900'
                          : 'bg-[#FF3E00] text-white hover:bg-white hover:text-black border-[#FF3E00] hover:border-white cursor-pointer font-bold'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Broadcast Purchase</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side: Orders Summary panel cards */}
          <div className="lg:col-span-5 space-y-6" id="checkout-sidebar-summary">
            <div className="p-6 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-4">
              <h3 className="font-display text-sm font-bold text-white tracking-widest uppercase border-b border-zinc-850 pb-2 flex justify-between">
                <span>ORDER SPECIFICATIONS</span>
                <span className="text-zinc-500">[{cart.length} ITEMS]</span>
              </h3>

              <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800 overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt="img" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-xs text-white font-semibold truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex justify-between font-mono text-[9px] text-zinc-500 mt-0.5">
                        <span>qty: {item.quantity}</span>
                        <span>{(item.product.price * item.quantity).toLocaleString()} USDC</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-850 pt-4 space-y-2 font-mono text-xs divide-y divide-zinc-900/30">
                <div className="flex justify-between py-1 text-zinc-500">
                  <span>Resource Subtotal</span>
                  <span className="text-white">{cartSubtotal.toLocaleString()} USDC</span>
                </div>
                <div className="flex justify-between py-1.5 text-zinc-500">
                  <span>Freight Delivery Service</span>
                  <span className="text-white">{deliveryCharge.toLocaleString()} USDC</span>
                </div>
                <div className="flex justify-between py-2 text-sm border-t border-zinc-800">
                  <span className="text-zinc-400 font-semibold">Consensus Locked Total</span>
                  <span className="text-[#FF3E00] font-bold">{totalCharge.toLocaleString()} USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
