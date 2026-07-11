import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsService } from '@/api/cms';
import { programPagesService, emptyProgramPage } from '@/api/programPages';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { adminRoutes } from '@/lib/adminRoutes';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import StructuredContentEditor from '@/components/admin/StructuredContentEditor';
import { PROGRAM_STYLE_TABS } from '@/lib/detailPageTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BookOpen, Layers, Loader2, Save, X } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';

const IMPACT_STATS = [
  { key: 'villages', label: 'Villages impacted' },
  { key: 'schools', label: 'Schools impacted' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'donations', label: 'Donations raised (₹)' },
];

function galleryList(value) {
  return String(value || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Gallery images uploaded from local device; stored as newline-joined URLs. */
function GalleryImagesEditor({ value, onChange }) {
  const images = galleryList(value);

  const addImage = (url) => {
    if (!url) return;
    onChange([...images, url].join('\n'));
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx).join('\n'));
  };

  return (
    <div>
      <Label>Gallery images</Label>
      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative">
              <img src={src} alt="" className="h-24 w-36 rounded-lg border object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={() => removeImage(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <AdminImageUpload
        value=""
        onChange={addImage}
        subPath="programs/gallery"
        className="mt-2"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Upload images from your device — each upload is added to the page gallery.
      </p>
    </div>
  );
}

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
    const base = emptyProgramPage(slug);
    setForm({
      ...base,
      ...saved,
      program_slug: slug,
      content_sections: Array.isArray(saved?.content_sections) ? saved.content_sections : [],
      stats: { ...base.stats, ...(saved?.stats || {}) },
      development_score: { ...base.development_score, ...(saved?.development_score || {}) },
      statistics: { ...base.statistics, ...(saved?.statistics || {}) },
      location: { ...base.location, ...(saved?.location || {}) },
      donations: { ...base.donations, ...(saved?.donations || {}) },
      card: { ...base.card, ...(saved?.card || {}) },
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

  const setNested = (key, subKey, value) => {
    setForm((f) => ({ ...f, [key]: { ...(f[key] || {}), [subKey]: value } }));
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
      maxWidth="max-w-7xl"
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
        <div className="rounded-xl border border-border bg-white p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4 flex h-auto flex-wrap">
              {PROGRAM_STYLE_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <BilingualRichText name="long_description" label="Description" form={form} setForm={setForm} />
              <StructuredContentEditor
                form={form}
                setForm={setForm}
                titleField="content_title"
                headingField="content_heading"
                sectionsField="content_sections"
                legacyField="long_description"
                showLegacyFallback={false}
              />
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-1 text-sm font-semibold">Stats strip (above tabs on public page)</h4>
                <p className="mb-3 text-xs text-muted-foreground">These four numbers appear in the hero stats row, not inside a tab.</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {IMPACT_STATS.map(({ key, label }) => (
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
              </div>
              <AdminImageUpload
                label="Optional hero image override"
                value={form.hero_image || ''}
                onChange={(url) => setForm({ ...form, hero_image: url })}
                subPath="programs"
              />
            </TabsContent>

            <TabsContent value="objectives" className="space-y-4">
              <BilingualRichText name="objectives" label="Objectives" form={form} setForm={setForm} />
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <BilingualRichText name="activities" label="Activities" form={form} setForm={setForm} />
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <BilingualRichText name="impact_highlights" label="Impact highlights" form={form} setForm={setForm} />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryImagesEditor
                value={form.gallery_images || ''}
                onChange={(v) => setForm((f) => ({ ...f, gallery_images: v }))}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2 border-t pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Detail Page
            </Button>
            {selectedProgram && (
              <a href={`/programs/${selectedProgram.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" type="button">Preview</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
