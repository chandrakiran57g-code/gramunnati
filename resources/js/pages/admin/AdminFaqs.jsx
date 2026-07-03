import { useState, useEffect } from 'react';
import { cmsService } from '@/api/cms';
import { HelpCircle, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AdminShell from '@/components/admin/AdminShell';
import { BilingualInput, BilingualTextarea } from '@/components/admin/BilingualField';

const EMPTY = { question: '', question_te: '', answer: '', answer_te: '', sort_order: 0, is_active: true };

export default function AdminFaqs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await cmsService.listFaqs();
      setItems(rows || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await cmsService.deleteFaq(id);
      toast.success('FAQ deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      return toast.error('English question and answer are required');
    }
    setSaving(true);
    try {
      if (editing) {
        await cmsService.updateFaq(editing.id, form);
        toast.success('FAQ updated');
      } else {
        await cmsService.createFaq(form);
        toast.success('FAQ created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      question: item.question || '',
      question_te: item.question_te || '',
      answer: item.answer || '',
      answer_te: item.answer_te || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false,
    });
    setShowForm(true);
  };

  return (
    <AdminShell
      title="FAQs"
      section="Content"
      description="Manage frequently asked questions shown on the public FAQs page. Enter English and Telugu text — the language toggle on the site picks the matching version."
      breadcrumbs={[{ label: 'Content' }, { label: 'FAQs' }]}
      actions={
        <Button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="brand-gradient border-0 text-white">
          <Plus className="mr-2 h-4 w-4" />Add FAQ
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <HelpCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>No FAQs yet. Add questions in English and Telugu for bilingual support.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.question}</p>
                {item.question_te && <p className="mt-1 text-sm text-primary">{item.question_te}</p>}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => del(item.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} aria-hidden="true" />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h3 className="font-heading text-lg font-bold">{editing ? 'Edit' : 'Add'} FAQ</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4 p-6">
              <BilingualInput name="question" label="Question" form={form} setForm={setForm} required />
              <BilingualTextarea name="answer" label="Answer" form={form} setForm={setForm} rows={5} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: +e.target.value }))} className="mt-1" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                  <span className="text-sm">Active (visible on site)</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="brand-gradient border-0 text-white">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
