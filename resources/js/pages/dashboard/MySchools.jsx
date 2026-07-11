import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/api/supabaseClient';
import { authService } from '@/api/auth';
import { School, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safeText } from '@/lib/safeText';
import { normalizeSchoolRecord } from '@/lib/villageDisplay';

export default function MySchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const session = await authService.getSession().catch(() => null);
      const userId = session?.user?.id;
      if (!userId) { setLoading(false); return; }
      const { data: follows } = await supabase
        .from('school_followers')
        .select('school_id')
        .eq('user_id', userId);
      const rows = follows || [];
      if (rows.length > 0) {
        const ids = rows.map((fw) => fw.school_id);
        const { data: schoolRows } = await supabase
          .from('schools')
          .select('*, villages(id, village_name, slug, states(name), districts(name))')
          .in('id', ids)
          .is('deleted_at', null);
        setSchools((schoolRows || []).map(normalizeSchoolRecord));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-school/30 border-t-school rounded-full animate-spin" />
    </div>
  );

  const infraStatus = (s) => [
    { label: 'Library', ok: s.library_available },
    { label: 'Computer Lab', ok: s.computer_lab_available },
    { label: 'Playground', ok: s.playground_available },
    { label: 'Drinking Water', ok: s.drinking_water_available },
    { label: 'Toilets', ok: s.toilet_available },
  ].filter(i => i.ok).length;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold">My Schools</h1>
            <Link to="/schools"><Button className="school-gradient text-white border-0"><School className="w-4 h-4 mr-2" />Explore Schools</Button></Link>
          </div>

          {schools.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <School className="w-16 h-16 text-school/20 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2">No Schools Followed</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Follow schools to track their development and receive updates about their progress.</p>
              <Link to="/schools"><Button variant="outline" className="border-school text-school">Browse Schools</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <Link to={`/schools/${s.slug || s.id}`} className="font-heading font-bold text-lg hover:text-school transition-colors flex items-center gap-1">
                        {s.school_name} <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">{safeText(s.village_name)}, {safeText(s.district)}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.student_count || 0} Students</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.teacher_count || 0} Teachers</span>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{infraStatus(s)}/5 Infrastructure</span>
                      </div>
                    </div>
                    <Link to={`/donate?type=school&school_id=${s.id}`}>
                      <Button size="sm" className="bg-donation/10 text-donation hover:bg-donation hover:text-white border-0">
                        <Heart className="w-3.5 h-3.5 mr-1" /> Support
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
