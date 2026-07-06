import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { supabase } from '@/api/supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import AdminShell from '@/components/admin/AdminShell';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  VOLUNTEER_SKILLS, VOLUNTEER_STATES, VOLUNTEER_AVAILABILITY, VOLUNTEER_STATUSES,
} from '@/lib/adminSections';
import { Loader2, Plus, Pencil, Search, Trash2, UserPlus } from 'lucide-react';

async function generateVolunteerCode() {
  const year = new Date().getFullYear();
  const prefix = String(year);
  const { data, error } = await supabase
    .from('volunteers')
    .select('volunteer_code')
    .like('volunteer_code', `${prefix}%`)
    .order('volunteer_code', { ascending: false })
    .limit(1);
  if (error) throw error;
  let nextSeq = 1;
  if (data?.[0]?.volunteer_code?.startsWith(prefix)) {
    const suffix = data[0].volunteer_code.slice(prefix.length);
    const num = parseInt(suffix, 10);
    if (!Number.isNaN(num)) nextSeq = num + 1;
  }
  return `${prefix}${String(nextSeq).padStart(2, '0')}`;
}

const emptyForm = () => ({
  full_name: '',
  email: '',
  mobile: '',
  state: '',
  district: '',
  occupation: '',
  availability: 'flexible',
  skills: [],
  experience: '',
  photo: '',
  program_category: '',
  status: 'active',
  age: '',
});

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = async () => {
    setLoading(true);
    const [vols, progs] = await Promise.all([
      supabase.from('volunteers').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => data || []).catch(() => []),
      cmsService.listPrograms().catch(() => []),
    ]);
    setVolunteers(vols || []);
    setPrograms(progs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = volunteers.filter((v) => {
    const q = query.toLowerCase();
    return !q || v.full_name?.toLowerCase().includes(q) || v.volunteer_code?.includes(q) || v.state?.toLowerCase().includes(q);
  });

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleSave = async () => {
    if (!form.full_name?.trim() || !form.mobile?.trim() || !form.state) {
      return toast.error('Full name, mobile, and state are required');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        is_active: form.status === 'active',
        source: 'admin',
      };
      if (editId) {
        await adminDbMutation(async () => {
          const { error } = await supabase.from('volunteers').update(payload).eq('id', editId);
          if (error) throw error;
        });
        toast.success('Volunteer updated');
      } else {
        const volunteer_code = await generateVolunteerCode();
        await adminDbMutation(async () => {
          const { error } = await supabase.from('volunteers').insert({ ...payload, volunteer_code });
          if (error) throw error;
        });
        toast.success(`Volunteer created — ID ${volunteer_code}`);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm());
      load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    setEditId(v.id);
    setForm({
      full_name: v.full_name || '',
      email: v.email || '',
      mobile: v.mobile || '',
      state: v.state || '',
      district: v.district || '',
      occupation: v.occupation || '',
      availability: v.availability || 'flexible',
      skills: v.skills || [],
      experience: v.experience || '',
      photo: v.photo || '',
      program_category: v.program_category || '',
      status: v.status || (v.is_active === false ? 'inactive' : 'active'),
      age: v.age || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (v) => {
    if (!confirm(`Delete volunteer "${v.full_name}" (${v.volunteer_code || 'no ID'})? This cannot be undone.`)) return;
    try {
      await adminDbMutation(async () => {
        const { error } = await supabase.from('volunteers').delete().eq('id', v.id);
        if (error) throw error;
      });
      toast.success('Volunteer deleted');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const statusBadge = (status) => VOLUNTEER_STATUSES.find((s) => s.value === status) || VOLUNTEER_STATUSES[0];

  return (
    <AdminShell
      title="Volunteers"
      description="Admin-only volunteer profiles. ID format: year + creation order (e.g. 202614)."
      actions={
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); }} className="brand-gradient border-0 text-white">
          <Plus className="mr-1.5 h-4 w-4" />New Volunteer
        </Button>
      }
    >
      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold">{editId ? 'Edit Volunteer' : 'Create Volunteer'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full Name *</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
            </div>
            <div>
              <AdminImageUpload label="Photo" value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} subPath="volunteers" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" className="mt-1" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input className="mt-1" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit number" maxLength={10} />
            </div>
            <div>
              <Label>State *</Label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Select State</option>
                {VOLUNTEER_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>District</Label>
              <Input className="mt-1" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Your district" />
            </div>
            <div>
              <Label>Occupation</Label>
              <Input className="mt-1" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Your profession" />
            </div>
            <div>
              <Label>Availability</Label>
              <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                {VOLUNTEER_AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Program (What We Do)</Label>
              <select value={form.program_category} onChange={(e) => setForm({ ...form, program_category: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Select program</option>
                {programs.map((p) => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                {VOLUNTEER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Skills (select all that apply)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {VOLUNTEER_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      form.skills.includes(skill) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Experience / About You</Label>
              <Textarea className="mt-1" rows={4} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'Update' : 'Create Volunteer'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: volunteers.length },
          { label: 'Active', value: volunteers.filter((v) => (v.status || 'active') === 'active').length },
          { label: 'Pending', value: volunteers.filter((v) => v.status === 'pending').length },
          { label: 'This year', value: volunteers.filter((v) => String(v.volunteer_code || '').startsWith(String(new Date().getFullYear()))).length },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-primary">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, ID, state..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Volunteer ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden sm:table-cell">Program</th>
                <th className="px-4 py-3 hidden md:table-cell">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((v) => {
                const st = statusBadge(v.status || (v.is_active === false ? 'inactive' : 'active'));
                return (
                  <tr key={v.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{v.volunteer_code || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.photo ? (
                          <img src={v.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-volunteer/10 text-xs font-bold">{v.full_name?.[0]}</div>
                        )}
                        <span className="font-medium">{v.full_name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{v.program_category || '—'}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{[v.district, v.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(v)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(v)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="py-12 text-center text-muted-foreground">
              <UserPlus className="mx-auto mb-2 h-8 w-8 opacity-40" />
              No volunteers yet. Create the first volunteer above.
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
