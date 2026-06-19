import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminCmsPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', short_description: '', content: '', status: 'published', display_order: 0, featured_image: '', seo_title: '', seo_description: '' });
  const [saving, setSaving] = useState(false);

  const loadPages = () => {
    setLoading(true);
    base44.entities.CmsPage.list('display_order', 100).then(setPages).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { loadPages(); }, []);

  const handleEdit = (page) => {
    setEditing(page);
    setForm({ title: page.title, slug: page.slug, short_description: page.short_description || '', content: page.content || '', status: page.status || 'published', display_order: page.display_order || 0, featured_image: page.featured_image || '', seo_title: page.seo_title || '', seo_description: page.seo_description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this page?')) return;
    await base44.entities.CmsPage.delete(id);
    toast.success('Page deleted');
    loadPages();
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return toast.error('Title and slug required');
    setSaving(true);
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const data = { ...form, slug };
    if (editing) {
      await base44.entities.CmsPage.update(editing.id, data);
      toast.success('Page updated');
    } else {
      await base44.entities.CmsPage.create(data);
      toast.success('Page created');
    }
    setEditing(null);
    setForm({ title: '', slug: '', short_description: '', content: '', status: 'published', display_order: 0, featured_image: '', seo_title: '', seo_description: '' });
    setSaving(false);
    loadPages();
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', short_description: '', content: '', status: 'published', display_order: 0, featured_image: '', seo_title: '', seo_description: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" /> CMS Pages
          </h1>
          <p className="text-muted-foreground mt-1">Manage dynamic content pages — these appear in the About Us dropdown</p>
        </div>
        <Button onClick={handleNew} className="brand-gradient text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> New Page
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Edit Page' : 'Create New Page'}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); if (!editing) setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') })); }} placeholder="Page title" />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="url-friendly-slug" />
          </div>
        </div>
        <div className="mb-4">
          <Label>Short Description</Label>
          <Textarea value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="Brief description for previews" rows={2} />
        </div>
        <div className="mb-4">
          <Label>Content (HTML/Markdown)</Label>
          <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Page content..." rows={6} className="font-mono text-sm" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Featured Image URL</Label>
            <Input value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-white">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <Label>Display Order</Label>
            <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>SEO Title</Label>
            <Input value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} placeholder="Meta title" />
          </div>
          <div>
            <Label>SEO Description</Label>
            <Input value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} placeholder="Meta description" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="brand-gradient text-white border-0">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editing ? 'Update Page' : 'Create Page'}
          </Button>
          {editing && <Button variant="outline" onClick={handleNew}>Cancel</Button>}
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {pages.length === 0 ? (
              <div className="px-5 py-12 text-center text-muted-foreground">No pages yet. Create your first CMS page above.</div>
            ) : (
              pages.map((page) => (
                <div key={page.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${page.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{page.title}</div>
                      <div className="text-xs text-muted-foreground">/{page.slug} · Order: {page.display_order}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(page)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(page.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}