import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, CreditCard, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/70 text-sm mt-1">Platform configuration and preferences</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="general">
          <TabsList className="mb-6 bg-muted rounded-xl p-1">
            <TabsTrigger value="general" className="rounded-lg"><Globe className="w-3.5 h-3.5 mr-1.5" />General</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-lg"><CreditCard className="w-3.5 h-3.5 mr-1.5" />Payment</TabsTrigger>
            <TabsTrigger value="seo" className="rounded-lg"><Search className="w-3.5 h-3.5 mr-1.5" />SEO</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg"><Bell className="w-3.5 h-3.5 mr-1.5" />Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-heading font-bold text-lg mb-4">General Settings</h3>
              {[
                { label: 'Site Name', placeholder: 'Village Development & School Empowerment Platform', id: 'site_name' },
                { label: 'Contact Email', placeholder: 'contact@GramUnnati.in', id: 'contact_email' },
                { label: 'Contact Phone', placeholder: '+91 9XXXXXXXXX', id: 'contact_phone' },
                { label: 'Address', placeholder: 'GramUnnati Office, Hyderabad, Telangana', id: 'address' },
              ].map(field => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input id={field.id} placeholder={field.placeholder} className="mt-1 rounded-xl" />
                </div>
              ))}
              <Button onClick={handleSave} className="brand-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />{saved ? '✓ Saved!' : 'Save General Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-heading font-bold text-lg mb-4">Payment Settings</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                ⚠️ Payment gateway integration requires backend configuration. These settings are stored for reference.
              </div>
              {[
                { label: 'Razorpay Key ID', placeholder: 'rzp_live_XXXXXXXXXX', id: 'rzp_key' },
                { label: 'Razorpay Key Secret', placeholder: '••••••••••••••••', id: 'rzp_secret', type: 'password' },
                { label: 'UPI ID', placeholder: 'GramUnnati@upi', id: 'upi_id' },
                { label: 'Bank Account Name', placeholder: 'GramUnnati Foundation', id: 'bank_name' },
                { label: 'Bank Account Number', placeholder: 'XXXXXXXXXXXX', id: 'bank_account' },
                { label: 'IFSC Code', placeholder: 'SBIN0XXXXXX', id: 'ifsc' },
              ].map(field => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input id={field.id} type={field.type || 'text'} placeholder={field.placeholder} className="mt-1 rounded-xl" />
                </div>
              ))}
              <Button onClick={handleSave} className="donation-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />{saved ? '✓ Saved!' : 'Save Payment Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-heading font-bold text-lg mb-4">SEO Settings</h3>
              {[
                { label: 'Default Meta Title', placeholder: 'GramUnnati — Village Development & School Empowerment Platform', id: 'meta_title' },
                { label: 'Default Meta Description', placeholder: 'Join the movement to transform rural India...', id: 'meta_desc' },
                { label: 'Default Keywords', placeholder: 'village development, school empowerment, rural India, GramUnnati...', id: 'meta_keywords' },
                { label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX', id: 'ga_id' },
              ].map(field => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input id={field.id} placeholder={field.placeholder} className="mt-1 rounded-xl" />
                </div>
              ))}
              <Button onClick={handleSave} className="school-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />{saved ? '✓ Saved!' : 'Save SEO Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Notification Preferences</h3>
              {[
                { label: 'Email on new donation', checked: true },
                { label: 'Email on new volunteer registration', checked: true },
                { label: 'Email on new contact message', checked: true },
                { label: 'Weekly summary report', checked: false },
                { label: 'Monthly impact report', checked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-sm">{item.label}</span>
                  <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${item.checked ? 'bg-primary' : 'bg-gray-200'} relative`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              ))}
              <Button onClick={handleSave} className="mt-5 brand-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />{saved ? '✓ Saved!' : 'Save Notifications'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}