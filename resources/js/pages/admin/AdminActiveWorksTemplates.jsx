import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activeWorkService } from '@/api/activeWork';
import AdminShell from '@/components/admin/AdminShell';
import AdminUrlField, { slugifyTitle } from '@/components/admin/AdminUrlField';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { adminRoutes } from '@/lib/adminRoutes';
import { formatActiveCategoryName, BUILT_IN_ENTITY_TEMPLATES } from '@/lib/activeWorkTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, Layers, ExternalLink } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { ensureAdminDbAccess } from '@/lib/adminDb';

const BUILT_IN_TEMPLATES = BUILT_IN_ENTITY_TEMPLATES.map((t) => ({
  ...t,
  publicSection: formatActiveCategoryName(t.name),
}));

const EMPTY_FORM = {
  name: '',
  slug: '',
  icon: '📋',
  display_order: 2,
  status: 'active',
};

export default function AdminActiveWorksTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await activeWorkService.listEntityTemplates();
      setTemplates(rows);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Template name is required');
    setSaving(true);
    try {
      await ensureAdminDbAccess();
      await activeWorkService.saveEntityTemplate({
        ...(editId ? { id: editId } : {}),
        ...form,
        slug: form.slug || slugifyTitle(form.name),
      });
      toast.success(editId ? 'Template updated' : 'Template created');
      notifyPlatformDataChanged({ type: 'active_works_templates' });
      resetForm();
      load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tpl) => {
    setEditId(tpl.id);
    setForm({
      name: tpl.name || '',
      slug: tpl.slug || '',
      icon: tpl.icon || '📋',
      display_order: tpl.display_order ?? 2,
      status: tpl.status || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (tpl) => {
    if (!confirm(`Delete template "${tpl.name}"? Cards using this template will also be removed.`)) return;
    try {
      await ensureAdminDbAccess();
      await activeWorkService.deleteEntityTemplate(tpl.id);
      toast.success('Template deleted');
      notifyPlatformDataChanged({ type: 'active_works_templates' });
      if (editId === tpl.id) resetForm();
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  return (
    <AdminShell
      title="Active Works — Templates"
      section={ADMIN_SECTIONS.active_works.label}
      description="Create entity types (like Village or School). Each template gets its own “Active …” section on the homepage."
      breadcrumbs={[{ label: 'Active Works' }, { label: 'Templates' }]}
      actions={
        <Link to={adminRoutes.activeWorksCards}>
          <Button variant="outline" size="sm"><Layers className="mr-1.5 h-4 w-4" />Cards</Button>
        </Link>
      }
    >
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-1 font-semibold">{editId ? 'Edit Template' : 'New Template'}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Example: name “Temples” → public section title “Active Temples”
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Template name *</Label>
            <Input
              className="mt-1"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: editId ? f.slug : slugifyTitle(name),
                }));
              }}
              placeholder="Temples"
            />
          </div>
          <div>
            <Label>Public section title</Label>
            <Input
              className="mt-1 bg-muted/40"
              readOnly
              value={form.name.trim() ? formatActiveCategoryName(form.name) : ''}
              placeholder="Active Temples"
            />
          </div>
          <div>
            <Label>Icon (emoji)</Label>
            <Input
              className="mt-1"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="📋"
              maxLength={4}
            />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              className="mt-1"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <AdminUrlField
              title={form.name}
              slug={(() => {
                const base = form.slug || slugifyTitle(form.name);
                return base ? `active-${base}` : '';
              })()}
              onSlugChange={(value) => {
                const base = slugifyTitle(String(value).replace(/^active-/, ''));
                setForm((f) => ({ ...f, slug: base }));
              }}
              publicBase="/active-works/category"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editId ? 'Update Template' : 'Create Template'}
          </Button>
          {editId && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Built-in templates</h3>
        <p className="text-xs text-muted-foreground mt-1">Village and School are fixed and cannot be removed.</p>
      </div>
      <div className="mb-8 space-y-2">
        {BUILT_IN_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{tpl.icon}</span>
              <div>
                <div className="font-medium">{tpl.name}</div>
                <div className="text-xs text-muted-foreground">{tpl.publicSection} · built-in</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Custom templates</h3>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          No custom templates yet. Create one above — it will appear on the homepage as “Active …”.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{tpl.icon || '📋'}</span>
                <div className="min-w-0">
                  <div className="font-medium">{tpl.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatActiveCategoryName(tpl.name)} · /active-works/category/active-{tpl.slug}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <a
                  href={`/active-works/category/active-${tpl.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(tpl)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(tpl)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
