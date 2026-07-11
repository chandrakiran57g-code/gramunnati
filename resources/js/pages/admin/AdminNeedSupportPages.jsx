import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { needsSupportService } from '@/api/needsSupport';
import { needSupportPagesService, emptyNeedSupportPage } from '@/api/needSupportPages';
import AdminShell from '@/components/admin/AdminShell';
import { adminRoutes } from '@/lib/adminRoutes';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { PROGRAM_STYLE_TABS } from '@/lib/detailPageTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Heart, Layers, Loader2, Save, X } from 'lucide-react';
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
      <AdminImageUpload value="" onChange={addImage} subPath="needs-support/gallery" className="mt-2" />
    </div>
  );
}

export default function AdminNeedSupportPages() {
  const [cards, setCards] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(emptyNeedSupportPage());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    try {
      const rows = await needsSupportService.listAllAdminItems();
      setCards(rows || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCards(); }, []);

  const selectCard = async (slug) => {
    setSelectedSlug(slug);
    const card = cards.find((c) => c.slug === slug);
    const saved = await needSupportPagesService.getPage(slug);
    const base = emptyNeedSupportPage(slug);
    setForm({
      ...base,
      ...saved,
      card_slug: slug,
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

  const setStat = (key, value) => {
    setForm((f) => ({ ...f, stats: { ...(f.stats || {}), [key]: Number(value) || 0 } }));
  };

  const setNested = (key, subKey, value) => {
    setForm((f) => ({ ...f, [key]: { ...(f[key] || {}), [subKey]: value } }));
  };

  const handleSave = async () => {
    if (!selectedSlug) return toast.error('Select a Need Support card first');
    setSaving(true);
    try {
      await needSupportPagesService.savePage(selectedSlug, form);
      toast.success('Need Support detail page saved');
      notifyPlatformDataChanged({ type: 'need_support_pages' });
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedCard = cards.find((c) => c.slug === selectedSlug);

  return (
    <AdminShell
      title="Need Support — Detail Pages"
      section="Need Support"
      description="Build the full Learn More page for each Need Support card. Use headings and lists in the rich text editor for Vision / Mission style layout."
      breadcrumbs={[{ label: 'Need Support' }, { label: 'Detail Pages' }]}
      actions={
        <Link to={adminRoutes.needSupportCards}>
          <Button variant="outline" size="sm"><Layers className="mr-1.5 h-4 w-4" />Cards</Button>
        </Link>
      }
      maxWidth="max-w-7xl"
    >
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <Label>Select Need Support card *</Label>
        <select
          value={selectedSlug}
          onChange={(e) => {
            if (e.target.value) selectCard(e.target.value);
            else {
              setSelectedSlug('');
              setForm(emptyNeedSupportPage());
            }
          }}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Choose a card…</option>
          {cards.map((c) => (
            <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        {selectedCard && (
          <p className="mt-2 text-xs text-muted-foreground">
            Public URL: <code>/need-support/{selectedCard.slug}</code>
          </p>
        )}
      </div>

      {!selectedSlug ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Heart className="mx-auto mb-3 h-10 w-10 opacity-40" />
          Select a card above to edit its detail page content.
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
                subPath="needs-support"
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
            {selectedCard && (
              <a href={`/need-support/${selectedCard.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" type="button">Preview</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
