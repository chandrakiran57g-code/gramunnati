import { useState } from 'react';
import { motion } from 'framer-motion';
import { donationCheckout, loadRazorpayCheckout } from '@/api/entities';
import { Heart, CheckCircle, Clock, Shield, Users, TreePine, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const _urlParams = new URLSearchParams(window.location.search);
const defaultType = _urlParams.get('type') || 'general';

const AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

export default function Donate() {
  const [form, setForm] = useState({
    donor_name: '',
    email: '',
    mobile: '',
    amount: 500,
    customAmount: '',
    target_type: defaultType,
    village_id: _urlParams.get('village_id') || '',
    school_id: _urlParams.get('school_id') || '',
    project_id: _urlParams.get('project_id') || '',
    message: '',
    is_anonymous: false,
  });
  const [step, setStep] = useState('form'); // form | processing | success | pledged
  const [selectedPreset, setSelectedPreset] = useState(500);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAmountSelect = (amt) => {
    setSelectedPreset(amt);
    setForm(f => ({ ...f, amount: amt, customAmount: '' }));
  };

  const handleCustomAmount = (val) => {
    setSelectedPreset(null);
    setForm(f => ({ ...f, customAmount: val, amount: Number(val) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.donor_name || !form.amount || form.amount < 10) return;
    setErrorMsg('');
    setStep('processing');

    let donation;
    try {
      donation = await donationCheckout.createDonation({
        donor_name: form.donor_name,
        email: form.email || undefined,
        mobile: form.mobile || undefined,
        amount: form.amount,
        target_type: form.target_type,
        village_id: form.village_id || undefined,
        school_id: form.school_id || undefined,
        project_id: form.project_id || undefined,
        message: form.message || undefined,
        is_anonymous: form.is_anonymous,
      });
    } catch (err) {
      setErrorMsg(err?.message || 'Could not record your donation. Please try again.');
      setStep('form');
      return;
    }

    // Attempt to start online payment. If the gateway isn't configured yet, the
    // donation stays "pending" and we thank the donor as a recorded pledge.
    let order = null;
    try {
      order = await donationCheckout.createOrder(donation.id);
    } catch {
      order = null;
    }

    if (!order || order.configured === false || !order.order_id) {
      setStep('pledged');
      return;
    }

    const ready = await loadRazorpayCheckout();
    if (!ready || !window.Razorpay) {
      setStep('pledged');
      return;
    }

    const rzp = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'CMSR',
      description: `${form.target_type} donation`,
      prefill: { name: form.donor_name, email: form.email, contact: form.mobile },
      theme: { color: '#e11d48' },
      handler: async (resp) => {
        try {
          await donationCheckout.verify(donation.id, {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          setStep('success');
        } catch (err) {
          setErrorMsg(err?.message || 'We could not confirm your payment. If money was debited, contact us.');
          setStep('form');
        }
      },
      modal: { ondismiss: () => setStep('form') },
    });
    rzp.on('payment.failed', () => {
      setErrorMsg('Payment failed or was cancelled. Please try again.');
      setStep('form');
    });
    rzp.open();
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-donation/30 border-t-donation rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Processing Your Donation...</h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (step === 'pledged') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-2xl border border-border"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Thank You! 🙏</h2>
          <p className="text-muted-foreground mb-2">
            Your pledge of <span className="font-bold text-donation text-xl">₹{form.amount.toLocaleString('en-IN')}</span> has been recorded.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Online payments are being set up. Our team will contact you shortly with payment details to complete your donation.
          </p>
          <Button onClick={() => { setStep('form'); setForm(f => ({...f, amount: 500, customAmount: '', message: ''})); }} className="w-full brand-gradient text-white border-0 rounded-xl">
            Done
          </Button>
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-2xl border border-border"
        >
          <div className="w-20 h-20 bg-volunteer/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-volunteer" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Thank You! 🙏</h2>
          <p className="text-muted-foreground mb-2">
            Your donation of <span className="font-bold text-donation text-xl">₹{form.amount.toLocaleString('en-IN')}</span> has been received.
          </p>
          <p className="text-sm text-muted-foreground mb-6">You're making a real difference in rural India. A receipt has been generated for your records.</p>
          <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Donor</span><span className="font-medium">{form.is_anonymous ? 'Anonymous' : form.donor_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium text-donation">₹{form.amount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{form.target_type} Donation</span></div>
          </div>
          <Button onClick={() => { setStep('form'); setForm(f => ({...f, amount: 500, customAmount: '', message: ''})); }} className="w-full donation-gradient text-white border-0 rounded-xl">
            Donate Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroScrollSection size="page">
        <div className="donation-gradient py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Heart className="w-12 h-12 mx-auto mb-4 fill-white/20" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Make a Donation</h1>
              <p className="text-white/80 max-w-xl mx-auto">Your contribution transforms lives in rural India. Every rupee makes a difference.</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <h2 className="font-heading text-xl font-bold mb-2">Donation Details</h2>
              {errorMsg && (
                <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {errorMsg}
                </div>
              )}
              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-6 text-xs">
                {[
                  { label: 'Choose Cause', active: true },
                  { label: 'Select Amount', active: form.target_type && form.amount >= 10 },
                  { label: 'Your Details', active: form.donor_name },
                  { label: 'Impact Preview', active: false },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full font-medium ${step.active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}. {step.label.split(' ')[0]}</span>
                    {i < 3 && <span className="text-muted-foreground">→</span>}
                  </div>
                ))}
              </div>

              {/* Donation type */}
              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">Donation Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'general', label: 'General Fund', icon: '🌐' },
                    { value: 'village', label: 'Village Fund', icon: '🏘️' },
                    { value: 'school', label: 'School Fund', icon: '🏫' },
                    { value: 'project', label: 'Project Fund', icon: '📋' },
                  ].map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm(f => ({...f, target_type: t.value}))}
                      className={`p-3 rounded-xl border-2 text-center text-xs font-medium transition-all ${
                        form.target_type === t.value
                          ? 'border-donation bg-donation/10 text-donation'
                          : 'border-border text-muted-foreground hover:border-donation/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">Amount (₹)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {AMOUNTS.map(amt => (
                    <button key={amt} type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedPreset === amt
                          ? 'border-donation bg-donation text-white'
                          : 'border-border text-foreground hover:border-donation'
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt/1000}K` : amt}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Or enter custom amount (min ₹10)"
                  value={form.customAmount}
                  onChange={e => handleCustomAmount(e.target.value)}
                  className="rounded-xl"
                  min="10"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="donor_name">Full Name *</Label>
                  <Input id="donor_name" value={form.donor_name} onChange={e => setForm(f => ({...f, donor_name: e.target.value}))} placeholder="Your full name" className="rounded-xl mt-1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="your@email.com" className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input id="mobile" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} placeholder="10-digit number" className="rounded-xl mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea id="message" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="A message of encouragement..." className="rounded-xl mt-1 h-20" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_anonymous} onCheckedChange={v => setForm(f => ({...f, is_anonymous: v}))} />
                  <span className="text-sm text-muted-foreground">Make this donation anonymous</span>
                </div>

                {/* Impact preview */}
                {form.amount >= 10 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                    <div className="font-semibold text-green-800 mb-2">Your Impact Preview</div>
                    <div className="space-y-1.5 text-green-700">
                      {form.amount >= 10000 && <div>🏫 Fund a classroom renovation</div>}
                      {form.amount >= 5000 && <div>📚 Provide books for 50 students</div>}
                      {form.amount >= 2500 && <div>🌳 Plant 25 trees</div>}
                      {form.amount >= 1000 && <div>💧 Support clean water for a family</div>}
                      {form.amount >= 500 && <div>📖 10 textbooks for rural children</div>}
                      {form.amount >= 100 && <div>🌱 1 tree planted in a village school</div>}
                    </div>
                  </div>
                )}
                <Button type="submit" disabled={!form.donor_name || form.amount < 10} className="w-full donation-gradient text-white border-0 rounded-xl py-3 text-base font-semibold hover:opacity-90">
                  <Heart className="w-5 h-5 mr-2" />
                  Donate ₹{form.amount.toLocaleString('en-IN')} Now
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-heading font-bold text-primary mb-4">Why Donate?</h3>
                {[
                  { icon: TreePine, text: 'Directly impacts a village or school' },
                  { icon: School, text: 'Children get better education resources' },
                  { icon: Users, text: 'Supports rural livelihoods and farmers' },
                  { icon: Shield, text: '100% transparent fund utilization' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-2xl p-5 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-school" />
                  <span className="font-semibold text-sm">Secure Payment</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Your donation is processed securely. We support UPI, Debit/Credit Cards, Net Banking.</p>
                <div className="flex gap-2 flex-wrap">
                  {['💳 Card', '📱 UPI', '🏦 Net Banking', '💵 Bank Transfer'].map(m => (
                    <span key={m} className="text-xs bg-white border border-border rounded-full px-3 py-1 text-muted-foreground">{m}</span>
                  ))}
                </div>
              </div>

              <div className="bg-donation/5 border border-donation/20 rounded-2xl p-5 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-donation fill-donation/20" />
                  <span className="font-semibold text-sm">Where your donation goes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Every contribution directly supports village and school development projects.
                  You'll receive a donation receipt by email for your records once your payment is confirmed.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}