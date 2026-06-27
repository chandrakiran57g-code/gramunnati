import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const EMPTY = { title:'',slug:'',content:'',summary:'',featured_image:'',category:'general',is_published:false };

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); base44.entities.NewsItem.list('-created_date',100).then(setItems).catch(()=>[]).finally(()=>setLoading(false)); };
  const del = async(id) => { if(!confirm('Delete?'))return; try{await base44.entities.NewsItem.delete(id);toast.success('Deleted');load();}catch{toast.error('Error');} };
  const save = async(e) => { e.preventDefault(); const d={
    ...form,
    slug:form.slug||form.title.toLowerCase().replace(/\s+/g,'-'),
    published_at: form.is_published ? (form.published_at || new Date().toISOString()) : null,
  }; try{ if(editing){await base44.entities.NewsItem.update(editing.id,d);toast.success('Updated');}else{await base44.entities.NewsItem.create(d);toast.success('Created');} setShowForm(false);setEditing(null);setForm(EMPTY);load(); }catch(err){toast.error(err.message||'Error');} };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-rose-600 text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Newspaper className="w-8 h-8"/>News Management</h1><p className="text-white/70 text-sm mt-1">{items.length} articles</p></div>
          <Button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}} className="bg-white text-rose-600 hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/>New Article</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"/></div>
        :items.length===0?<div className="text-center py-20"><Newspaper className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4"/><p className="text-muted-foreground">No news articles yet.</p></div>
        :<div className="space-y-4">{items.map((item,i)=>
          <motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md flex items-start gap-5">
            {item.featured_image&&<img src={item.featured_image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0"/>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{item.is_published?'Published':'Draft'}</span>
                {item.category&&<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{item.category}</span>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.summary||item.content?.substring(0,150)||'No content'}</p>
              <p className="text-xs text-muted-foreground mt-2">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : ''}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={()=>{setEditing(item);setForm(item);setShowForm(true);}} className="p-2 rounded-xl hover:bg-rose-50 text-rose-600"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>del(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          </motion.div>
        )}</div>}
      </div>
      {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowForm(false)}/><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing?'Edit':'New'} Article</h3><button onClick={()=>setShowForm(false)}><X className="w-5 h-5"/></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div><Label>Title *</Label><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required className="mt-1"/></div>
          <div><Label>Summary</Label><Textarea value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} className="mt-1 h-20"/></div>
          <div><Label>Content *</Label><Textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} required className="mt-1 h-32"/></div>
          <div><Label>Featured Image URL</Label><Input value={form.featured_image} onChange={e=>setForm(f=>({...f,featured_image:e.target.value}))} className="mt-1"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="general">General</option><option value="village">Village</option><option value="school">School</option><option value="project">Project</option><option value="event">Event</option></select></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_published} onCheckedChange={v=>setForm(f=>({...f,is_published:v}))}/><span className="text-sm">Published</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-rose-600 text-white"><Check className="w-4 h-4 mr-2"/>{editing?'Update':'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
