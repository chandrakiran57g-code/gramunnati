import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.ContactMessage.create(form);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="village-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-white/80 max-w-xl mx-auto">Have questions about villages, schools, or projects? We'd love to hear from you.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {[
                { icon: MapPin, title: 'Address', value: 'India — Nationwide Coverage' },
                { icon: Mail, title: 'Email', value: 'contact@GramUnnati.in' },
                { icon: Phone, title: 'Phone', value: '+91 99999 99999' },
              ].map((item, i) => (
                <div key={item.title} className="flex items-start gap-4 bg-white rounded-xl border border-border p-5">
                  <div className="w-10 h-10 bg-village/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-village" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{item.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{item.value}</div>
                  </div>
                </div>
              ))}

              <div className="bg-village/5 border border-village/20 rounded-xl p-5">
                <h4 className="font-semibold text-village mb-2">Village Representative?</h4>
                <p className="text-sm text-muted-foreground">If you want to register your village or school on the platform, contact us directly and we'll guide you through the process.</p>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
                <CheckCircle className="w-14 h-14 text-volunteer mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-bold mb-2">Message Sent! 🙏</h3>
                <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">Send Another</Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" className="mt-1 rounded-xl" required />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="your@email.com" className="mt-1 rounded-xl" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input id="mobile" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} placeholder="10-digit number" className="mt-1 rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="What's this about?" className="mt-1 rounded-xl" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="How can we help you?" className="mt-1 rounded-xl h-32" required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full village-gradient text-white border-0 rounded-xl py-3 font-semibold hover:opacity-90">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}