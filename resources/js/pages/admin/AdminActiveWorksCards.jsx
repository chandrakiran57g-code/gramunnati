import { useState, useEffect } from 'react';
import { activeWorkService } from '@/api/activeWork';
import { Link } from 'react-router-dom';
import AdminShell from '@/components/admin/AdminShell';
import AdminUrlField, { slugifyTitle } from '@/components/admin/AdminUrlField';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { adminRoutes } from '@/lib/adminRoutes';
import { buildEntityTemplateOptions } from '@/lib/activeWorkTemplates';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, ExternalLink, FileText } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { ensureAdminDbAccess } from '@/lib/adminDb';
import { resolveCardCover } from '@/lib/adminMedia';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';

const EMPTY_FORM = {
  name: '',
  name_te: '',
  slug: '',
  cover_image: '',
  description: '',
  description_te: '',
  template_type: 'village',
  status: 'active',
  display_order: 0,
  _source: 'cms',
  entity_id: null,
};

export default function AdminActiveWorksCards() {
  const [items, setItems] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [cards, entityTemplates] = await Promise.all([
        activeWorkService.listAllAdminCards(),
        activeWorkService.listEntityTemplates({ activeOnly: true }),
      ]);
      setItems(cards);
      setTemplateOptions(buildEntityTemplateOptions(entityTemplates));
    } catch {
      setItems([]);
      setTemplateOptions(buildEntityTemplateOptions([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  usePlatformRefresh(() => load());

  const resetForm = () => {
    setEditKey(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await ensureAdminDbAccess();
      const cover_image = resolveCardCover(form.cover_image);
      const editing = editKey ? items.find((i) => i._adminKey === editKey) : null;
      await activeWorkService.saveAdminCard({
        ...(editing || {}),
        ...form,
        cover_image,
        slug: form.slug || slugifyTitle(form.name),
        _source: editing?._source || 'cms',
        entity_id: editing?.entity_id || null,
      });
      toast.success(editKey ? 'Card updated' : 'Card created');
      if (!form.cover_image.trim()) {
        toast.info('Default placeholder image used. Upload or paste a URL to replace it.');
      }
      notifyPlatformDataChanged({ type: 'active_works' });
      resetForm();
      load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditKey(item._adminKey);
    setForm({
      name: item.name || '',
      name_te: item.name_te || '',
      slug: item.slug || '',
      cover_image: item.cover_image || '',
      description: item.description || '',
      description_te: item.description_te || '',
      template_type: item.template_type || 'village',
      status: item.status || 'active',
      display_order: item.display_order || 0,
      _source: item._source || 'cms',
      entity_id: item.entity_id || null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publicLink = (item) => item.link || `/active-work/${item.slug}`;

  return (
    <AdminShell
      title="Active Works — Cards"
      section={ADMIN_SECTIONS.active_works.label}
      description="Manage homepage cards. Villages and schools from the database appear here automatically."
      breadcrumbs={[{ label: 'Active Works' }, { label: 'Cards' }]}
      actions={
        <>
          <Link to={adminRoutes.activeWorksTemplates}>
            <Button variant="outline" size="sm" className="mr-2">Templates</Button>
          </Link>
          <Link to={adminRoutes.activeWorksPages}>
            <Button variant="outline" size="sm"><FileText className="mr-1.5 h-4 w-4" />Detail Pages</Button>
          </Link>
        </>
      }
    >
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 font-semibold">{editKey ? 'Edit Card' : 'New Card'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualInput
            name="name"
            label="Title"
            form={form}
            setForm={setForm}
            required
            className="sm:col-span-2"
            onEnChange={(name) => {
              if (!editKey) setForm((f) => ({ ...f, slug: slugifyTitle(name) }));
            }}
          />
          <div>
            <Label>Template</Label>
            <select
              value={form.template_type}
              onChange={(e) => setForm({ ...form, template_type: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              disabled={Boolean(editKey && form._source !== 'cms') || templateOptions.length === 0}
            >
              {templateOptions.length === 0 ? (
                <option value="">No templates — create one under Templates first</option>
              ) : (
                templateOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Lists templates from <Link to={adminRoutes.activeWorksTemplates} className="underline">Active Works → Templates</Link>.
            </p>
          </div>
          <div className="sm:col-span-2">
            <AdminImageUpload
              label="Cover image"
              value={form.cover_image}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              subPath="active-works"
            />
          </div>
          <div className="sm:col-span-2">
            <BilingualRichText name="description" label="Description" form={form} setForm={setForm} required />
          </div>
          <div>
            <Label>Sort Order</Label>
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
            <AdminUrlField
              title={form.name}
              slug={form.slug}
              onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
              publicBase={form.template_type === 'school' ? '/schools' : form.template_type === 'village' ? '/villages' : ADMIN_SECTIONS.active_works.publicBase}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editKey ? 'Update Card' : 'Create Card'}
          </Button>
          {editKey && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._adminKey || item.id} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 min-w-0">
                {item.cover_image && (
                  <img src={item.cover_image} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {item._source || 'cms'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {item.template_type || 'village'} · {publicLink(item)}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <a href={publicLink(item)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                </a>
                <Link to={`${adminRoutes.activeWorksPages}?card=${encodeURIComponent(item._adminKey || item.id)}`}>
                  <Button size="sm" variant="outline">Build Page</Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500"
                  onClick={async () => {
                    if (!confirm('Delete this card?')) return;
                    await activeWorkService.deleteAdminCard(item);
                    toast.success('Deleted');
                    notifyPlatformDataChanged({ type: 'active_works' });
                    load();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
              No cards yet. Create your first Active Works card above.
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
