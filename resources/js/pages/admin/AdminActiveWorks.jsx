import { useState, useEffect } from 'react';
import { activeWorkService } from '@/api/activeWork';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Layers } from 'lucide-react';

const emptyCategory = () => ({ name: '', slug: '', description: '', display_order: 0, status: 'active', view_all_link: '', banner_image: '' });
const emptyItem = () => ({
  name: '', slug: '', status: 'active', featured: true, display_order: 0, category_id: '',
  cover_image: '', description: '', badge: 'Featured',
  card: { enable_donate: true, enable_details: true },
  location: {}, programs: [], impact: {}, development_score: {},
  overview: { about: '', vision: '', challenges: '', achievements: '' },
  statistics: {}, timeline: [], gallery: [], donations: {}, seo: {},
});

export default function AdminActiveWorks() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('categories');
  const [catForm, setCatForm] = useState(emptyCategory());
  const [itemForm, setItemForm] = useState(emptyItem());
  const [editCatId, setEditCatId] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const store = await activeWorkService.getStore();
    setCategories(store.categories || []);
    setItems(store.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveCategory = async () => {
    if (!catForm.name) return toast.error('Category name required');
    setSaving(true);
    try {
      await activeWorkService.saveCategory({ ...catForm, id: editCatId || undefined });
      toast.success('Category saved');
      setCatForm(emptyCategory());
      setEditCatId(null);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.category_id) return toast.error('Name and category required');
    setSaving(true);
    try {
      await activeWorkService.saveItem({ ...itemForm, id: editItemId || undefined });
      toast.success('Active work item saved');
      setItemForm(emptyItem());
      setEditItemId(null);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2"><Layers className="w-6 h-6 text-primary" /> Active Works</h1>
      <p className="text-muted-foreground mb-6">Manage homepage Active Work sections, cards, and detail pages.</p>

      <div className="flex gap-2 mb-6">
        {['categories', 'items'].map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="capitalize">{t}</Button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      ) : tab === 'categories' ? (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">{editCatId ? 'Edit Category' : 'New Category'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="auto-generated" className="mt-1" /></div>
              <div className="sm:col-span-2"><RichTextEditor label="Description" value={catForm.description} onChange={(html) => setCatForm({ ...catForm, description: html })} /></div>
              <div><Label>View All Link</Label><Input value={catForm.view_all_link} onChange={(e) => setCatForm({ ...catForm, view_all_link: e.target.value })} placeholder="/programs/women-shgs" className="mt-1" /></div>
              <div><Label>Banner Image URL</Label><Input value={catForm.banner_image} onChange={(e) => setCatForm({ ...catForm, banner_image: e.target.value })} className="mt-1" /></div>
              <div><Label>Display Order</Label><Input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Status</Label>
                <select value={catForm.status} onChange={(e) => setCatForm({ ...catForm, status: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveCategory} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save Category</Button>
              {editCatId && <Button variant="outline" onClick={() => { setEditCatId(null); setCatForm(emptyCategory()); }}>Cancel</Button>}
            </div>
          </div>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.slug} · order {c.display_order}</div></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditCatId(c.id); setCatForm({ ...emptyCategory(), ...c }); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { if (confirm('Delete category?')) { await activeWorkService.deleteCategory(c.id); load(); } }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">{editItemId ? 'Edit Item' : 'New Active Work Item'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Category *</Label>
                <select value={itemForm.category_id} onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label>Cover Image</Label><Input value={itemForm.cover_image} onChange={(e) => setItemForm({ ...itemForm, cover_image: e.target.value })} className="mt-1" /></div>
              <div><Label>Badge</Label><Input value={itemForm.badge} onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })} className="mt-1" /></div>
              <div className="sm:col-span-2"><RichTextEditor label="Description" value={itemForm.description} onChange={(html) => setItemForm({ ...itemForm, description: html })} /></div>
              <div className="sm:col-span-2"><RichTextEditor label="About (Overview)" value={itemForm.overview?.about || ''} onChange={(html) => setItemForm({ ...itemForm, overview: { ...itemForm.overview, about: html } })} /></div>
              <div><Label>Trees Planted</Label><Input type="number" value={itemForm.impact?.trees_planted || ''} onChange={(e) => setItemForm({ ...itemForm, impact: { ...itemForm.impact, trees_planted: Number(e.target.value) } })} className="mt-1" /></div>
              <div><Label>Volunteers</Label><Input type="number" value={itemForm.impact?.volunteers_count || ''} onChange={(e) => setItemForm({ ...itemForm, impact: { ...itemForm.impact, volunteers_count: Number(e.target.value) } })} className="mt-1" /></div>
              <div><Label>Education Score (0-100)</Label><Input type="number" value={itemForm.development_score?.education || ''} onChange={(e) => setItemForm({ ...itemForm, development_score: { ...itemForm.development_score, education: Number(e.target.value) } })} className="mt-1" /></div>
              <div><Label>Infrastructure Score</Label><Input type="number" value={itemForm.development_score?.infrastructure || ''} onChange={(e) => setItemForm({ ...itemForm, development_score: { ...itemForm.development_score, infrastructure: Number(e.target.value) } })} className="mt-1" /></div>
              <div><Label>Donation Goal</Label><Input type="number" value={itemForm.donations?.goal || ''} onChange={(e) => setItemForm({ ...itemForm, donations: { ...itemForm.donations, goal: Number(e.target.value) } })} className="mt-1" /></div>
              <div><Label>Raised Amount</Label><Input type="number" value={itemForm.donations?.raised || ''} onChange={(e) => setItemForm({ ...itemForm, donations: { ...itemForm.donations, raised: Number(e.target.value) } })} className="mt-1" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveItem} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save Item</Button>
              {editItemId && <Button variant="outline" onClick={() => { setEditItemId(null); setItemForm(emptyItem()); }}>Cancel</Button>}
            </div>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                <div><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.slug} · {categories.find((c) => c.id === item.category_id)?.name}</div></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditItemId(item.id); setItemForm({ ...emptyItem(), ...item }); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { if (confirm('Delete item?')) { await activeWorkService.deleteItem(item.id); load(); } }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
