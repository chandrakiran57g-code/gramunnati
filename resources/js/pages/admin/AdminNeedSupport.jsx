import { useState, useEffect } from 'react';
import { needsSupportService, loadProgramCategoryOptions } from '@/api/needsSupport';
import AdminShell from '@/components/admin/AdminShell';
import AdminUrlField, { slugifyTitle } from '@/components/admin/AdminUrlField';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { ensureAdminDbAccess } from '@/lib/adminDb';
import { resolveCardCover } from '@/lib/adminMedia';
import { Link } from 'react-router-dom';
import { adminRoutes } from '@/lib/adminRoutes';

const EMPTY = {
  name: '',
  name_te: '',
  slug: '',
  cover_image: '',
  description: '',
  description_te: '',
  village_name: '',
  program_category: '',
  funding_goal: '',
  raised_amount: '',
  display_order: 0,
  status: 'active',
};

export default function AdminNeedSupport() {
  const [items, setItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterCategory, setFilterCategory] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [rows, cats] = await Promise.all([
        needsSupportService.listAllAdminItems(),
        loadProgramCategoryOptions(),
      ]);
      setItems(rows);
      setCategoryOptions(cats);
    } catch {
      setItems([]);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(EMPTY);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Project title is required');
    if (!form.program_category) return toast.error('Program category is required');
    const goal = Number(form.funding_goal) || 0;
    const raised = Number(form.raised_amount) || 0;
    if (raised < 0 || goal < 0) return toast.error('Amounts cannot be negative');
    if (goal > 0 && raised > goal) return toast.error('Raised amount cannot exceed the funding goal');
    setSaving(true);
    try {
      await ensureAdminDbAccess();
      const editing = editId ? items.find((i) => (i._adminKey || i.id) === editId || i.id === editId) : null;
      const storeId = editing?.id && !String(editing.id).startsWith('project-') ? editing.id : undefined;
      await needsSupportService.saveAdminItem({
        ...(editing || {}),
        ...form,
        cover_image: resolveCardCover(form.cover_image),
        slug: form.slug || slugifyTitle(form.name),
        id: storeId,
        project_id: editing?.project_id || editing?.entity_id || null,
      });
      toast.success(editId ? 'Card updated' : 'Card created');
      notifyPlatformDataChanged({ type: 'needs_support' });
      resetForm();
      load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._adminKey || item.id);
    setForm({
      name: item.name || '',
      name_te: item.name_te || '',
      slug: item.slug || '',
      cover_image: item.cover_image || '',
      description: item.description || '',
      description_te: item.description_te || '',
      village_name: item.village_name || '',
      program_category: item.program_category || '',
      funding_goal: item.funding_goal ?? '',
      raised_amount: item.raised_amount ?? '',
      display_order: item.display_order || 0,
      status: item.status || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryLabel = (slug) => categoryOptions.find((p) => p.value === slug)?.label || slug || 'Uncategorized';
  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter((i) => i.program_category === filterCategory);

  return (
    <AdminShell
      title="Need Support — Cards"
      section="Need Support"
      description="Create cards for the homepage “Needs support now” section and /need-support. Use Detail Pages for full project content."
      breadcrumbs={[{ label: 'Need Support' }, { label: 'Cards' }]}
      actions={
        <Link to={adminRoutes.needSupportPages}>
          <Button variant="outline" size="sm">Detail Pages</Button>
        </Link>
      }
    >
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 font-semibold">{editId ? 'Edit Card' : 'New Card'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualInput
            name="name"
            label="Project title"
            form={form}
            setForm={setForm}
            required
            className="sm:col-span-2"
            onEnChange={(name) => {
              if (!editId) setForm((f) => ({ ...f, slug: slugifyTitle(name) }));
            }}
          />
          <div>
            <Label>Program category *</Label>
            <select
              value={form.program_category}
              onChange={(e) => setForm({ ...form, program_category: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="">Select program</option>
              {categoryOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.icon ? `${p.icon} ` : ''}{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Village name</Label>
            <Input className="mt-1" value={form.village_name} onChange={(e) => setForm({ ...form, village_name: e.target.value })} placeholder="Kondapur" />
          </div>
          <div className="sm:col-span-2">
            <AdminImageUpload
              label="Cover image"
              value={form.cover_image}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              subPath="needs-support"
            />
          </div>
          <div className="sm:col-span-2">
            <BilingualRichText name="description" label="Short description (card text)" form={form} setForm={setForm} />
          </div>
          <div>
            <Label>Funding goal (₹)</Label>
            <Input type="number" className="mt-1" value={form.funding_goal} onChange={(e) => setForm({ ...form, funding_goal: e.target.value })} />
          </div>
          <div>
            <Label>Raised amount (₹)</Label>
            <Input type="number" className="mt-1" value={form.raised_amount} onChange={(e) => setForm({ ...form, raised_amount: e.target.value })} />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input type="number" className="mt-1" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <AdminUrlField title={form.name} slug={form.slug} onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))} publicBase="/need-support" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editId ? 'Update Card' : 'Create Card'}
          </Button>
          {editId && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button size="sm" variant={filterCategory === 'all' ? 'default' : 'outline'} onClick={() => setFilterCategory('all')}>All</Button>
            {categoryOptions.map((p) => (
              <Button key={p.value} size="sm" variant={filterCategory === p.value ? 'default' : 'outline'} onClick={() => setFilterCategory(p.value)}>
                {p.icon ? `${p.icon} ` : ''}{p.label}
              </Button>
            ))}
          </div>
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item._adminKey || item.id} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 min-w-0">
                {item.cover_image && <img src={item.cover_image} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item._source && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {item._source}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{Number(item.raised_amount || 0).toLocaleString('en-IN')} / ₹{Number(item.funding_goal || 0).toLocaleString('en-IN')}
                    {item.village_name ? ` · ${item.village_name}` : ''}
                    {item.program_category ? ` · ${categoryLabel(item.program_category)}` : ''}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <a href={item.slug ? `/need-support/${item.slug}` : '/need-support'} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500"
                  onClick={async () => {
                    if (!confirm('Delete this card?')) return;
                    await needsSupportService.deleteAdminItem(item);
                    toast.success('Deleted');
                    notifyPlatformDataChanged({ type: 'needs_support' });
                    load();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!filteredItems.length && (
            <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
              No cards in this category yet. Create a card above.
            </div>
          )}
        </div>
        </>
      )}
    </AdminShell>
  );
}
