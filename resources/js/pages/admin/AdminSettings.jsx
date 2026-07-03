import { useState, useEffect } from 'react';
import { Settings, Save, Globe, CreditCard, Search, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { cmsService } from '@/api/cms';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { BilingualSettingsField } from '@/components/admin/BilingualField';

const GENERAL_KEYS = ['site_name', 'site_name_te', 'contact_email', 'contact_phone', 'address', 'address_te', 'logo_url', 'favicon_url'];
const PAYMENT_KEYS = ['rzp_key', 'rzp_secret', 'upi_id', 'bank_name', 'bank_account', 'ifsc'];
const SEO_KEYS = ['meta_title', 'meta_title_te', 'meta_desc', 'meta_desc_te', 'meta_keywords', 'ga_id'];
const NOTIFICATION_KEYS = ['notify_donation', 'notify_volunteer', 'notify_contact', 'notify_weekly', 'notify_monthly'];

function SettingsFields({ fields, values, onChange }) {
  return fields.map((field) => (
    <div key={field.id}>
      <Label htmlFor={field.id}>{field.label}</Label>
      <Input
        id={field.id}
        type={field.type || 'text'}
        placeholder={field.placeholder}
        value={values[field.id] ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        className="mt-1 rounded-xl"
      />
    </div>
  ));
}

export default function AdminSettings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cmsService.getSettings()
      .then(setValues)
      .catch((err) => setError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const saveKeys = async (keys) => {
    setSaving(true);
    setError(null);
    try {
      const payload = keys.reduce((acc, key) => {
        if (values[key] !== undefined) acc[key] = values[key];
        return acc;
      }, {});
      await cmsService.updateSettings(payload);
      notifyPlatformDataChanged({ type: 'settings' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key) => {
    const current = values[key] === 'true' || values[key] === true;
    handleChange(key, current ? 'false' : 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/70 text-sm mt-1">Loaded from and saved to the `settings` table</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

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
              <BilingualSettingsField enKey="site_name" label="Site Name" values={values} onChange={handleChange} />
              <SettingsFields
                fields={[
                  { label: 'Contact Email', placeholder: 'contact@cmsr.in', id: 'contact_email' },
                  { label: 'Contact Phone', placeholder: '+91 9XXXXXXXXX', id: 'contact_phone' },
                ]}
                values={values}
                onChange={handleChange}
              />
              <BilingualSettingsField enKey="address" label="Address" values={values} onChange={handleChange} multiline rows={2} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminImageUpload label="Site logo" value={values.logo_url || ''} onChange={(url) => handleChange('logo_url', url)} subPath="settings" />
                <AdminImageUpload label="Favicon" value={values.favicon_url || ''} onChange={(url) => handleChange('favicon_url', url)} subPath="settings" />
              </div>
              <Button onClick={() => saveKeys(GENERAL_KEYS)} disabled={saving} className="brand-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save General Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-heading font-bold text-lg mb-4">Payment Settings</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                Payment gateway keys are stored in the database for reference. Live payments require server-side configuration.
              </div>
              <SettingsFields
                fields={[
                  { label: 'Razorpay Key ID', placeholder: 'rzp_live_XXXXXXXXXX', id: 'rzp_key' },
                  { label: 'Razorpay Key Secret', placeholder: '••••••••••••••••', id: 'rzp_secret', type: 'password' },
                  { label: 'UPI ID', placeholder: 'cmsr@upi', id: 'upi_id' },
                  { label: 'Bank Account Name', placeholder: 'CMSR Foundation', id: 'bank_name' },
                  { label: 'Bank Account Number', placeholder: 'XXXXXXXXXXXX', id: 'bank_account' },
                  { label: 'IFSC Code', placeholder: 'SBIN0XXXXXX', id: 'ifsc' },
                ]}
                values={values}
                onChange={handleChange}
              />
              <Button onClick={() => saveKeys(PAYMENT_KEYS)} disabled={saving} className="donation-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Payment Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-heading font-bold text-lg mb-4">SEO Settings</h3>
              <BilingualSettingsField enKey="meta_title" label="Default Meta Title" values={values} onChange={handleChange} />
              <BilingualSettingsField enKey="meta_desc" label="Default Meta Description" values={values} onChange={handleChange} multiline rows={3} />
              <SettingsFields
                fields={[
                  { label: 'Default Keywords', placeholder: 'village development, rural India…', id: 'meta_keywords' },
                  { label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX', id: 'ga_id' },
                ]}
                values={values}
                onChange={handleChange}
              />
              <Button onClick={() => saveKeys(SEO_KEYS)} disabled={saving} className="school-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save SEO Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Notification Preferences</h3>
              {[
                { label: 'Email on new donation', key: 'notify_donation' },
                { label: 'Email on new volunteer registration', key: 'notify_volunteer' },
                { label: 'Email on new contact message', key: 'notify_contact' },
                { label: 'Weekly summary report', key: 'notify_weekly' },
                { label: 'Monthly impact report', key: 'notify_monthly' },
              ].map((item) => {
                const checked = values[item.key] === 'true' || values[item.key] === true;
                return (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'} relative`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
              <Button onClick={() => saveKeys(NOTIFICATION_KEYS)} disabled={saving} className="mt-5 brand-gradient text-white border-0 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Notifications'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
