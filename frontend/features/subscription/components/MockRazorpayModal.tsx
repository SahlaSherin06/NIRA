import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, ShieldCheck, X, ChevronRight, Loader2, QrCode } from 'lucide-react';
import { useDevUpgrade } from '../subscription.queries';

interface MockRazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MockRazorpayModal({ isOpen, onClose, onSuccess }: MockRazorpayModalProps) {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const { mutate: devUpgrade } = useDevUpgrade();

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
      devUpgrade(undefined, {
        onSuccess: () => {
          setIsProcessing(false);
          onSuccess();
        },
        onError: () => {
          setIsProcessing(false);
          alert("Something went wrong with the simulated payment.");
        }
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] md:max-w-[850px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:h-[550px] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hidden md:flex flex-col w-[350px] bg-brand-900 border-r border-gray-200">
          <div className="p-8 text-white flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <h2 className="text-2xl font-bold z-10 font-serif">NIRA</h2>
            <p className="text-white/80 text-sm mt-1 z-10">Premium Matchmaking</p>
          </div>
          
          <div className="p-6 bg-white flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-gray-500 text-sm font-medium">Amount to pay</span>
              <span className="text-xl font-bold text-gray-900">₹499.00</span>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setMethod('upi')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${method === 'upi' ? 'bg-white shadow-sm border border-brand-200 text-brand-900' : 'hover:bg-gray-100 text-gray-700 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-semibold text-sm">UPI / QR</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMethod('card')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${method === 'card' ? 'bg-white shadow-sm border border-brand-200 text-brand-900' : 'hover:bg-gray-100 text-gray-700 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold text-sm">Card</span>
                </div>
              </button>
            </div>
            
            <div className="mt-auto pt-6 flex items-center gap-2 text-gray-400 justify-center border-t border-gray-200/60 bg-white">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Secured by Razorpay</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-white h-full">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors z-20">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-10 flex-1 flex flex-col overflow-y-auto mt-8">
            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-brand-900 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
              </div>
            ) : method === 'upi' ? (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pay with UPI</h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center mb-8">
                  <QrCode className="w-24 h-24 text-gray-800 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Scan QR Code using any UPI app</p>
                </div>
                <input autoComplete="off" 
                  type="text" 
                  placeholder="Enter UPI ID (e.g. name@okhdfc)" 
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-sm font-medium"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <button 
                  onClick={handlePay}
                  className="w-full py-4 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center text-lg mt-auto"
                >
                  Pay ₹499
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Card</h3>
                <div className="space-y-4">
                  <input autoComplete="off" type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19))} maxLength={19} className="w-full p-4 border rounded-xl" />
                  <div className="flex gap-4">
                    <input autoComplete="off" type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full p-4 border rounded-xl" />
                    <input autoComplete="off" type="password" placeholder="CVV" maxLength={3} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} className="w-full p-4 border rounded-xl" />
                  </div>
                  <input autoComplete="off" type="text" placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full p-4 border rounded-xl" />
                </div>
                <button 
                  onClick={handlePay}
                  className="w-full py-4 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center text-lg mt-8"
                >
                  Pay ₹499
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}