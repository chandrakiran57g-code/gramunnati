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
  VILLAGE_STAT_FIELDS,
  VILLAGE_IMPACT_FIELDS,
  SCHOOL_INFRA_FIELDS,
  SCHOOL_ACADEMIC_FIELDS,
  SCHOOL_OVERVIEW_FIELDS,
} from '@/lib/activeWorkTemplates';
import { getActiveWorkAdminTabs, getActiveWorkPreviewPath, resolveActiveWorkPageType } from '@/lib/detailPageTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Layers, Save } from 'lucide-react';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { digitsOnly } from '@/lib/formValidation';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import BeforeAfterGalleryEditor from '@/components/admin/BeforeAfterGalleryEditor';
import TimelineEditor from '@/components/admin/TimelineEditor';
import CropsEditor from '@/components/admin/CropsEditor';
import RequirementsEditor from '@/components/admin/RequirementsEditor';
import AdminDetailTabNotice from '@/components/admin/AdminDetailTabNotice';
import { normalizeBeforeAfter } from '@/lib/beforeAfterGallery';
import { BilingualInput } from '@/components/admin/BilingualField';
import RichTextEditor, { BilingualRichText } from '@/components/admin/RichTextEditor';

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
      description: page?.description || page?.overview?.about || card?.description || '',
      description_te: page?.description_te || page?.overview?.about_te || card?.description_te || '',
      _adminKey: key,
      _source: page?._source || card?._source,
      entity_id: page?.entity_id || card?.entity_id || card?.id,
      overview: { ...base.overview, ...(page?.overview || {}) },
      impact: { ...base.impact, ...(page?.impact || {}) },
      development_score: { ...base.development_score, ...(page?.development_score || {}) },
      statistics: { ...(base.statistics || {}), ...(page?.statistics || {}) },
      location: { district: '', state: '', mandal: '', pincode: '', ...(page?.location || {}) },
      infrastructure: { ...(base.infrastructure || {}), ...(page?.infrastructure || {}) },
      administration: { ...(base.administration || {}), ...(page?.administration || {}) },
      history: page?.history || '',
      history_te: page?.history_te || '',
      village_code: page?.village_code || '',
      timeline: Array.isArray(page?.timeline) ? page.timeline : [],
      crops: Array.isArray(page?.crops) ? page.crops : [],
      requirements: Array.isArray(page?.requirements) ? page.requirements : [],
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

  const pageType = resolveActiveWorkPageType(form);
  const adminTabs = getActiveWorkAdminTabs(form);
  const statFields = pageType === 'village' ? VILLAGE_STAT_FIELDS : getStatFieldsForTemplate(form.template_type);
  const developmentFields = pageType === 'village' ? VILLAGE_IMPACT_FIELDS : getImpactFieldsForTemplate(form.template_type);

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const goal = Number(form.donations?.goal) || 0;
      const raised = Number(form.donations?.raised) || 0;
      if (goal > 0 && raised > goal) {
        toast.error('Raised amount cannot exceed the donation goal');
        return;
      }
      await activeWorkService.saveAdminDetailPage({
        ...form,
        donations: { ...(form.donations || {}), goal, raised },
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

  const previewUrl = getActiveWorkPreviewPath(form);

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
                  {adminTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <BilingualRichText name="description" label="Description" form={form} setForm={setForm} />
                  {pageType === 'school' && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {SCHOOL_OVERVIEW_FIELDS.map(({ key, label }) => (
                          <div key={key}>
                            <Label>{label}</Label>
                            <Input
                              className="mt-1"
                              value={key === 'udise_code' ? (form.statistics?.udise_code ?? '') : (form.administration?.[key] ?? '')}
                              onChange={(e) => {
                                if (key === 'udise_code') setNested('statistics', 'udise_code', e.target.value);
                                else setNested('administration', key, e.target.value);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {pageType === 'program' && (
                    <p className="text-sm text-muted-foreground">
                      Program overview content. Objectives, activities, and impact each have their own tab below.
                    </p>
                  )}
                </TabsContent>

                {pageType === 'village' && (
                  <TabsContent value="location" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Shown in the Location sidebar on the public Overview tab.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>State</Label>
                        <Input className="mt-1 bg-muted" value={form.location?.state || ''} readOnly />
                        <p className="mt-1 text-xs text-muted-foreground">Edit in Villages admin geo settings.</p>
                      </div>
                      <div>
                        <Label>District</Label>
                        <Input className="mt-1 bg-muted" value={form.location?.district || ''} readOnly />
                      </div>
                      <div>
                        <Label>Mandal</Label>
                        <Input className="mt-1 bg-muted" value={form.location?.mandal || ''} readOnly />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <Input className="mt-1" value={form.location?.pincode || ''} onChange={(e) => setNested('location', 'pincode', e.target.value)} />
                      </div>
                      <div>
                        <Label>Village Code</Label>
                        <Input className="mt-1" value={form.village_code || ''} onChange={(e) => setForm((f) => ({ ...f, village_code: e.target.value }))} />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {(pageType === 'village' || pageType === 'cms_active_work') && (
                  <TabsContent value="statistics">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {statFields.map(({ key, label, type }) => (
                        <div key={key}>
                          <Label>{label}</Label>
                          <Input
                            type={type || 'text'}
                            className="mt-1"
                            value={form.statistics?.[key] ?? ''}
                            onChange={(e) => setNested('statistics', key, type === 'number' ? e.target.value : e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {pageType === 'village' && (
                  <TabsContent value="development">
                    <p className="mb-3 text-sm text-muted-foreground">Quick stats and development cards on the public page.</p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {developmentFields.map(({ key, label, type }) => (
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
                )}

                {pageType === 'village' && (
                  <TabsContent value="crops">
                    <CropsEditor
                      value={form.crops}
                      onChange={(crops) => setForm((f) => ({ ...f, crops }))}
                    />
                  </TabsContent>
                )}

                {pageType === 'school' && (
                  <>
                    <TabsContent value="infrastructure">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {SCHOOL_INFRA_FIELDS.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
                            <input
                              type="checkbox"
                              checked={!!form.infrastructure?.[key]}
                              onChange={(e) => setNested('infrastructure', key, e.target.checked)}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="academics">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {SCHOOL_ACADEMIC_FIELDS.map(({ key, label, type }) => (
                          <div key={key}>
                            <Label>{label}</Label>
                            <Input
                              type={type || 'text'}
                              className="mt-1"
                              value={form.impact?.[key] ?? ''}
                              onChange={(e) => setNested('impact', key, Number(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="requirements">
                      <RequirementsEditor
                        value={form.requirements}
                        onChange={(requirements) => setForm((f) => ({ ...f, requirements }))}
                      />
                    </TabsContent>
                  </>
                )}

                {(pageType === 'village' || pageType === 'school' || pageType === 'cms_active_work') && (
                  <TabsContent value="timeline">
                    {(pageType === 'village' || pageType === 'school' || pageType === 'cms_active_work') ? (
                      <TimelineEditor
                        value={form.timeline}
                        onChange={(timeline) => setForm((f) => ({ ...f, timeline }))}
                      />
                    ) : null}
                  </TabsContent>
                )}

                {pageType === 'program' && (
                  <>
                    <TabsContent value="objectives" className="space-y-4">
                      <RichTextEditor
                        label="Objectives"
                        value={form.program_details?.objectives || ''}
                        onChange={(html) => setProgramDetail('objectives', html)}
                      />
                    </TabsContent>
                    <TabsContent value="activities" className="space-y-4">
                      <RichTextEditor
                        label="Activities"
                        value={form.program_details?.activities || ''}
                        onChange={(html) => setProgramDetail('activities', html)}
                      />
                    </TabsContent>
                    <TabsContent value="impact" className="space-y-4">
                      <RichTextEditor
                        label="Impact highlights"
                        value={form.program_details?.impact_highlights || ''}
                        onChange={(html) => setProgramDetail('impact_highlights', html)}
                      />
                    </TabsContent>
                  </>
                )}

                <TabsContent value="gallery">
                  <p className="mb-3 text-sm text-muted-foreground">
                    {pageType === 'program'
                      ? 'Gallery images shown on the program detail page.'
                      : 'Before/after photos shown in the Gallery tab on the public detail page.'}
                  </p>
                  {(pageType === 'village' || pageType === 'school' || pageType === 'cms_active_work' || pageType === 'program') && (
                    <BeforeAfterGalleryEditor
                      value={form.gallery}
                      onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
                    />
                  )}
                </TabsContent>

                {(pageType === 'village' || pageType === 'school' || pageType === 'cms_active_work') && (
                  <TabsContent value="donations">
                    {pageType === 'village' || pageType === 'school' ? (
                      <AdminDetailTabNotice title="Donations tab">
                        Donation totals on the public page are calculated automatically from successful donations in the donations table.
                      </AdminDetailTabNotice>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Donation goal (₹)</Label><Input type="number" min="0" className="mt-1" value={form.donations?.goal ?? ''} onChange={(e) => setNested('donations', 'goal', digitsOnly(e.target.value))} /></div>
                        <div><Label>Raised amount (₹)</Label><Input type="number" min="0" className="mt-1" value={form.donations?.raised ?? ''} onChange={(e) => setNested('donations', 'raised', digitsOnly(e.target.value))} /></div>
                      </div>
                    )}
                  </TabsContent>
                )}

                {(pageType === 'village' || pageType === 'cms_active_work') && (
                  <TabsContent value="insights">
                    <AdminDetailTabNotice title="Insights tab">
                      Charts on the public Insights tab are generated automatically from village statistics. Update the Statistics and Development tabs to change what visitors see.
                    </AdminDetailTabNotice>
                  </TabsContent>
                )}
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
