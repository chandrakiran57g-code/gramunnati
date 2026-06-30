import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, Mail, MapPin } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

/** Public volunteers page — profiles created by admin only (no self-signup). */
export default function Volunteer() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Volunteer.list('-created_date', 100)
      .then((rows) => setVolunteers((rows || []).filter((v) => (v.status || 'active') === 'active')))
      .catch(() => setVolunteers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }} className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-80" />
            <h1 className="font-heading text-4xl font-bold sm:text-5xl">Our Volunteers</h1>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Meet the dedicated volunteers driving change across villages and schools in rural India.
            </p>
          </div>
        </div>
      </HeroScrollSection>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : volunteers.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Volunteer profiles will appear here once added by the admin team.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {volunteers.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-4">
                    {v.photo ? (
                      <img src={v.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-volunteer/10 text-xl font-bold text-volunteer">
                        {v.full_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading font-bold">{v.full_name}</h3>
                      {v.volunteer_code && (
                        <p className="font-mono text-xs text-muted-foreground">ID {v.volunteer_code}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{v.occupation || v.program_category || 'Volunteer'}</p>
                    </div>
                  </div>
                  {v.experience && <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{v.experience}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {(v.skills || []).slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-volunteer/10 px-2 py-0.5 text-xs text-volunteer">{s}</span>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                    {(v.district || v.state) && (
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[v.district, v.state].filter(Boolean).join(', ')}</p>
                    )}
                    {v.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{v.email}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
