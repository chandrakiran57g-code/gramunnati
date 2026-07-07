import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MapPin, Users, Heart, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safeText } from '@/lib/safeText';

export default function MyVillages() {
  const [follows, setFollows] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setLoading(false); return; }
      const f = await base44.entities.Follow.filter({ user_email: u.email, followable_type: 'village' }, '-created_date', 50).catch(() => []);
      setFollows(f);
      if (f.length > 0) {
        const ids = f.map(fw => fw.followable_id);
        const allVillages = await base44.entities.Village.list('-created_date', 200);
        setVillages(allVillages.filter(v => ids.includes(v.id)));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">My Villages</h1>
            <Link to="/villages"><Button className="brand-gradient text-white border-0"><MapPin className="w-4 h-4 mr-2" />Explore Villages</Button></Link>
          </div>

          {villages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <MapPin className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2">No Villages Followed</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Follow villages to track their development progress and receive updates directly on your dashboard.</p>
              <Link to="/villages"><Button variant="outline" className="border-primary text-primary">Browse Villages</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {villages.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <Link to={`/villages/${v.slug || v.id}`} className="font-heading font-bold text-lg hover:text-primary transition-colors flex items-center gap-1">
                        {v.village_name} <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{safeText(v.district)}, {safeText(v.state)}</span>
                        {v.population > 0 && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{v.population.toLocaleString('en-IN')}</span>}
                      </div>
                      <div className="flex gap-3 mt-3">
                        {v.total_donations > 0 && (
                          <div className="text-sm"><span className="text-donation font-semibold">₹{v.total_donations.toLocaleString('en-IN')}</span><span className="text-muted-foreground text-xs ml-1">raised</span></div>
                        )}
                        {v.projects_count > 0 && <div className="text-sm text-projects font-medium">{v.projects_count} projects</div>}
                      </div>
                    </div>
                    <Link to={`/donate?type=village&village_id=${v.id}`}>
                      <Button size="sm" className="bg-donation/10 text-donation hover:bg-donation hover:text-white border-0">
                        <Heart className="w-3.5 h-3.5 mr-1" /> Donate
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}