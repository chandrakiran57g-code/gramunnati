import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsService } from '@/api/cms';
import { programPagesService, emptyProgramPage } from '@/api/programPages';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { adminRoutes } from '@/lib/adminRoutes';
import { BilingualInput, BilingualTextarea } from '@/components/admin/BilingualField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BookOpen, Layers, Loader2, Save } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';

export default function AdminProgramPages() {
  const [programs, setPrograms] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(emptyProgramPage());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const rows = await cmsService.listPrograms();
      setPrograms(rows || []);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrograms(); }, []);

  const selectProgram = async (slug) => {
    setSelectedSlug(slug);
    const card = programs.find((p) => p.slug === slug);
    const saved = await programPagesService.getPage(slug);
    setForm({
      ...emptyProgramPage(slug),
      ...saved,
      program_slug: slug,
      stats: { ...emptyProgramPage(slug).stats, ...(saved?.stats || {}) },
    });
    if (card && !saved?.long_description) {
      setForm((f) => ({
        ...f,
        long_description: card.description || f.long_description,
        long_description_te: card.description_te || f.long_description_te,
      }));
    }
  };

  const handleCategoryChange = (slug) => {
    if (slug) selectProgram(slug);
    else {
      setSelectedSlug('');
      setForm(emptyProgramPage());
    }
  };

  const setStat = (key, value) => {
    setForm((f) => ({ ...f, stats: { ...(f.stats || {}), [key]: Number(value) || 0 } }));
  };

  const handleSave = async () => {
    if (!selectedSlug) return toast.error('Select a program category first');
    setSaving(true);
    try {
      await programPagesService.savePage(selectedSlug, form);
      toast.success('Program detail page saved');
      notifyPlatformDataChanged({ type: 'program_pages' });
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedProgram = programs.find((p) => p.slug === selectedSlug);

  return (
    <AdminShell
      title="What We Do — Detail Pages"
      section={ADMIN_SECTIONS.programs.label}
      description="Build the full Learn More page for each program card on /programs."
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'What We Do' }, { label: 'Detail Pages' }]}
      actions={
        <Link to={adminRoutes.programs}>
          <Button variant="outline" size="sm"><Layers className="mr-1.5 h-4 w-4" />Cards</Button>
        </Link>
      }
      maxWidth="max-w-5xl"
    >
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <Label>Select program category *</Label>
        <select
          value={selectedSlug}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Choose a program card…</option>
          {programs.map((p) => (
            <option key={p.id} value={p.slug}>{p.icon ? `${p.icon} ` : ''}{p.title}</option>
          ))}
        </select>
        {selectedProgram && (
          <p className="mt-2 text-xs text-muted-foreground">
            Public URL: <code>/programs/{selectedProgram.slug}</code>
          </p>
        )}
      </div>

      {!selectedSlug ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
          Select a program card above to edit its detail page content.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-6 rounded-xl border border-border bg-white p-6">
          <BilingualTextarea name="long_description" label="About (overview)" form={form} setForm={setForm} rows={5} />
          <BilingualTextarea name="objectives" label="Objectives (one per line)" form={form} setForm={setForm} rows={4} />
          <BilingualTextarea name="activities" label="Activities (one per line)" form={form} setForm={setForm} rows={4} />
          <BilingualTextarea name="impact_highlights" label="Impact highlights (one per line)" form={form} setForm={setForm} rows={3} />
          <div>
            <Label>Gallery image URLs (one per line)</Label>
            <textarea
              value={form.gallery_images || ''}
              onChange={(e) => setForm({ ...form, gallery_images: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: 'villages', label: 'Villages impacted' },
              { key: 'schools', label: 'Schools impacted' },
              { key: 'volunteers', label: 'Volunteers' },
              { key: 'donations', label: 'Donations raised (₹)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.stats?.[key] ?? ''}
                  onChange={(e) => setStat(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <AdminImageUpload
            label="Optional hero override"
            value={form.hero_image || ''}
            onChange={(url) => setForm({ ...form, hero_image: url })}
            subPath="programs"
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Detail Page
          </Button>
        </div>
      )}
    </AdminShell>
  );
}
