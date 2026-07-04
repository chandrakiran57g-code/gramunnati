import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { FolderOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminProjectCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.listProjectCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminService.upsertProjectCategory({ name: name.trim(), name_te: nameTe.trim() || null, slug: name.trim().toLowerCase().replace(/\s+/g, '-') });
      setName('');
      setNameTe('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await adminService.deleteProjectCategory(id);
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Project Categories" subtitle="Organize projects by type" gradient="bg-projects text-white" />
      </HeroScrollSection>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name (English)" className="rounded-xl flex-1" />
          <Input value={nameTe} onChange={(e) => setNameTe(e.target.value)} placeholder="వర్గం పేరు (తెలుగు)" className="rounded-xl flex-1 font-[system-ui]" />
          <Button type="submit" disabled={saving} className="rounded-xl"><Plus className="w-4 h-4 mr-1" />Add</Button>
        </form>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />No categories yet</div>
          ) : (
            <ul className="divide-y">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.slug}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
