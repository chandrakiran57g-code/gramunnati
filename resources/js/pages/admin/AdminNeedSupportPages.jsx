import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { needsSupportService } from '@/api/needsSupport';
import { needSupportPagesService, emptyNeedSupportPage } from '@/api/needSupportPages';
import AdminShell from '@/components/admin/AdminShell';
import { adminRoutes } from '@/lib/adminRoutes';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Layers, Loader2, Save, X } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';

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
      maxWidth="max-w-5xl"
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
        <div className="space-y-6 rounded-xl border border-border bg-white p-6">
          <BilingualRichText
            name="long_description"
            label="About / full content (use Heading 1–3, paragraphs, and bullet lists)"
            form={form}
            setForm={setForm}
          />
          <BilingualRichText name="objectives" label="Objectives" form={form} setForm={setForm} />
          <BilingualRichText name="activities" label="Activities" form={form} setForm={setForm} />
          <BilingualRichText name="impact_highlights" label="Impact highlights" form={form} setForm={setForm} />
          <GalleryImagesEditor
            value={form.gallery_images || ''}
            onChange={(v) => setForm((f) => ({ ...f, gallery_images: v }))}
          />
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
            subPath="needs-support"
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
