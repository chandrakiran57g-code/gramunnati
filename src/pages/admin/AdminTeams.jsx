import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminTeams() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', mobile: '', designation: '', description: '', photo: '', team_group_id: '', display_order: 0, is_active: true });

  const memberPayload = (f) => ({
    full_name: f.full_name,
    email: f.email || null,
    mobile: f.mobile || null,
    designation: f.designation || null,
    description: f.description || null,
    photo: f.photo || null,
    team_group_id: f.team_group_id,
    display_order: f.display_order || 0,
    is_active: f.is_active !== false,
  });

  const loadData = async () => {
    setLoading(true);
    const [grps, mems] = await Promise.all([
      base44.entities.TeamGroup.list('display_order', 50).catch(() => []),
      base44.entities.TeamMember.list('display_order', 200).catch(() => []),
    ]);
    setGroups(grps);
    const grouped = {};
    mems.forEach(m => { if (!grouped[m.team_group_id]) grouped[m.team_group_id] = []; grouped[m.team_group_id].push(m); });
    setMembers(grouped);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddMember = (group) => {
    setEditingMember(null);
    setForm({ full_name: '', email: '', mobile: '', designation: '', description: '', photo: '', team_group_id: group.id, display_order: 0, is_active: true });
    setExpandedGroup(group.id);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setForm({ full_name: member.full_name, email: member.email || '', mobile: member.mobile || '', designation: member.designation || '', description: member.description || '', photo: member.photo || '', team_group_id: member.team_group_id, display_order: member.display_order || 0, is_active: member.is_active !== false });
    setExpandedGroup(member.team_group_id);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.team_group_id) return toast.error('Name and team group required');
    setSaving(true);
    try {
      const payload = memberPayload(form);
      if (editingMember) {
        await base44.entities.TeamMember.update(editingMember.id, payload);
        toast.success('Member updated');
      } else {
        await base44.entities.TeamMember.create(payload);
        toast.success('Member added');
      }
      setEditingMember(null);
      setForm({ full_name: '', email: '', mobile: '', designation: '', description: '', photo: '', team_group_id: '', display_order: 0, is_active: true });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member?')) return;
    await base44.entities.TeamMember.delete(id);
    toast.success('Member deleted');
    loadData();
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Delete this team group and all its members?')) return;
    await base44.entities.TeamGroup.delete(id);
    toast.success('Team group deleted');
    loadData();
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" /> Teams Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage team groups and members — these appear in the Teams dropdown</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          {/* Add member form */}
          {(expandedGroup) && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Coordinator" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Photo URL</Label>
                  <Input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="brand-gradient text-white border-0">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingMember ? 'Update' : 'Add Member'}
                </Button>
                <Button variant="outline" onClick={() => { setExpandedGroup(null); setEditingMember(null); }}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Team groups */}
          {groups.map((group) => {
            const groupMembers = members[group.id] || [];
            const isExpanded = expandedGroup === group.id;
            return (
              <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                <div className="px-5 py-3 flex items-center justify-between bg-muted/20 border-b border-border">
                  <button onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                    className="flex items-center gap-3 text-left font-semibold">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {group.name}
                    <span className="text-xs text-muted-foreground font-normal">({groupMembers.length} members)</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleAddMember(group)}><UserPlus className="w-3.5 h-3.5 mr-1" /> Add</Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteGroup(group.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y divide-border">
                    {groupMembers.length === 0 ? (
                      <div className="px-5 py-6 text-center text-sm text-muted-foreground">No members yet. Click "Add" to add one.</div>
                    ) : (
                      groupMembers.map((m) => (
                        <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {m.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{m.full_name}</div>
                              <div className="text-xs text-muted-foreground">{m.designation}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditMember(m)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}