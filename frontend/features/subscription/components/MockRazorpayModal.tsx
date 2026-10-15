import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, ShieldCheck, X, Loader2, QrCode, Sparkles } from 'lucide-react';
import { useDevUpgrade } from '../subscription.queries';

export interface VipPlanConfig {
  duration: "1_month" | "3_months" | "6_months" | "lifetime";
  label: string;
  price: number;
  durationDesc: string;
}

interface MockRazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: VipPlanConfig;
}

export function MockRazorpayModal({ isOpen, onClose, onSuccess, plan }: MockRazorpayModalProps) {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const { mutate: devUpgrade } = useDevUpgrade();

  const currentPlan: VipPlanConfig = plan || {
    duration: "1_month",
    label: "1 Month VIP",
    price: 499,
    durationDesc: "30 Days Access",
  };

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setMethod('upi');
      setCardNumber('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    if (method === 'upi' && !upiId.trim()) {
      alert("Please enter a valid UPI ID");
      return;
    }
    if (method === 'card') {
      if (!cardNumber.trim() || !expiry.trim() || !cvv.trim() || !cardName.trim()) {
        alert("Please fill all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 15) {
        alert("Please enter a valid card number");
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      devUpgrade(
        { duration: currentPlan.duration },
        {
          onSuccess: () => {
            setIsProcessing(false);
            onSuccess();
          },
          onError: () => {
            setIsProcessing(false);
            alert("Something went wrong with the simulated payment.");
          },
        }
      );
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] md:max-w-[850px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:h-[550px] animate-in zoom-in-95 duration-300 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col w-[350px] bg-brand-900 border-r border-gray-100 text-white">
          <div className="p-8 flex flex-col justify-center min-h-[140px] relative overflow-hidden bg-gradient-to-br from-brand-900 to-[#8f3b4d]">
            <h2 className="text-2xl font-bold z-10 font-serif tracking-wide">NIRA VIP</h2>
            <p className="text-brand-100 text-xs mt-1 z-10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-100" />
              <span>Premium Matchmaking Pass</span>
            </p>
          </div>
          
          <div className="p-6 bg-white flex-1 flex flex-col text-gray-800">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Selected Package</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-900 border border-brand-200">
                  {currentPlan.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-500 text-sm font-medium">Amount to pay</span>
                <span className="text-2xl font-bold text-gray-900">₹{currentPlan.price.toLocaleString()}.00</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">{currentPlan.durationDesc}</div>
            </div>
            
            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => setMethod('upi')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                  method === 'upi'
                    ? 'bg-brand-50/80 shadow-xs border border-brand-300 text-brand-900'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-brand-900" />
                  <span className="font-bold text-xs sm:text-sm">UPI / QR Code</span>
                </div>
              </button>
              
              <button 
                type="button"
                onClick={() => setMethod('card')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                  method === 'card'
                    ? 'bg-brand-50/80 shadow-xs border border-brand-300 text-brand-900'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-brand-900" />
                  <span className="font-bold text-xs sm:text-sm">Debit / Credit Card</span>
                </div>
              </button>
            </div>
            
            <div className="mt-auto pt-6 flex items-center gap-2 text-gray-400 justify-center border-t border-gray-100 bg-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Secured with Razorpay Sandbox</span>
            </div>
          </div>
        </div>

        {/* Right Content / Form */}
        <div className="flex-1 flex flex-col relative bg-white h-full">
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-10 flex-1 flex flex-col overflow-y-auto mt-4 md:mt-6">
            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-brand-900 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Authorizing ₹{currentPlan.price.toLocaleString()}...</h3>
                <p className="text-xs text-gray-500">Securing your VIP upgrade with Razorpay Sandbox</p>
              </div>
            ) : method === 'upi' ? (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Pay with Instant UPI</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Scan with GPay, PhonePe, Paytm, or enter UPI VPA</p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center mb-6">
                  <QrCode className="w-20 h-20 text-gray-800 mb-2" />
                  <p className="text-xs font-semibold text-gray-800">Scan QR Code using any UPI app</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Total payable: ₹{currentPlan.price.toLocaleString()}</p>
                </div>

                <div className="space-y-1 mb-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">UPI ID / VPA</label>
                  <input 
                    autoComplete="off" 
                    type="text" 
                    placeholder="Enter UPI ID (e.g. name@okhdfc)" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-xs font-medium text-gray-800"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>

                <button 
                  type="button"
                  onClick={handlePay}
                  className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center text-sm mt-auto cursor-pointer"
                >
                  Pay ₹{currentPlan.price.toLocaleString()}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Pay with Card</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Credit or Debit Card accepted</p>
                </div>

                <div className="space-y-3">
                  <input 
                    autoComplete="off" 
                    type="text" 
                    placeholder="Card Number (4000 1234 5678 9010)" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19))} 
                    maxLength={19} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-800 focus:outline-hidden focus:border-brand-900" 
                  />
                  <div className="flex gap-3">
                    <input 
                      autoComplete="off" 
                      type="text" 
                      placeholder="MM/YY" 
                      value={expiry} 
                      onChange={(e) => setExpiry(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-800 focus:outline-hidden focus:border-brand-900" 
                    />
                    <input 
                      autoComplete="off" 
                      type="password" 
                      placeholder="CVV" 
                      maxLength={3} 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-800 focus:outline-hidden focus:border-brand-900" 
                    />
                  </div>
                  <input 
                    autoComplete="off" 
                    type="text" 
                    placeholder="Cardholder Name" 
                    value={cardName} 
                    onChange={(e) => setCardName(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-800 focus:outline-hidden focus:border-brand-900" 
                  />
                </div>

                <button 
                  type="button"
                  onClick={handlePay}
                  className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center text-sm mt-auto cursor-pointer"
                >
                  Pay ₹{currentPlan.price.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}