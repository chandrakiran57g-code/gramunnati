import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useVillageOptions, useProjectCategoryOptions, slugifyName } from '@/hooks/useGeoPickers';
import { BilingualInput, BilingualTextarea } from '@/components/admin/BilingualField';

const STATUSES = ['upcoming', 'active', 'completed', 'cancelled'];
const EMPTY = {
  project_name: '',
  project_name_te: '',
  slug: '',
  project_category_id: '',
  village_id: '',
  short_description: '',
  short_description_te: '',
  budget_amount: 0,
  raised_amount: 0,
  spent_amount: 0,
  start_date: '',
  end_date: '',
  status: 'active',
  cover_image: '',
  is_featured: false,
};

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterStatus, setFilterStatus] = useState('all');
  const { villages } = useVillageOptions();
  const categories = useProjectCategoryOptions();

  useEffect(() => { load(); }, []);
  const load = () => {
    setLoading(true);
    base44.entities.Project.list('-created_date', 200).then(setItems).catch(() => []).finally(() => setLoading(false));
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    try { await base44.entities.Project.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.project_category_id) return toast.error('Select a category');
    if (!form.village_id) return toast.error('Select a village');

    const budget = Number(form.budget_amount) || 0;
    const raised = Number(form.raised_amount) || 0;
    const payload = {
      project_name: form.project_name,
      project_name_te: form.project_name_te || null,
      slug: form.slug || slugifyName(form.project_name),
      project_category_id: Number(form.project_category_id),
      village_id: Number(form.village_id),
      short_description: form.short_description || null,
      short_description_te: form.short_description_te || null,
      budget_amount: budget,
      raised_amount: raised,
      spent_amount: Number(form.spent_amount) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
      cover_image: form.cover_image || null,
      is_featured: form.is_featured,
    };

    try {
      if (editing) { await base44.entities.Project.update(editing.id, payload); toast.success('Updated'); }
      else { await base44.entities.Project.create(payload); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm(EMPTY); load();
    } catch (err) { toast.error(err.message || 'Error'); }
  };

  const edit = (item) => {
    setEditing(item);
    setForm({
      ...EMPTY,
      ...item,
      project_category_id: item.project_category_id ? String(item.project_category_id) : item.project_categories?.id ? String(item.project_categories.id) : '',
      village_id: item.village_id ? String(item.village_id) : item.villages?.id ? String(item.villages.id) : '',
      start_date: item.start_date ? item.start_date.slice(0, 10) : '',
      end_date: item.end_date ? item.end_date.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const add = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };

  const list = items.filter((i) => (filterStatus === 'all' || i.status === filterStatus) && (!search || i.project_name?.toLowerCase().includes(search.toLowerCase())));

  const sc = (s) => ({ upcoming: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100');

  const progressPct = (item) => {
    const budget = Number(item.budget_amount) || 0;
    const raised = Number(item.raised_amount) || 0;
    return budget > 0 ? Math.min(100, Math.round((raised / budget) * 100)) : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-projects text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Briefcase className="w-8 h-8" />Project Management</h1><p className="text-white/70 text-sm mt-1">{items.length} projects</p></div>
          <Button onClick={add} className="bg-white text-projects hover:bg-white/90"><Plus className="w-4 h-4 mr-2" />New Project</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-10 rounded-xl" /></div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">{['all', ...STATUSES].map((s) => <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filterStatus === s ? 'bg-projects text-white' : 'text-muted-foreground'}`}>{s}</button>)}</div>
        </div>
        {loading ? <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-projects/20 border-t-projects rounded-full animate-spin" /></div>
          : list.length === 0 ? <div className="text-center py-20"><Briefcase className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" /><p className="text-muted-foreground">No projects found.</p></div>
            : <div className="grid gap-4">{list.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap"><h3 className="font-semibold truncate">{item.project_name}</h3><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${sc(item.status)}`}>{item.status}</span><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{item.project_categories?.name || '—'}</span></div>
                  <p className="text-sm text-muted-foreground mb-3">{item.villages?.village_name || '—'}{item.villages?.states?.name ? `, ${item.villages.states.name}` : ''}</p>
                  <div className="flex items-center gap-6 text-sm flex-wrap"><span>Budget: <b>₹{(item.budget_amount || 0).toLocaleString('en-IN')}</b></span><span>Raised: <b className="text-green-600">₹{(item.raised_amount || 0).toLocaleString('en-IN')}</b></span><div className="flex-1 max-w-[200px] min-w-[120px]"><Progress value={progressPct(item)} className="h-2" /></div><span className="text-xs">{progressPct(item)}%</span></div>
                </div><div className="flex gap-1"><button type="button" onClick={() => edit(item)} className="p-2 rounded-xl hover:bg-projects/10 text-projects"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => del(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button></div></div>
              </motion.div>
            ))}</div>}
      </div>
      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} /><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing ? 'Edit' : 'New'} Project</h3><button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <BilingualInput name="project_name" label="Name" form={form} setForm={setForm} required className="col-span-2 sm:col-span-1" />
            <div><Label>Category *</Label><select value={form.project_category_id} onChange={(e) => setForm((f) => ({ ...f, project_category_id: e.target.value }))} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></div>
          </div>
          <div><Label>Village *</Label><select value={form.village_id} onChange={(e) => setForm((f) => ({ ...f, village_id: e.target.value }))} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="">Select village</option>{villages.map((v) => <option key={v.id} value={String(v.id)}>{v.village_name}</option>)}</select></div>
          <BilingualTextarea name="short_description" label="Description" form={form} setForm={setForm} rows={4} />
          <div className="grid grid-cols-3 gap-4"><div><Label>Budget ₹</Label><Input type="number" value={form.budget_amount} onChange={(e) => setForm((f) => ({ ...f, budget_amount: +e.target.value }))} className="mt-1" /></div><div><Label>Raised ₹</Label><Input type="number" value={form.raised_amount} onChange={(e) => setForm((f) => ({ ...f, raised_amount: +e.target.value }))} className="mt-1" /></div><div><Label>Spent ₹</Label><Input type="number" value={form.spent_amount} onChange={(e) => setForm((f) => ({ ...f, spent_amount: +e.target.value }))} className="mt-1" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Start</Label><Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className="mt-1" /></div><div><Label>End</Label><Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className="mt-1" /></div></div>
          <div><Label>Status</Label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))} className="mt-1" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-projects text-white"><Check className="w-4 h-4 mr-2" />{editing ? 'Update' : 'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
