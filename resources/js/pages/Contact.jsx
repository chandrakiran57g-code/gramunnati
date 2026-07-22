import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { usePublicSettings } from '@/hooks/usePublicSettings';

export default function Contact() {
  const { contactEmail, contactPhone, address } = usePublicSettings();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.ContactMessage.create(form);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="brand-gradient py-10 sm:py-12 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-white/80 max-w-xl mx-auto">Have questions about villages, schools, or projects? We'd love to hear from you.</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {[
                { icon: MapPin, title: 'Address', value: address },
                { icon: Mail, title: 'Email', value: contactEmail },
                { icon: Phone, title: 'Phone', value: contactPhone },
              ].map((item, i) => (
                <div key={item.title} className="flex items-start gap-4 bg-white rounded-xl border border-border p-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{item.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{item.value}</div>
                  </div>
                </div>
              ))}

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-2">Village Representative?</h4>
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
                  <Button type="submit" disabled={loading} className="w-full brand-gradient text-white border-0 rounded-xl py-3 font-semibold hover:opacity-90">
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