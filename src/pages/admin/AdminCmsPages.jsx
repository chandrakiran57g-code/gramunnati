import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { FileText, Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CMS_STATUS, isCmsPagePublic } from '@/lib/cmsStatus';
import { NAV_GROUP_OPTIONS } from '@/lib/navConfig';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { Link } from 'react-router-dom';
import { adminRoutes } from '@/lib/adminRoutes';

const EMPTY_FORM = {
  title: '',
  slug: '',
  short_description: '',
  content: '',
  status: CMS_STATUS.ACTIVE,
  display_order: 0,
  featured_image: '',
  seo_title: '',
  seo_description: '',
  nav_group: 'about_us',
};

export default function AdminCmsPages() {
  const [pages, setPages] = useState([]);
  const [navGroups, setNavGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const [allPages, groups] = await Promise.all([
        cmsService.listPages(),
        cmsService.getCmsNavGroups(),
      ]);
      setPages(allPages);
      setNavGroups(groups);
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
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
      nav_group: navGroups[page.id] || 'about_us',
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
    if (!form.title?.trim() || !form.slug?.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const { nav_group, ...pageFields } = form;
      const data = { ...pageFields, slug };

      let saved;
      if (editing) {
        saved = await cmsService.updatePage(editing.id, data);
        await cmsService.setPageNavGroup(editing.id, nav_group);
        toast.success('Page updated — live on site now');
      } else {
        saved = await cmsService.createPage(data);
        await cmsService.setPageNavGroup(saved.id, nav_group);
        toast.success('Page created — live on site now');
      }

      setEditing(null);
      setForm(EMPTY_FORM);
      notifyPlatformDataChanged({ type: 'cms_pages', id: saved?.id });
      loadPages();
    } catch (err) {
      toast.error(err.message || 'Save failed — check Supabase Auth & RLS policies');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            About Us & Content Pages
          </h1>
          <p className="text-muted-foreground mt-1">
            Create pages for the navbar — About Us dropdown, Vision, Mission, and more. Changes appear on the website immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={adminRoutes.navigation}>
            <Button variant="outline">Navigation Manager</Button>
          </Link>
          <Button onClick={handleNew} className="brand-gradient text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> New Page
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Edit Page' : 'Create New Page'}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: editing ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                }));
              }}
              placeholder="About GramUnnati"
            />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about-gramunnati" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Navbar placement</Label>
            <select
              value={form.nav_group}
              onChange={(e) => setForm({ ...form, nav_group: e.target.value })}
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white mt-1"
            >
              {NAV_GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white mt-1">
              <option value={CMS_STATUS.ACTIVE}>Active (visible on site)</option>
              <option value={CMS_STATUS.INACTIVE}>Inactive (hidden)</option>
            </select>
          </div>
          <div>
            <Label>Display order</Label>
            <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })} className="mt-1" />
          </div>
        </div>
        <div className="mb-4">
          <Label>Short description</Label>
          <Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} />
        </div>
        <div className="mb-4">
          <Label>Content (Markdown supported on public page)</Label>
          <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="font-mono text-sm" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Featured image URL</Label>
            <Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>SEO title</Label>
            <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="brand-gradient text-white border-0">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editing ? 'Update & publish' : 'Create & publish'}
          </Button>
          {editing && <Button variant="outline" onClick={handleNew}>Cancel</Button>}
          {editing && isCmsPagePublic(form.status) && (
            <a href={`/page/${form.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" type="button"><ExternalLink className="w-4 h-4 mr-1" />Preview</Button>
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {pages.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground">No pages yet. Create your first About Us page above.</div>
          ) : (
            <div className="divide-y divide-border">
              {pages.map((page) => (
                <div key={page.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${isCmsPagePublic(page.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{page.title}</div>
                      <div className="text-xs text-muted-foreground">
                        /page/{page.slug} · {NAV_GROUP_OPTIONS.find((o) => o.value === navGroups[page.id])?.label || 'About Us dropdown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(page)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(page.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
