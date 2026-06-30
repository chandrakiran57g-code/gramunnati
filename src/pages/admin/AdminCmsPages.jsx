import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { FileText, Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CMS_STATUS, isCmsPagePublic } from '@/lib/cmsStatus';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminShell from '@/components/admin/AdminShell';
import AdminUrlField, { slugifyTitle } from '@/components/admin/AdminUrlField';
import AdminImageUpload, { AdminVideoUpload } from '@/components/admin/AdminMediaUpload';
import { ADMIN_SECTIONS } from '@/lib/adminSections';

const EMPTY_FORM = {
  title: '',
  slug: '',
  short_description: '',
  content: '',
  status: CMS_STATUS.ACTIVE,
  display_order: 0,
  featured_image: '',
  video_url: '',
  seo_title: '',
  seo_description: '',
};

export default function AdminCmsPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const allPages = await cmsService.listPages();
      const groups = await cmsService.getCmsNavGroups();
      const aboutPages = allPages.filter((p) => (groups[p.id] || 'about_us') === 'about_us');
      setPages(aboutPages);
    } catch (err) {
      toast.error(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPages(); }, []);

  const handleEdit = (page) => {
    setEditing(page);
    setForm({
      title: page.title,
      slug: page.slug,
      short_description: page.short_description || '',
      content: page.content || '',
      status: page.status || CMS_STATUS.ACTIVE,
      display_order: page.display_order || 0,
      featured_image: page.featured_image || '',
      video_url: page.video_url || '',
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await cmsService.deletePage(id);
      await cmsService.removePageNavGroup(id);
      toast.success('Page deleted');
      notifyPlatformDataChanged({ type: 'cms_pages' });
      loadPages();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug?.trim() || slugifyTitle(form.title);
      const data = { ...form, slug };

      let saved;
      if (editing) {
        saved = await cmsService.updatePage(editing.id, data);
        await cmsService.setPageNavGroup(editing.id, 'about_us');
        toast.success('Page updated');
      } else {
        saved = await cmsService.createPage(data);
        await cmsService.setPageNavGroup(saved.id, 'about_us');
        toast.success('Page created — appears in About Us dropdown');
      }

      setEditing(null);
      setForm(EMPTY_FORM);
      notifyPlatformDataChanged({ type: 'cms_pages', id: saved?.id });
      loadPages();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="About Us"
      section={ADMIN_SECTIONS.about_us.label}
      description={ADMIN_SECTIONS.about_us.description}
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'About Us' }]}
      actions={
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="brand-gradient border-0 text-white">
          <Plus className="mr-2 h-4 w-4" />New Page
        </Button>
      }
    >
      <div className="mb-8 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 font-semibold">{editing ? 'Edit Page' : 'Create Page'}</h2>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: editing ? prev.slug : slugifyTitle(title),
                }));
              }}
              placeholder="Our Vision"
            />
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea className="mt-1 font-mono text-sm" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminImageUpload
              label="Featured image (optional)"
              value={form.featured_image}
              onChange={(url) => setForm({ ...form, featured_image: url })}
              subPath="cms"
            />
            <AdminVideoUpload
              label="About Us video (optional)"
              value={form.video_url}
              onChange={(url) => setForm({ ...form, video_url: url })}
            />
          </div>
          <AdminUrlField
            title={form.title}
            slug={form.slug}
            onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))}
            publicBase={ADMIN_SECTIONS.about_us.publicBase}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value={CMS_STATUS.ACTIVE}>Active (visible in About Us dropdown)</option>
                <option value={CMS_STATUS.INACTIVE}>Inactive (hidden)</option>
              </select>
            </div>
            <div>
              <Label>Order in dropdown</Label>
              <Input type="number" className="mt-1" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="brand-gradient border-0 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Update Page' : 'Create Page'}
            </Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }}>Cancel</Button>}
            {editing && isCmsPagePublic(form.status) && (
              <a href={`/page/${form.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" type="button"><ExternalLink className="mr-1 h-4 w-4" />Preview</Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {pages.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground">No About Us pages yet.</div>
          ) : (
            <div className="divide-y">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{page.title}</div>
                      <div className="text-xs text-muted-foreground">/page/{page.slug} · About Us dropdown</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(page)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(page.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
