import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Smartphone, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const PaymentModal: React.FC<{ session: any; onClose: () => void; onSuccess: () => void; studentId: string }> = ({ session, onClose, onSuccess, studentId }) => {
  const [method, setMethod] = useState<'mtn' | 'orange'>('mtn');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^6\d{8}$/.test(phone.replace(/\s/g, ''))) {
      return toast({ title: 'Invalid phone number', description: 'Enter a 9-digit Cameroon number starting with 6.' });
    }
    setStep('processing');
    // Simulate processing
    await new Promise(r => setTimeout(r, 2500));
    // Record payment
    const ref = `${method.toUpperCase()}-${Date.now()}`;
    const { error: payErr } = await supabase.from('payments').insert({
      session_id: session.id,
      student_id: studentId,
      tutor_id: session.tutor_id,
      amount: session.price,
      method,
      phone_number: phone,
      status: 'success',
      transaction_ref: ref,
    });
    if (payErr) {
      setStep('form');
      return toast({ title: 'Payment failed', description: payErr.message });
    }
    await supabase.from('tutoring_sessions').update({ payment_status: 'paid', updated_at: new Date().toISOString() }).eq('id', session.id);
    // Notify tutor
    await supabase.from('notifications').insert({
      user_id: session.tutor_id,
      type: 'payment_received',
      title: 'Payment received',
      body: `Student paid ${session.price.toLocaleString()} XAF for "${session.title}"`,
      link: `/tutor/classes/${session.id}`,
    });
    setStep('success');
    setTimeout(() => { onSuccess(); onClose(); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-semibold">Complete Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        {step === 'form' && (
          <form onSubmit={submit} className="p-5 space-y-5">
            <div className="bg-gradient-to-r from-blue-600/15 to-orange-500/15 border border-white/10 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-slate-400">Session</div>
              <div className="font-medium mt-1">{session.title}</div>
              <div className="text-2xl font-bold mt-3">{session.price.toLocaleString()} <span className="text-sm text-slate-400">XAF</span></div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setMethod('mtn')} className={`p-3 rounded-xl border text-left transition-colors ${method === 'mtn' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-bold text-xs mb-2">MTN</div>
                  <div className="text-sm font-medium">MTN MoMo</div>
                </button>
                <button type="button" onClick={() => setMethod('orange')} className={`p-3 rounded-xl border text-left transition-colors ${method === 'orange' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs mb-2">ORG</div>
                  <div className="text-sm font-medium">Orange Money</div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-1.5 block">Mobile Money Number</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6XX XXX XXX"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.03] rounded-lg p-3">
              <Shield size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>This is a simulated payment for demonstration. No real money will be charged.</span>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 font-semibold hover:opacity-90">
              Pay {session.price.toLocaleString()} XAF
            </button>
          </form>
        )}

        {step === 'processing' && (
          <div className="p-10 text-center">
            <Loader2 className="w-14 h-14 mx-auto text-orange-400 animate-spin mb-4" />
            <h4 className="text-lg font-semibold mb-1">Processing payment...</h4>
            <p className="text-sm text-slate-400">Confirming with {method === 'mtn' ? 'MTN MoMo' : 'Orange Money'}.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h4 className="text-lg font-semibold mb-1">Payment Successful!</h4>
            <p className="text-sm text-slate-400">Your class link is now unlocked.</p>
          </div>
        )}
      </div>
    </div>
  );
};
