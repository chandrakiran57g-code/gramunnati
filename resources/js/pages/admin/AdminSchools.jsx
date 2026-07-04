import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { School, Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useVillageOptions, slugifyName } from '@/hooks/useGeoPickers';
import { BilingualInput, BilingualTextarea } from '@/components/admin/BilingualField';

const EMPTY_FORM = {
  school_name: '', school_name_te: '', slug: '', village_id: '', school_type: 'government', udise_code: '', principal_name: '', contact_number: '',
  email: '', website: '', student_count: 0, teacher_count: 0, classroom_count: 0,
  library_available: false, computer_lab_available: false, playground_available: false,
  drinking_water_available: false, toilet_available: false, electricity_available: false,
  digital_classroom_available: false, boundary_wall_available: false,
  cover_image: '', logo: '', short_description: '', short_description_te: '', is_featured: false, is_active: true,
};

export default function AdminSchools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { villages } = useVillageOptions();

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoading(true);
    base44.entities.School.list('-created_date', 200).then(setItems).catch(() => []).finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this school?')) return;
    try { await base44.entities.School.delete(id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.village_id) return toast.error('Select a village');
    const payload = {
      school_name: form.school_name,
      school_name_te: form.school_name_te || null,
      short_description_te: form.short_description_te || null,
      slug: form.slug || slugifyName(form.school_name),
      village_id: Number(form.village_id),
      school_type: form.school_type,
      udise_code: form.udise_code || null,
      principal_name: form.principal_name || null,
      contact_number: form.contact_number || null,
      email: form.email || null,
      website: form.website || null,
      student_count: Number(form.student_count) || 0,
      teacher_count: Number(form.teacher_count) || 0,
      classroom_count: Number(form.classroom_count) || 0,
      library_available: form.library_available,
      computer_lab_available: form.computer_lab_available,
      playground_available: form.playground_available,
      drinking_water_available: form.drinking_water_available,
      toilet_available: form.toilet_available,
      electricity_available: form.electricity_available,
      digital_classroom_available: form.digital_classroom_available,
      boundary_wall_available: form.boundary_wall_available,
      cover_image: form.cover_image || null,
      logo: form.logo || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };
    try {
      if (editing) { await base44.entities.School.update(editing.id, payload); toast.success('Updated'); }
      else { await base44.entities.School.create(payload); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm(EMPTY_FORM); loadData();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...EMPTY_FORM,
      ...item,
      village_id: item.village_id ? String(item.village_id) : item.villages?.id ? String(item.villages.id) : '',
    });
    setShowForm(true);
  };
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const filtered = items.filter(i => !search || i.school_name?.toLowerCase().includes(search.toLowerCase()) || i.villages?.village_name?.toLowerCase().includes(search.toLowerCase()));

  const INFRA_FIELDS = [
    { key: 'library_available', label: 'Library' },
    { key: 'computer_lab_available', label: 'Computer Lab' },
    { key: 'playground_available', label: 'Playground' },
    { key: 'drinking_water_available', label: 'Drinking Water' },
    { key: 'toilet_available', label: 'Toilets' },
    { key: 'electricity_available', label: 'Electricity' },
    { key: 'digital_classroom_available', label: 'Digital Classroom' },
    { key: 'boundary_wall_available', label: 'Boundary Wall' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-school text-white py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold flex items-center gap-3"><School className="w-8 h-8" /> Schools Management</h1>
              <p className="text-white/70 text-sm mt-1">{items.length} schools registered</p>
            </div>
            <Button onClick={openCreate} className="bg-white text-school hover:bg-white/90"><Plus className="w-4 h-4 mr-2" /> Add School</Button>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools..." className="pl-10 rounded-xl" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-school/20 border-t-school rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><School className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" /><p className="text-muted-foreground">No schools found.</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold">School</th>
                  <th className="text-left px-4 py-3 font-semibold">Village</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Students</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item, i) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/20">
                      <td className="px-4 py-3"><div className="font-medium">{item.school_name}</div><div className="text-xs text-muted-foreground">{item.villages?.districts?.name || '—'}, {item.villages?.states?.name || '—'}</div></td>
                      <td className="px-4 py-3 text-muted-foreground">{item.villages?.village_name || '—'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-school/10 text-school text-xs font-medium capitalize">{item.school_type}</span></td>
                      <td className="px-4 py-3">{item.student_count || 0}</td>
                      <td className="px-4 py-3">{item.is_active ? <span className="text-green-600 text-xs font-medium">Active</span> : <span className="text-red-500 text-xs font-medium">Inactive</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-school/10 text-school"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 ml-1"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-heading text-lg font-bold">{editing ? 'Edit School' : 'Add School'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <BilingualInput name="school_name" label="School Name" form={form} setForm={setForm} required />
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} placeholder="auto-generated" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Village *</Label>
                  <select value={form.village_id} onChange={e => setForm(f => ({...f, village_id: e.target.value}))} required className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select village</option>
                    {villages.map(v => <option key={v.id} value={String(v.id)}>{v.village_name}</option>)}
                  </select>
                </div>
                <div><Label>School Type *</Label>
                  <select value={form.school_type} onChange={e => setForm(f => ({...f, school_type: e.target.value}))} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm">
                    <option value="government">Government</option><option value="private">Private</option><option value="aided">Aided</option><option value="model">Model</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Students</Label><Input type="number" value={form.student_count} onChange={e => setForm(f => ({...f, student_count: Number(e.target.value)}))} className="mt-1" /></div>
                <div><Label>Teachers</Label><Input type="number" value={form.teacher_count} onChange={e => setForm(f => ({...f, teacher_count: Number(e.target.value)}))} className="mt-1" /></div>
                <div><Label>Classrooms</Label><Input type="number" value={form.classroom_count} onChange={e => setForm(f => ({...f, classroom_count: Number(e.target.value)}))} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Principal Name</Label><Input value={form.principal_name} onChange={e => setForm(f => ({...f, principal_name: e.target.value}))} className="mt-1" /></div>
                <div><Label>UDISE Code</Label><Input value={form.udise_code} onChange={e => setForm(f => ({...f, udise_code: e.target.value}))} className="mt-1" /></div>
              </div>
              <BilingualTextarea name="short_description" label="Short Description" form={form} setForm={setForm} rows={3} />
              <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={e => setForm(f => ({...f, cover_image: e.target.value}))} className="mt-1" /></div>
              <div>
                <Label className="mb-3 block font-semibold">Infrastructure</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INFRA_FIELDS.map(f => (
                    <div key={f.key} className="flex items-center gap-2">
                      <Switch checked={form[f.key] || false} onCheckedChange={v => setForm(prev => ({...prev, [f.key]: v}))} />
                      <span className="text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({...f, is_featured: v}))} /><span className="text-sm">Featured</span></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({...f, is_active: v}))} /><span className="text-sm">Active</span></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-school text-white hover:bg-school/90"><Check className="w-4 h-4 mr-2" /> {editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
