import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Building2, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { validateContactFields } from '@/lib/formValidation';

const partnerTypes = ['ngo', 'company', 'educational_institution', 'government', 'individual', 'csr_partner', 'foundation'];
const EMPTY_PARTNER = { name: '', name_te: '', slug: '', logo: '', partner_type: 'ngo', website: '', email: '', mobile: '', description: '', description_te: '', is_active: true };

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_PARTNER);

  const load = () => {
    setLoading(true);
    base44.entities.Partner.list('-created_date', 100).then(setPartners).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, name_te: p.name_te || '', slug: p.slug, logo: p.logo || '', partner_type: p.partner_type, website: p.website || '', email: p.email || '', mobile: p.mobile || '', description: p.description || '', description_te: p.description_te || '', is_active: p.is_active ?? true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this partner?')) return;
    await base44.entities.Partner.delete(id);
    toast.success('Partner deleted');
    load();
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error('Name and slug required');
    const contactError = validateContactFields({ email: form.email, mobile: form.mobile, website: form.website });
    if (contactError) return toast.error(contactError);
    setSaving(true);
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const data = { ...form, slug };
    if (editing) { await base44.entities.Partner.update(editing.id, data); toast.success('Partner updated'); }
    else { await base44.entities.Partner.create(data); toast.success('Partner created'); }
    setEditing(null);
    setForm(EMPTY_PARTNER);
    setSaving(false);
    load();
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" /> Partner Organizations
          </h1>
          <p className="text-muted-foreground mt-1">Manage partner organizations shown on the website</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_PARTNER); }}
          className="brand-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" /> New Partner</Button>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Edit Partner' : 'Add New Partner'}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <BilingualInput
            name="name"
            label="Name"
            form={form}
            setForm={setForm}
            required
            onEnChange={(name) => {
              if (!editing) setForm((prev) => ({ ...prev, slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') }));
            }}
          />
          <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          <AdminImageUpload label="Logo" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} subPath="partners" />
          <div>
            <Label>Partner Type</Label>
            <select value={form.partner_type} onChange={e => setForm({ ...form, partner_type: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white">
              {partnerTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" /></div>
          <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm({ ...form, is_active: e.target.value === 'active' })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <BilingualRichText name="description" label="Description" form={form} setForm={setForm} className="mb-4" />
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="brand-gradient text-white border-0">{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? 'Update' : 'Create'}</Button>
          {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {partners.length === 0 ? (
              <div className="px-5 py-12 text-center text-muted-foreground">No partners yet.</div>
            ) : partners.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    {p.logo ? <img src={p.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.partner_type?.replace(/_/g, ' ')} · {p.is_active ? 'active' : 'inactive'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}