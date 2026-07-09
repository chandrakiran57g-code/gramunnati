import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { BookOpen, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AdminShell from '@/components/admin/AdminShell';
import AdminDbSetupBanner from '@/components/admin/AdminDbSetupBanner';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import AdminUrlField from '@/components/admin/AdminUrlField';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { clearProgramCategoryCache } from '@/lib/programCategoryOptions';
import { Link } from 'react-router-dom';
import { adminRoutes } from '@/lib/adminRoutes';

const EMPTY = { title: '', title_te: '', slug: '', description: '', description_te: '', icon: '', cover_image: '', status: 'active', sort_order: 0 };

export default function AdminPrograms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await cmsService.listPrograms();
      setItems(rows || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await cmsService.deleteProgram(id);
      toast.success('Program deleted');
      clearProgramCategoryCache();
      notifyPlatformDataChanged({ type: 'programs' });
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
    };
    setSaving(true);
    try {
      if (editing) {
        await cmsService.updateProgram(editing.id, data);
        toast.success('Program updated');
      } else {
        await cmsService.createProgram(data);
        toast.success('Program created — appears in What We Do dropdown');
      }
      clearProgramCategoryCache();
      notifyPlatformDataChanged({ type: 'programs' });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="What We Do — Cards"
      section={ADMIN_SECTIONS.programs.label}
      description="Program cards shown on the public What We Do page. Use Detail Pages to build Learn More content."
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'What We Do' }, { label: 'Cards' }]}
      actions={
        <div className="flex gap-2">
          <Link to={adminRoutes.programPages}>
            <Button variant="outline" size="sm">Detail Pages</Button>
          </Link>
          <Button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="brand-gradient border-0 text-white">
            <Plus className="mr-2 h-4 w-4" />Add Program Card
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <>
          <AdminDbSetupBanner itemLabel="programs" />
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>No programs yet. Add programs to populate the &quot;What We Do&quot; navbar dropdown.</p>
        </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setEditing(item); setForm(item); setShowForm(true); }} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => del(item.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{item.description || 'No description'}</p>
              <code className="text-xs text-muted-foreground">/programs/{item.slug}</code>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} aria-hidden="true" />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h3 className="font-heading text-lg font-bold">{editing ? 'Edit' : 'Add'} Program Card</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4 p-6">
              <BilingualInput name="title" label="Title" form={form} setForm={setForm} required />
              <AdminUrlField
                title={form.title}
                slug={form.slug}
                onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
                publicBase="/programs"
              />
              <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🏘️" className="mt-1" /></div>
              <BilingualRichText name="description" label="Description" form={form} setForm={setForm} />
              <AdminImageUpload label="Cover image" value={form.cover_image} onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))} subPath="programs" />
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: +e.target.value }))} className="mt-1" /></div>
                <div><Label>Status</Label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="brand-gradient border-0 text-white">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
