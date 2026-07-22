import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cmsService } from '@/api/cms';
import { Users, Mail, MapPin } from 'lucide-react';
import VolunteerRegistrationForm from '@/components/volunteer/VolunteerRegistrationForm';
import { safeText } from '@/lib/safeText';

function asSkillList(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Volunteer() {
  const [volunteers, setVolunteers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [vols, progs] = await Promise.all([
          base44.entities.Volunteer.list('-created_date', 100).catch(() => []),
          cmsService.listPrograms({ activeOnly: true }).catch(() => []),
        ]);
        if (!cancelled) {
          setVolunteers((vols || []).filter((v) => (v.status || 'active') === 'active'));
          setPrograms(progs || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full bg-gradient-to-br from-green-500 to-green-700 py-10 sm:py-12 px-4 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <Users className="mx-auto mb-4 h-12 w-12 opacity-90" />
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">Our Volunteers</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Meet dedicated volunteers driving change — or register below to join our network.
          </p>
        </div>
      </div>

      <section className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <VolunteerRegistrationForm programs={programs} />
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold">Active Volunteers</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : volunteers.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Volunteer profiles will appear here once approved by the admin team.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {volunteers.map((v, i) => {
                const skills = asSkillList(v.skills);
                return (
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
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
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
                      {skills.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{s}</span>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                      {(v.district || v.state) && (
                        <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[safeText(v.district), safeText(v.state)].filter(Boolean).join(', ')}</p>
                      )}
                      {v.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{v.email}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
