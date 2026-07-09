import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Edit, Eye, MapPin, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useGeoPickers, villageDisplay, slugifyName } from '@/hooks/useGeoPickers';
import { toast } from 'sonner';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import AdminUrlField from '@/components/admin/AdminUrlField';

const EMPTY_FORM = {
  village_name: '',
  village_name_te: '',
  slug: '',
  short_description: '',
  short_description_te: '',
  description: '',
  description_te: '',
  population: '',
  cover_image: '',
  is_featured: false,
  is_active: true,
};

export default function AdminVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const geo = useGeoPickers();

  const loadVillages = () => {
    setLoading(true);
    base44.entities.Village.list('-created_date', 200)
      .then(setVillages)
      .catch(() => setVillages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVillages();
  }, []);

  const filtered = villages.filter((v) => {
    const { district, state } = villageDisplay(v);
    const matchQ =
      !query ||
      v.village_name?.toLowerCase().includes(query.toLowerCase()) ||
      district.toLowerCase().includes(query.toLowerCase()) ||
      state.toLowerCase().includes(query.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? v.is_active !== false : !v.is_active) ||
      (statusFilter === 'featured' ? v.is_featured : false);
    return matchQ && matchStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    geo.setFromRecord({});
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      village_name: v.village_name || '',
      village_name_te: v.village_name_te || '',
      slug: v.slug || '',
      short_description: v.short_description || '',
      short_description_te: v.short_description_te || '',
      description: v.description || '',
      description_te: v.description_te || '',
      population: v.population ?? '',
      cover_image: v.cover_image || '',
      is_featured: Boolean(v.is_featured),
      is_active: v.is_active !== false,
    });
    geo.setFromRecord(v);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.village_name.trim()) return toast.error('Village name is required');
    if (!geo.geoIds.state_id || !geo.geoIds.district_id || !geo.geoIds.mandal_id) {
      return toast.error('Select state, district, and mandal');
    }

    setSaving(true);
    const payload = {
      village_name: form.village_name.trim(),
      slug: form.slug.trim() || slugifyName(form.village_name),
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      population: form.population ? Number(form.population) : null,
      cover_image: form.cover_image.trim() || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      state_id: geo.geoIds.state_id,
      district_id: geo.geoIds.district_id,
      mandal_id: geo.geoIds.mandal_id,
    };

    try {
      if (editing) {
        await base44.entities.Village.update(editing.id, payload);
        toast.success('Village updated');
      } else {
        await base44.entities.Village.create(payload);
        toast.success('Village created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      loadVillages();
    } catch (err) {
      toast.error(err.message || 'Failed to save village');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Villages</h1>
              <p className="text-white/70 text-sm mt-1">{villages.length} villages registered</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  ← Dashboard
                </Button>
              </Link>
              <Button size="sm" className="donation-gradient text-white border-0" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" />Add Village
              </Button>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search villages..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-16 animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#337ab7] text-white">
                  <th className="text-left px-5 py-3 text-xs font-semibold border-r border-white/25">Village</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell border-r border-white/25">District</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell border-r border-white/25">State</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden lg:table-cell border-r border-white/25">Population</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold border-r border-white/25">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const loc = villageDisplay(v);
                  return (
                    <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-5 py-3 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{v.village_name}</div>
                            {loc.mandal && <div className="text-xs text-muted-foreground">{loc.mandal}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell border-r border-gray-200">{loc.district}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell border-r border-gray-200">{loc.state}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell border-r border-gray-200">{v.population?.toLocaleString('en-IN') || '—'}</td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {v.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                        {v.is_featured && <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-donation/10 text-donation">Featured</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={`/villages/${v.slug || v.id}`}>
                            <button type="button" className="p-1.5 rounded-lg hover:bg-school/10 text-muted-foreground hover:text-school transition-colors"><Eye className="w-4 h-4" /></button>
                          </Link>
                          <button type="button" onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No villages found</div>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-heading text-lg font-bold">{editing ? 'Edit Village' : 'Add Village'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <BilingualInput name="village_name" label="Village Name" form={form} setForm={setForm} required />
              </div>
              <AdminUrlField
                title={form.village_name}
                slug={form.slug}
                onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
                publicBase="/villages"
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>State *</Label>
                  <select value={geo.stateId} onChange={(e) => geo.setStateId(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select state</option>
                    {geo.states.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>District *</Label>
                  <select value={geo.districtId} onChange={(e) => geo.setDistrictId(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select district</option>
                    {geo.districts.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Mandal *</Label>
                  <select value={geo.mandalId} onChange={(e) => geo.setMandalId(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select mandal</option>
                    {geo.mandals.map((m) => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <BilingualRichText name="short_description" label="Short Description" form={form} setForm={setForm} />
              <BilingualRichText name="description" label="Full Description" form={form} setForm={setForm} />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Population</Label>
                  <Input type="number" value={form.population} onChange={(e) => setForm((f) => ({ ...f, population: e.target.value }))} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input value={form.cover_image} onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))} className="mt-1 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} /><span className="text-sm">Featured</span></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} /><span className="text-sm">Active</span></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="brand-gradient text-white border-0">
                  <Check className="w-4 h-4 mr-2" />{editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
