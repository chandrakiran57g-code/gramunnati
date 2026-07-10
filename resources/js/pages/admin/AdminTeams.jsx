import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { motion } from 'framer-motion';
import { Users, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import AdminShell from '@/components/admin/AdminShell';
import AdminDbSetupBanner from '@/components/admin/AdminDbSetupBanner';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { ADMIN_SECTIONS } from '@/lib/adminSections';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { validateContactFields } from '@/lib/formValidation';

const emptyGroup = () => ({ name: '', name_te: '', slug: '', description: '', description_te: '', display_order: 0, status: 'active', banner_image: '' });
const emptyMember = () => ({ full_name: '', email: '', mobile: '', designation: '', designation_te: '', description: '', description_te: '', photo: '', team_group_id: '', display_order: 0, is_active: true });

function slugify(t) {
  return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminTeams() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState(emptyGroup());
  const [form, setForm] = useState(emptyMember());
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const grps = await cmsService.listTeamGroups().catch(() => []);
    setGroups(grps);
    const grouped = {};
    grps.forEach((g) => {
      grouped[g.id] = (g.team_members || []).filter((m) => m.is_active !== false);
    });
    setMembers(grouped);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveGroup = async () => {
    if (!groupForm.name) return toast.error('Team name required');
    setSaving(true);
    try {
      const payload = { ...groupForm, slug: groupForm.slug || slugify(groupForm.name) };
      if (editingGroup) {
        await cmsService.updateTeamGroup(editingGroup.id, payload);
        toast.success('Team category updated');
      } else {
        const created = await cmsService.createTeamGroup(payload);
        toast.success('Team category created');
        setExpandedGroup(created.id);
        setForm({ ...emptyMember(), team_group_id: Number(created.id) });
      }
      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupForm(emptyGroup());
      notifyPlatformDataChanged({ type: 'team_groups' });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, name_te: group.name_te || '', slug: group.slug, description: group.description || '', description_te: group.description_te || '', display_order: group.display_order || 0, status: group.status || 'active', banner_image: group.banner_image || '' });
    setShowGroupForm(true);
  };

  const handleSaveMember = async () => {
    if (!form.full_name || !form.team_group_id) return toast.error('Name and team group required');
    const contactError = validateContactFields({ email: form.email, mobile: form.mobile });
    if (contactError) return toast.error(contactError);
    setSaving(true);
    try {
      const payload = {
        ...form,
        team_group_id: Number(form.team_group_id),
        email: form.email || null,
        mobile: form.mobile || null,
        photo: form.photo || null,
      };
      if (editingMember) {
        await cmsService.updateTeamMember(editingMember.id, payload);
        toast.success('Member updated');
      } else {
        await cmsService.createTeamMember(payload);
        toast.success('Member added');
      }
      setEditingMember(null);
      setForm(emptyMember());
      notifyPlatformDataChanged({ type: 'team_groups' });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Teams"
      section={ADMIN_SECTIONS.teams.label}
      description={ADMIN_SECTIONS.teams.description}
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'Teams' }]}
      actions={
        <Button onClick={() => { setShowGroupForm(true); setEditingGroup(null); setGroupForm(emptyGroup()); }}>
          <Plus className="w-4 h-4 mr-2" /> New Team Category
        </Button>
      }
    >

      {showGroupForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editingGroup ? 'Edit Team Category' : 'New Team Category'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <BilingualInput name="name" label="Team Name" form={groupForm} setForm={setGroupForm} required className="sm:col-span-2" />
            <div><Label>Slug</Label><Input value={groupForm.slug} onChange={(e) => setGroupForm({ ...groupForm, slug: e.target.value })} placeholder="auto-generated" className="mt-1" /></div>
            <div><Label>Display Order</Label><Input type="number" value={groupForm.display_order} onChange={(e) => setGroupForm({ ...groupForm, display_order: Number(e.target.value) })} className="mt-1" /></div>
            <BilingualRichText name="description" label="Description" form={groupForm} setForm={setGroupForm} className="sm:col-span-2" />
            <AdminImageUpload label="Banner image" value={groupForm.banner_image} onChange={(url) => setGroupForm({ ...groupForm, banner_image: url })} subPath="teams" />
            <div><Label>Status</Label>
              <select value={groupForm.status} onChange={(e) => setGroupForm({ ...groupForm, status: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveGroup} disabled={saving} className="brand-gradient text-white border-0">Save Category</Button>
            <Button variant="outline" onClick={() => { setShowGroupForm(false); setEditingGroup(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : groups.length === 0 ? (
        <>
          <AdminDbSetupBanner itemLabel="team categories" />
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No team categories yet. Click &quot;New Team Category&quot; to add one.
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {(expandedGroup || editingMember) && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <BilingualInput name="designation" label="Designation" form={form} setForm={setForm} />
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" /></div>
                <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
                <div className="sm:col-span-2">
                  <AdminImageUpload label="Member photo" value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} subPath="teams/members" />
                </div>
                <BilingualRichText name="description" label="Bio" form={form} setForm={setForm} className="sm:col-span-2" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveMember} disabled={saving} className="brand-gradient text-white border-0">{editingMember ? 'Update' : 'Add Member'}</Button>
                <Button variant="outline" onClick={() => { setExpandedGroup(null); setEditingMember(null); }}>Cancel</Button>
              </div>
            </div>
          )}

          {groups.map((group) => {
            const groupMembers = members[group.id] || [];
            const isExpanded = expandedGroup === group.id;
            return (
              <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                <div className="px-5 py-3 flex items-center justify-between bg-muted/20 border-b border-border">
                  <button type="button" onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                    className="flex items-center gap-3 text-left font-semibold">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {group.name}
                    <span className="text-xs text-muted-foreground font-normal">({groupMembers.length} members)</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditGroup(group)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setExpandedGroup(group.id); setEditingMember(null); setForm({ ...emptyMember(), team_group_id: Number(group.id) }); }}><UserPlus className="w-3.5 h-3.5 mr-1" /> Add</Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { if (confirm('Delete team category?')) { await cmsService.deleteTeamGroup(group.id); loadData(); } }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y divide-border">
                    {groupMembers.length === 0 ? (
                      <div className="px-5 py-6 text-center text-sm text-muted-foreground">No members yet.</div>
                    ) : groupMembers.map((m) => (
                      <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                            {m.photo ? <img src={m.photo} alt={m.full_name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">{m.full_name?.charAt(0)}</span>}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{m.full_name}</div>
                            <div className="text-xs text-muted-foreground">{m.designation}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingMember(m); setForm({ full_name: m.full_name, email: m.email || '', mobile: m.mobile || '', designation: m.designation || '', designation_te: m.designation_te || '', description: m.description || '', description_te: m.description_te || '', photo: m.photo || '', team_group_id: m.team_group_id, display_order: m.display_order || 0, is_active: m.is_active !== false }); setExpandedGroup(group.id); }}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => { if (confirm('Delete member?')) { await cmsService.deleteTeamMember(m.id); loadData(); } }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
