import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const CATEGORIES = ['Village Development','School Development','Tree Plantation','Water Conservation','Agriculture','Healthcare','Skill Development','Women SHG','Infrastructure','Employment Generation'];
const STATUSES = ['upcoming','active','completed','cancelled'];
const EMPTY = { project_name:'',slug:'',category:'Village Development',village_name:'',state:'',district:'',short_description:'',budget_amount:0,raised_amount:0,spent_amount:0,start_date:'',end_date:'',status:'upcoming',cover_image:'',is_featured:false,progress_percentage:0 };

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); base44.entities.Project.list('-created_date',200).then(setItems).catch(()=>[]).finally(()=>setLoading(false)); };
  const del = async(id)=>{ if(!confirm('Delete?'))return; try{await base44.entities.Project.delete(id);toast.success('Deleted');load();}catch{toast.error('Error');} };
  const save = async(e)=>{ e.preventDefault(); const d={...form,slug:form.slug||form.project_name.toLowerCase().replace(/\s+/g,'-')}; try{ if(editing){await base44.entities.Project.update(editing.id,d);toast.success('Updated');}else{await base44.entities.Project.create(d);toast.success('Created');} setShowForm(false);setEditing(null);setForm(EMPTY);load(); }catch{toast.error('Error');} };
  const edit=(i)=>{setEditing(i);setForm(i);setShowForm(true);};
  const add=()=>{setEditing(null);setForm(EMPTY);setShowForm(true);};
  const list=items.filter(i=>(filterStatus==='all'||i.status===filterStatus)&&(!search||i.project_name?.toLowerCase().includes(search.toLowerCase())));
  const sc=(s)=>({upcoming:'bg-yellow-100 text-yellow-700',active:'bg-green-100 text-green-700',completed:'bg-blue-100 text-blue-700',cancelled:'bg-red-100 text-red-700'}[s]||'bg-gray-100');

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-projects text-white py-8 px-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Briefcase className="w-8 h-8"/>Project Management</h1><p className="text-white/70 text-sm mt-1">{items.length} projects</p></div>
          <Button onClick={add} className="bg-white text-projects hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/>New Project</Button>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-10 rounded-xl"/></div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">{['all',...STATUSES].map(s=><button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filterStatus===s?'bg-projects text-white':'text-muted-foreground'}`}>{s}</button>)}</div>
        </div>
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-projects/20 border-t-projects rounded-full animate-spin"/></div>
        :list.length===0?<div className="text-center py-20"><Briefcase className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4"/><p className="text-muted-foreground">No projects found.</p></div>
        :<div className="grid gap-4">{list.map((item,i)=><motion.div key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md">
          <div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2"><h3 className="font-semibold truncate">{item.project_name}</h3><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${sc(item.status)}`}>{item.status}</span><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{item.category}</span></div>
            <p className="text-sm text-muted-foreground mb-3">{item.village_name}, {item.district}</p>
            <div className="flex items-center gap-6 text-sm"><span>Budget: <b>₹{(item.budget_amount||0).toLocaleString('en-IN')}</b></span><span>Raised: <b className="text-green-600">₹{(item.raised_amount||0).toLocaleString('en-IN')}</b></span><div className="flex-1 max-w-[200px]"><Progress value={item.progress_percentage||0} className="h-2"/></div><span className="text-xs">{item.progress_percentage||0}%</span></div>
          </div><div className="flex gap-1"><button onClick={()=>edit(item)} className="p-2 rounded-xl hover:bg-projects/10 text-projects"><Pencil className="w-4 h-4"/></button><button onClick={()=>del(item.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4"/></button></div></div>
        </motion.div>)}</div>}
      </div>
      {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowForm(false)}/><div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10"><h3 className="font-heading text-lg font-bold">{editing?'Edit':'New'} Project</h3><button onClick={()=>setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5"/></button></div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>Name *</Label><Input value={form.project_name} onChange={e=>setForm(f=>({...f,project_name:e.target.value}))} required className="mt-1"/></div><div><Label>Category</Label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div></div>
          <div className="grid grid-cols-3 gap-4"><div><Label>Village *</Label><Input value={form.village_name} onChange={e=>setForm(f=>({...f,village_name:e.target.value}))} required className="mt-1"/></div><div><Label>State *</Label><Input value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} required className="mt-1"/></div><div><Label>District</Label><Input value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))} className="mt-1"/></div></div>
          <div><Label>Description</Label><Textarea value={form.short_description} onChange={e=>setForm(f=>({...f,short_description:e.target.value}))} className="mt-1 h-20"/></div>
          <div className="grid grid-cols-3 gap-4"><div><Label>Budget ₹</Label><Input type="number" value={form.budget_amount} onChange={e=>setForm(f=>({...f,budget_amount:+e.target.value}))} className="mt-1"/></div><div><Label>Raised ₹</Label><Input type="number" value={form.raised_amount} onChange={e=>setForm(f=>({...f,raised_amount:+e.target.value}))} className="mt-1"/></div><div><Label>Progress %</Label><Input type="number" min="0" max="100" value={form.progress_percentage} onChange={e=>setForm(f=>({...f,progress_percentage:+e.target.value}))} className="mt-1"/></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Start</Label><Input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} className="mt-1"/></div><div><Label>End</Label><Input type="date" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} className="mt-1"/></div></div>
          <div><Label>Status</Label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-projects text-white"><Check className="w-4 h-4 mr-2"/>{editing?'Update':'Create'}</Button></div>
        </form>
      </div></div>}
    </div>
  );
}
