import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Search, X, ArrowLeftRight, MapPin, Users, BookOpen, FolderOpen, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { safeText } from '@/lib/safeText';
import { normalizeVillageRecord } from '@/lib/villageDisplay';
import { fetchDonationTotalsByVillageIds } from '@/lib/donationTotals';

export default function Compare() {
  const [villages, setVillages] = useState([]);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);
  const [donationTotals, setDonationTotals] = useState({});
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  useEffect(() => {
    base44.entities.Village.list('-created_date', 100)
      .then((data) => setVillages((data || []).map(normalizeVillageRecord)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ids = [selected1?.id, selected2?.id].filter(Boolean);
    if (!ids.length) return;
    fetchDonationTotalsByVillageIds(ids)
      .then((totals) => setDonationTotals((prev) => ({ ...prev, ...totals })))
      .catch(() => {});
  }, [selected1?.id, selected2?.id]);

  const filtered1 = villages.filter(v => !search1 || v.village_name?.toLowerCase().includes(search1.toLowerCase())).slice(0, 6);
  const filtered2 = villages.filter(v => !search2 || v.village_name?.toLowerCase().includes(search2.toLowerCase())).slice(0, 6);

  const rows = [
    { label: 'State', key: 'state', icon: MapPin },
    { label: 'District', key: 'district', icon: MapPin },
    { label: 'Population', key: 'population', format: v => v?.toLocaleString('en-IN') || '—' },
    { label: 'Male', key: 'male_population', format: v => v?.toLocaleString('en-IN') || '—' },
    { label: 'Female', key: 'female_population', format: v => v?.toLocaleString('en-IN') || '—' },
    { label: 'Literacy Rate', key: 'literacy_rate', format: v => v ? v + '%' : '—' },
    { label: 'Farmers', key: 'farmer_count', format: v => v?.toLocaleString('en-IN') || '—' },
    { label: 'Trees Planted', key: 'trees_count', format: v => v?.toLocaleString('en-IN') || '—' },
    { label: 'Water Bodies', key: 'water_bodies_count', format: v => v || '—' },
    { label: 'Schools', key: 'schools_count', format: v => v || '—' },
    { label: 'Projects', key: 'projects_count', format: v => v || '—' },
    { label: 'Donations (₹)', key: 'total_donations', format: v => v ? '₹' + v.toLocaleString('en-IN') : '₹0' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="bg-gradient-to-r from-village to-school py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-70" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">Compare Villages</h1>
            <p className="text-white/80 max-w-xl mx-auto">Select two villages to compare their development metrics side by side</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[0, 1].map(idx => {
            const s = idx === 0 ? search1 : search2;
            const setS = idx === 0 ? setSearch1 : setSearch2;
            const sel = idx === 0 ? selected1 : selected2;
            const setSel = idx === 0 ? setSelected1 : setSelected2;
            const show = idx === 0 ? showDropdown1 : showDropdown2;
            const setShow = idx === 0 ? setShowDropdown1 : setShowDropdown2;
            const filtered = idx === 0 ? filtered1 : filtered2;

            return (
              <div key={idx} className="relative">
                <div className="text-sm font-semibold text-muted-foreground mb-2">Village {idx + 1}</div>
                {sel ? (
                  <div className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                    <div>
                      <div className="font-heading font-bold text-lg text-primary">{sel.village_name}</div>
                      <div className="text-xs text-muted-foreground">{safeText(sel.district)}, {safeText(sel.state)}</div>
                    </div>
                    <button onClick={() => { setSel(null); setS(''); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <div>
                    <Input placeholder="Search village..." value={s} onChange={e => { setS(e.target.value); setShow(true); }} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 200)} className="rounded-xl" />
                    {show && filtered.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-xl border border-border shadow-lg z-10 overflow-hidden">
                        {filtered.map(v => (
                          <button key={v.id} onClick={() => { setSel(v); setS(v.village_name); setShow(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                            <span className="font-medium">{v.village_name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{safeText(v.district)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selected1 && selected2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Metric</span>
              <span className="text-center text-primary">{selected1.village_name}</span>
              <span className="text-center text-school">{selected2.village_name}</span>
            </div>
            {rows.map((row, i) => {
              const raw1 = row.key === 'total_donations' ? (donationTotals[selected1.id] || 0) : selected1[row.key];
              const raw2 = row.key === 'total_donations' ? (donationTotals[selected2.id] || 0) : selected2[row.key];
              const v1 = row.format ? row.format(raw1) : raw1 || '—';
              const v2 = row.format ? row.format(raw2) : raw2 || '—';
              const isHigher1 = typeof raw1 === 'number' && typeof raw2 === 'number' && raw1 > raw2;
              const isHigher2 = typeof raw1 === 'number' && typeof raw2 === 'number' && raw2 > raw1;
              return (
                <div key={row.label} className="grid grid-cols-3 px-5 py-4 border-b border-border last:border-0 text-sm items-center hover:bg-muted/20">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`text-center font-medium ${isHigher1 ? 'text-primary font-bold' : ''}`}>{v1}</span>
                  <span className={`text-center font-medium ${isHigher2 ? 'text-school font-bold' : ''}`}>{v2}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}