import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2, X, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { BilingualInput } from '@/components/admin/BilingualField';
import { BilingualRichText } from '@/components/admin/RichTextEditor';
import { isValidUrl } from '@/lib/formValidation';

const EMPTY = { title:'',title_te:'',slug:'',description:'',description_te:'',location:'',location_te:'',start_date:'',end_date:'',featured_image:'',is_published:false,registration_link:'' };

export default function AdminEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); base44.entities.EventItem.list('-created_date',100).then(setItems).catch(()=>[]).finally(()=>setLoading(false)); };
  const del = async(id) => { if(!confirm('Delete?'))return; try{await base44.entities.EventItem.delete(id);toast.success('Deleted');load();}catch{toast.error('Error');} };
  const save = async(e) => {
    e.preventDefault();
    if (!form.title?.trim()) return toast.error('Title is required');
    if (!form.start_date) return toast.error('Start date is required');
    if (form.registration_link?.trim() && !isValidUrl(form.registration_link)) {
      return toast.error('Enter a valid registration link URL');
    }
    const d={...form,slug:form.slug||form.title.toLowerCase().replace(/\s+/g,'-')};
    try{ if(editing){await base44.entities.EventItem.update(editing.id,d);toast.success('Updated');}else{await base44.entities.EventItem.create(d);toast.success('Created');} setShowForm(false);setEditing(null);setForm(EMPTY);load(); }catch{toast.error('Error');}
  };

  const upcoming = items.filter(i => new Date(i.start_date) >= new Date());
  const past = items.filter(i => new Date(i.start_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-cyan-600 text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Calendar className="w-8 h-8"/>Events Management</h1><p className="text-white/70 text-sm mt-1">{items.length} events · {upcoming.length} upcoming</p></div>
          <Button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}} className="bg-white text-cyan-600 hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/>New Event</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"/></div>
        :items.length===0?<div className="text-center py-20"><Calendar className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4"/><p className="text-muted-foreground">No events yet.</p></div>
        :<div className="space-y-4">{items.map((item,i)=>
          <motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md flex items-start gap-5">
            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-cyan-100">
              <span className="text-xs text-cyan-600 font-semibold">{item.start_date?new Date(item.start_date).toLocaleDateString('en-IN',{month:'short'}):'TBD'}</span>
              <span className="text-xl font-bold text-cyan-700">{item.start_date?new Date(item.start_date).getDate():'—'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{item.is_published?'Published':'Draft'}</span>
                {new Date(item.start_date)>=new Date()&&<span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">Upcoming</span>}
              </div>
              {item.location&&<p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/>{item.location}</p>}
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.description||'No description'}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={()=>{setEditing(item);setForm(item);setShowForm(true);}} className="p-2 rounded-xl hover:bg-cyan-50 text-cyan-600"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>del(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          </motion.div>
        )}</div>}
      </div>
      {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowForm(false)}/><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing?'Edit':'New'} Event</h3><button onClick={()=>setShowForm(false)}><X className="w-5 h-5"/></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <BilingualInput name="title" label="Title" form={form} setForm={setForm} required />
          <BilingualRichText name="description" label="Description" form={form} setForm={setForm} />
          <BilingualInput name="location" label="Location" form={form} setForm={setForm} />
          <div className="grid grid-cols-2 gap-4"><div><Label>Start Date *</Label><Input type="datetime-local" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} required className="mt-1"/></div><div><Label>End Date</Label><Input type="datetime-local" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} className="mt-1"/></div></div>
          <div><Label>Featured Image URL</Label><Input value={form.featured_image} onChange={e=>setForm(f=>({...f,featured_image:e.target.value}))} className="mt-1"/></div>
          <div><Label>Registration Link</Label><Input value={form.registration_link} onChange={e=>setForm(f=>({...f,registration_link:e.target.value}))} className="mt-1"/></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={v=>setForm(f=>({...f,is_published:v}))}/><span className="text-sm">Published</span></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-cyan-600 text-white"><Check className="w-4 h-4 mr-2"/>{editing?'Update':'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
