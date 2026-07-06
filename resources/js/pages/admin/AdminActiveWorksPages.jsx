import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { activeWorkService } from '@/api/activeWork';
import AdminShell from '@/components/admin/AdminShell';
import AdminUrlField, { slugifyTitle } from '@/components/admin/AdminUrlField';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { adminRoutes } from '@/lib/adminRoutes';
import {
  emptyActiveWorkPage,
  ACTIVE_WORK_TEMPLATE_TYPES,
  buildActiveWorkTemplateTypes,
  getImpactFieldsForTemplate,
  getStatFieldsForTemplate,
  isProgramTemplate,
  DEVELOPMENT_SCORE_FIELDS,
} from '@/lib/activeWorkTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Layers, Save } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import BeforeAfterGalleryEditor from '@/components/admin/BeforeAfterGalleryEditor';
import { normalizeBeforeAfter } from '@/lib/beforeAfterGallery';
import { BilingualInput, BilingualTextarea, BilingualNestedTextarea } from '@/components/admin/BilingualField';

export default function AdminActiveWorksPages() {
  const [searchParams] = useSearchParams();
  const preselectCard = searchParams.get('card');

  const [items, setItems] = useState([]);
  const [templateTypes, setTemplateTypes] = useState(ACTIVE_WORK_TEMPLATE_TYPES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState(preselectCard || '');
  const [form, setForm] = useState(emptyActiveWorkPage('village'));

  const load = async () => {
    setLoading(true);
    try {
      await activeWorkService.ensureCategories();
      const [cards, entityTemplates] = await Promise.all([
        activeWorkService.listAllAdminCards(),
        activeWorkService.listEntityTemplates({ activeOnly: true }),
      ]);
      setItems(cards);
      setTemplateTypes(buildActiveWorkTemplateTypes(entityTemplates));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (preselectCard && items.length) {
      selectItem(preselectCard);
    }
  }, [preselectCard, items.length]);

  const cardTemplateLabel = (item) => {
    if (item._source === 'village') return 'Village';
    if (item._source === 'school') return 'School';
    const type = item.template_type || 'village';
    const match = templateTypes.find((t) => t.id === type);
    return match?.label || type.replace(/-/g, ' ');
  };

  const selectItem = async (key) => {
    setSelectedKey(key);
    const card = items.find((i) => (i._adminKey || String(i.id)) === key);
    const page = await activeWorkService.getAdminDetailPage(key);
    const type = page?.template_type || card?.template_type || 'village';
    const base = emptyActiveWorkPage(type);
    const merged = {
      ...base,
      ...(page || {}),
      name: page?.name || card?.name || '',
      name_te: page?.name_te || card?.name_te || '',
      slug: page?.slug || card?.slug || (card?.name ? slugifyTitle(card.name) : ''),
      template_type: type,
      cover_image: page?.cover_image || card?.cover_image || '',
      description: page?.description || card?.description || '',
      _adminKey: key,
      _source: page?._source || card?._source,
      entity_id: page?.entity_id || card?.entity_id || card?.id,
      overview: { ...base.overview, ...(page?.overview || {}) },
      impact: { ...base.impact, ...(page?.impact || {}) },
      development_score: { ...base.development_score, ...(page?.development_score || {}) },
      statistics: { ...(base.statistics || {}), ...(page?.statistics || {}) },
      location: { district: '', state: '', pincode: '', ...(page?.location || {}) },
      gallery: normalizeBeforeAfter(page?.gallery),
      donations: { goal: 0, raised: 0, ...(page?.donations || {}) },
      program_details: { objectives: '', activities: '', impact_highlights: '', ...(page?.program_details || {}) },
      card: { enable_donate: true, enable_details: true, enable_follow: true, enable_compare: false, ...(page?.card || {}) },
    };
    setForm(merged);
  };

  const setNested = (key, subKey, value) => {
    setForm((f) => ({ ...f, [key]: { ...(f[key] || {}), [subKey]: value } }));
  };

  const setProgramDetail = (key, value) => {
    setForm((f) => ({ ...f, program_details: { ...(f.program_details || {}), [key]: value } }));
  };

  const impactFields = getImpactFieldsForTemplate(form.template_type);
  const statFields = getStatFieldsForTemplate(form.template_type);
  const isProgram = isProgramTemplate(form.template_type);

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await activeWorkService.saveAdminDetailPage({
        ...form,
        slug: form.slug || slugifyTitle(form.name),
        _adminKey: selectedKey,
      });
      toast.success('Detail page saved');
      notifyPlatformDataChanged({ type: 'active_works' });
      await load();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = form.link || `/active-work/${form.slug}`;

  return (
    <AdminShell
      title="Active Works — Detail Pages"
      section={ADMIN_SECTIONS.active_works.label}
      description="Build full village or school detail pages linked to homepage cards. Fields change based on template."
      breadcrumbs={[{ label: 'Active Works' }, { label: 'Detail Pages' }]}
      actions={
        <Link to={adminRoutes.activeWorksCards}>
          <Button variant="outline" size="sm"><Layers className="mr-1.5 h-4 w-4" />Cards</Button>
        </Link>
      }
      maxWidth="max-w-7xl"
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-border bg-white p-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select card to build page</Label>
          {loading ? (
            <div className="mt-3 h-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <div className="mt-2 max-h-[420px] space-y-1 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item._adminKey || item.id}
                  type="button"
                  onClick={() => selectItem(item._adminKey || item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedKey === (item._adminKey || item.id) ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-muted'
                  }`}
                >
                  {item.name}
                  <span className="ml-1 text-xs text-muted-foreground">({cardTemplateLabel(item)})</span>
                </button>
              ))}
              {!items.length && <p className="py-4 text-sm text-muted-foreground">Create a card first.</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          {!selectedKey ? (
            <p className="py-12 text-center text-muted-foreground">Select a card from the list or create one under Cards.</p>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <BilingualInput
                  name="name"
                  label="Page title"
                  form={form}
                  setForm={setForm}
                  required
                  className="sm:col-span-2"
                  onEnChange={(name) => {
                    if (!form.slug) setForm((f) => ({ ...f, slug: slugifyTitle(name) }));
                  }}
                />
                <div>
                  <Label>Template</Label>
                  <select
                    value={form.template_type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setForm((f) => {
                        const base = emptyActiveWorkPage(nextType);
                        return {
                          ...base,
                          ...f,
                          template_type: nextType,
                          overview: { ...base.overview, ...(f.overview || {}) },
                          impact: { ...base.impact, ...(f.impact || {}) },
                          development_score: { ...base.development_score, ...(f.development_score || {}) },
                          statistics: { ...(base.statistics || {}), ...(f.statistics || {}) },
                        };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <optgroup label="Entity">
                      {templateTypes.filter((t) => t.group === 'entity').map((t) => (
                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Programs (What We Do)">
                      {templateTypes.filter((t) => t.group === 'program').map((t) => (
                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <AdminImageUpload
                    label="Cover image"
                    value={form.cover_image || ''}
                    onChange={(url) => setForm({ ...form, cover_image: url })}
                    subPath="active-works"
                  />
                </div>
                <div className="sm:col-span-2">
                  <AdminUrlField
                    title={form.name}
                    slug={form.slug || ''}
                    onSlugChange={(slug) => setForm({ ...form, slug })}
                    publicBase={form._source === 'school' ? '/schools' : form._source === 'village' ? '/villages' : ADMIN_SECTIONS.active_works.publicBase}
                  />
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="mb-4 flex h-auto flex-wrap">
                  {['overview', 'impact', 'scores', 'statistics', ...(isProgram ? ['program'] : []), 'gallery', 'location', 'donations', 'settings'].map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">{t === 'program' ? 'Objectives' : t}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <BilingualTextarea name="description" label="Short description" form={form} setForm={setForm} rows={2} />
                  <BilingualNestedTextarea parent="overview" name="about" label="About" form={form} setForm={setForm} rows={3} />
                  <BilingualNestedTextarea parent="overview" name="vision" label="Vision" form={form} setForm={setForm} rows={2} />
                  <BilingualNestedTextarea parent="overview" name="challenges" label="Challenges" form={form} setForm={setForm} rows={2} />
                  <BilingualNestedTextarea parent="overview" name="achievements" label="Achievements" form={form} setForm={setForm} rows={2} />
                </TabsContent>

                <TabsContent value="impact">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {impactFields.map(({ key, label, type }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          type={type || 'text'}
                          className="mt-1"
                          value={form.impact?.[key] ?? ''}
                          onChange={(e) => setNested('impact', key, type === 'number' ? Number(e.target.value) : e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="scores">
                  <p className="mb-3 text-sm text-muted-foreground">Development score radar (0–100 each axis)</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {DEVELOPMENT_SCORE_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="mt-1"
                          value={form.development_score?.[key] ?? ''}
                          onChange={(e) => setNested('development_score', key, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="statistics">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {statFields.map(({ key, label }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input className="mt-1" value={form.statistics?.[key] ?? ''} onChange={(e) => setNested('statistics', key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {isProgram && (
                  <TabsContent value="program" className="space-y-4">
                    <div>
                      <Label>Objectives (one per line)</Label>
                      <Textarea className="mt-1" rows={4} value={form.program_details?.objectives || ''} onChange={(e) => setProgramDetail('objectives', e.target.value)} />
                    </div>
                    <div>
                      <Label>Activities (one per line)</Label>
                      <Textarea className="mt-1" rows={4} value={form.program_details?.activities || ''} onChange={(e) => setProgramDetail('activities', e.target.value)} />
                    </div>
                    <div>
                      <Label>Impact highlights (one per line)</Label>
                      <Textarea className="mt-1" rows={3} value={form.program_details?.impact_highlights || ''} onChange={(e) => setProgramDetail('impact_highlights', e.target.value)} />
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="gallery">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Upload photos to show the visual comparison of this place before and after CMSR's work.
                    They appear in the Gallery tab of the public detail page.
                  </p>
                  <BeforeAfterGalleryEditor
                    value={form.gallery}
                    onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
                  />
                </TabsContent>

                <TabsContent value="location">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div><Label>District</Label><Input className="mt-1" value={form.location?.district || ''} onChange={(e) => setNested('location', 'district', e.target.value)} /></div>
                    <div><Label>State</Label><Input className="mt-1" value={form.location?.state || ''} onChange={(e) => setNested('location', 'state', e.target.value)} /></div>
                    <div><Label>Pincode</Label><Input className="mt-1" value={form.location?.pincode || ''} onChange={(e) => setNested('location', 'pincode', e.target.value)} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="donations">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Donation goal (₹)</Label><Input type="number" className="mt-1" value={form.donations?.goal ?? ''} onChange={(e) => setNested('donations', 'goal', Number(e.target.value))} /></div>
                    <div><Label>Raised amount (₹)</Label><Input type="number" className="mt-1" value={form.donations?.raised ?? ''} onChange={(e) => setNested('donations', 'raised', Number(e.target.value))} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.card?.enable_donate !== false} onChange={(e) => setNested('card', 'enable_donate', e.target.checked)} /> Show Donate button</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.card?.enable_details !== false} onChange={(e) => setNested('card', 'enable_details', e.target.checked)} /> Show View Details</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.card?.enable_follow === true} onChange={(e) => setNested('card', 'enable_follow', e.target.checked)} /> Show Follow</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.card?.enable_compare === true} onChange={(e) => setNested('card', 'enable_compare', e.target.checked)} /> Show Compare</label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-2 border-t pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Detail Page
                </Button>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" type="button">Preview</Button>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
