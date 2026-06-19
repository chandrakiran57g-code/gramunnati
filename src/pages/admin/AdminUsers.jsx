import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Users come from Base44 auth — fetch volunteers as a proxy for registered users
    base44.entities.Volunteer.list('-created_date', 200)
      .then(setUsers).catch(() => []).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => 
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-emerald-600 text-white py-8 px-6"><div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3"><Users className="w-8 h-8"/>User Management</h1>
          <p className="text-white/70 text-sm mt-1">{users.length} registered users</p>
        </div></div>
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="pl-10 rounded-xl"/>
        </div>
        {loading?<div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"/></div>
        :filtered.length===0?<div className="text-center py-20"><Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4"/><p className="text-muted-foreground">No users found.</p></div>
        :<div className="bg-white rounded-2xl border border-border overflow-hidden"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left px-4 py-3 font-semibold">User</th>
            <th className="text-left px-4 py-3 font-semibold">Contact</th>
            <th className="text-left px-4 py-3 font-semibold">Location</th>
            <th className="text-left px-4 py-3 font-semibold">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u,i)=>(
              <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}} className="hover:bg-muted/20">
                <td className="px-4 py-3"><div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">{u.full_name?.charAt(0)||'?'}</div>
                  <div><div className="font-medium">{u.full_name||'Unknown'}</div><div className="text-xs text-muted-foreground">{u.email||'—'}</div></div>
                </div></td>
                <td className="px-4 py-3 text-muted-foreground">{u.mobile||'—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.district?`${u.district}, ${u.state}`:u.state||'—'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table></div>}
      </div>
    </div>
  );
}
