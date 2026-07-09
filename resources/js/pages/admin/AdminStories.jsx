import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Quote, Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import AdminUrlField from '@/components/admin/AdminUrlField';

const EMPTY = { title: '', title_te: '', slug: '', summary: '', summary_te: '', content: '', content_te: '', featured_image: '', village_name: '', school_name: '', is_featured: false, status: 'published' };

// The table has no `status` column — published_at decides visibility on the public /stories page.
const storyStatus = (item) => (item.published_at ? 'published' : 'draft');

// MySQL rejects ISO strings like 2026-07-06T17:00:00.000Z — always send "YYYY-MM-DD HH:MM:SS".
const toDbDateTime = (value) => new Date(value || Date.now()).toISOString().slice(0, 19).replace('T', ' ');

export default function AdminStories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); base44.entities.SuccessStory.list('-created_date',100).then(setItems).catch(()=>[]).finally(()=>setLoading(false)); };
  const del = async(id) => { if(!confirm('Delete?'))return; try{await base44.entities.SuccessStory.delete(id);toast.success('Deleted');load();}catch{toast.error('Error');} };
  const save = async(e) => { e.preventDefault(); const d={...form,slug:form.slug||form.title.toLowerCase().replace(/\s+/g,'-'),published_at:form.status==='published'?toDbDateTime(form.published_at):null}; delete d.status; try{ if(editing){await base44.entities.SuccessStory.update(editing.id,d);toast.success('Updated');}else{await base44.entities.SuccessStory.create(d);toast.success('Created');} setShowForm(false);setEditing(null);setForm(EMPTY);load(); }catch(err){toast.error(err.message||'Error');} };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Quote className="w-8 h-8"/>Success Stories</h1><p className="text-white/70 text-sm mt-1">{items.length} stories</p></div>
          <Button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}} className="bg-white text-primary hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/>New Story</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/></div>
        :items.length===0?<div className="text-center py-20"><Quote className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4"/><p className="text-muted-foreground">No stories yet.</p></div>
        :<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((item,i)=>
          <motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md">
            {item.featured_image&&<img src={item.featured_image} alt="" className="w-full h-40 object-cover"/>}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2"><h3 className="font-semibold line-clamp-1">{item.title}</h3><div className="flex gap-1"><button onClick={()=>{setEditing(item);setForm({...item,status:storyStatus(item)});setShowForm(true);}} className="p-1 rounded hover:bg-primary/10 text-primary"><Pencil className="w-3.5 h-3.5"/></button><button onClick={()=>del(item.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></div></div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.summary||'No summary'}</p>
              <div className="flex items-center gap-2"><span className={`text-xs px-2 py-0.5 rounded-full ${storyStatus(item)==='published'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{storyStatus(item)}</span>{item.is_featured&&<span className="text-xs px-2 py-0.5 rounded-full bg-donation/10 text-donation">Featured</span>}</div>
            </div>
          </motion.div>
        )}</div>}
      </div>
      {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowForm(false)}/><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing?'Edit':'New'} Story</h3><button onClick={()=>setShowForm(false)}><X className="w-5 h-5"/></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <BilingualInput name="title" label="Title" form={form} setForm={setForm} required />
          <AdminUrlField title={form.title} slug={form.slug} onSlugChange={(slug) => setForm((f) => ({ ...f, slug }))} publicBase="/stories" />
          <BilingualRichText name="summary" label="Summary" form={form} setForm={setForm} />
          <BilingualRichText name="content" label="Content" form={form} setForm={setForm} required />
          <AdminImageUpload label="Featured image" value={form.featured_image} onChange={(url) => setForm(f => ({...f, featured_image: url}))} subPath="stories" />
          <div className="grid grid-cols-2 gap-4"><div><Label>Village</Label><Input value={form.village_name} onChange={e=>setForm(f=>({...f,village_name:e.target.value}))} className="mt-1"/></div><div><Label>School</Label><Input value={form.school_name} onChange={e=>setForm(f=>({...f,school_name:e.target.value}))} className="mt-1"/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_featured} onCheckedChange={v=>setForm(f=>({...f,is_featured:v}))}/><span className="text-sm">Featured</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" className="brand-gradient text-white border-0"><Check className="w-4 h-4 mr-2"/>{editing?'Update':'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
