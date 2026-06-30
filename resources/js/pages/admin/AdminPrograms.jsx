import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import AdminImageUpload from '@/components/admin/AdminMediaUpload';

const EMPTY = { title:'',slug:'',description:'',icon:'',cover_image:'',status:'active',sort_order:0 };

export default function AdminPrograms() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); base44.entities.Program.list('sort_order',100).then(setItems).catch(()=>[]).finally(()=>setLoading(false)); };
  const del = async(id) => { if(!confirm('Delete?'))return; try{await base44.entities.Program.delete(id);toast.success('Deleted');load();}catch{toast.error('Error');} };
  const save = async(e) => { e.preventDefault(); const d={...form,slug:form.slug||form.title.toLowerCase().replace(/\s+/g,'-')}; try{ if(editing){await base44.entities.Program.update(editing.id,d);toast.success('Updated');}else{await base44.entities.Program.create(d);toast.success('Created');} setShowForm(false);setEditing(null);setForm(EMPTY);load(); }catch{toast.error('Error');} };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-amber-500 text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><BookOpen className="w-8 h-8"/>Programs</h1><p className="text-white/70 text-sm mt-1">{items.length} programs</p></div>
          <Button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}} className="bg-white text-amber-600 hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/>Add Program</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"/></div>
        :<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item,i)=><motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">{item.icon&&<span className="text-2xl">{item.icon}</span>}<h3 className="font-semibold">{item.title}</h3></div>
              <div className="flex gap-1"><button onClick={()=>{setEditing(item);setForm(item);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><Pencil className="w-4 h-4"/></button><button onClick={()=>del(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4"/></button></div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description||'No description'}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{item.status}</span>
          </motion.div>)}
        </div>}
      </div>
      {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowForm(false)}/><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing?'Edit':'Add'} Program</h3><button onClick={()=>setShowForm(false)}><X className="w-5 h-5"/></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div><Label>Title *</Label><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required className="mt-1"/></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="auto" className="mt-1"/></div>
          <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} placeholder="🏘️" className="mt-1"/></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="mt-1 h-24"/></div>
          <AdminImageUpload label="Cover image" value={form.cover_image} onChange={(url) => setForm(f => ({...f, cover_image: url}))} subPath="programs" />
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:+e.target.value}))} className="mt-1"/></div>
            <div><Label>Status</Label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-amber-500 text-white"><Check className="w-4 h-4 mr-2"/>{editing?'Update':'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
