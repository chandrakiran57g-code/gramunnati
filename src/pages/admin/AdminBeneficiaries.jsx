import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Heart, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const beneficiaryTypes = ['village', 'school', 'farmer', 'student', 'women_shg', 'youth_group', 'artisan', 'other'];

export default function AdminBeneficiaries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', beneficiary_type: 'village', image: '', description: '', village_name: '', village_id: '', school_name: '', school_id: '', impact_details: '', state: '', district: '', status: 'active' });

  const load = () => {
    setLoading(true);
    base44.entities.Beneficiary.list('-created_date', 100).then(setItems).catch(() => []).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, beneficiary_type: b.beneficiary_type, image: b.image || '', description: b.description || '', village_name: b.village_name || '', village_id: b.village_id || '', school_name: b.school_name || '', school_id: b.school_id || '', impact_details: b.impact_details || '', state: b.state || '', district: b.district || '', status: b.status || 'active' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this beneficiary?')) return;
    await base44.entities.Beneficiary.delete(id);
    toast.success('Beneficiary deleted');
    load();
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error('Name and slug required');
    setSaving(true);
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const data = { ...form, slug };
    if (editing) { await base44.entities.Beneficiary.update(editing.id, data); toast.success('Updated'); }
    else { await base44.entities.Beneficiary.create(data); toast.success('Created'); }
    setEditing(null);
    setForm({ name: '', slug: '', beneficiary_type: 'village', image: '', description: '', village_name: '', village_id: '', school_name: '', school_id: '', impact_details: '', state: '', district: '', status: 'active' });
    setSaving(false);
    load();
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Heart className="w-6 h-6 text-village" /> Beneficiaries
          </h1>
          <p className="text-muted-foreground mt-1">Manage beneficiaries displayed on the public website</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', slug: '', beneficiary_type: 'village', image: '', description: '', village_name: '', village_id: '', school_name: '', school_id: '', impact_details: '', state: '', district: '', status: 'active' }); }}
          className="village-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" /> New</Button>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Edit' : 'Add New'} Beneficiary</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (!editing) setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })); }} /></div>
          <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <select value={form.beneficiary_type} onChange={e => setForm({ ...form, beneficiary_type: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white">
              {beneficiaryTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div><Label>Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
          <div><Label>Village Name</Label><Input value={form.village_name} onChange={e => setForm({ ...form, village_name: e.target.value })} /></div>
          <div><Label>State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
          <div><Label>District</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mb-4"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="mb-4"><Label>Impact Details</Label><Textarea value={form.impact_details} onChange={e => setForm({ ...form, impact_details: e.target.value })} rows={2} /></div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="village-gradient text-white border-0">{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? 'Update' : 'Create'}</Button>
          {editing && <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {items.length === 0 ? (
              <div className="px-5 py-12 text-center text-muted-foreground">No beneficiaries yet.</div>
            ) : items.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {b.image ? <img src={b.image} alt="" className="w-full h-full object-cover" /> : <Heart className="w-5 h-5 m-2.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.beneficiary_type?.replace(/_/g, ' ')} · {b.village_name || b.state}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}