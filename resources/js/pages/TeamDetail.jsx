import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, Mail, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize, useLocalizedRecord } from '@/lib/localizedContent';
import RichContent from '@/components/shared/RichContent';

export default function TeamDetail() {
  const { slug } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      base44.entities.TeamGroup.filter({ slug, status: 'active' }, undefined, 1),
      base44.entities.TeamMember.filter({ is_active: true }, 'display_order', 100)
    ]).then(([groups, allMembers]) => {
      if (groups.length > 0) {
        const g = groups[0];
        setGroup(g);
        setMembers(allMembers.filter(m => m.team_group_id === g.id));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const { lang } = useLanguage();
  const localizedGroup = useLocalizedRecord(group, ['name', 'description']);

  if (loading) return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!group) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Team Not Found</h2>
        <Link to="/teams"><Button variant="outline">Back to Teams</Button></Link>
      </div>
    </div>
  );

  const banner = group.banner_image
    ? (/^https?:\/\//i.test(group.banner_image) || group.banner_image.startsWith('/')
        ? group.banner_image
        : `/storage/${String(group.banner_image).replace(/^\/+/, '')}`)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        {banner ? (
          <section className="relative h-64 sm:h-80 overflow-hidden">
            <img src={banner} alt={localizedGroup?.name || group.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
            <div className="relative z-10 flex h-full items-end">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
                  {localizedGroup?.name || group.name}
                </motion.h1>
                {(localizedGroup?.description || group.description) && (
                  <RichContent content={localizedGroup?.description || group.description} className="text-white/80 text-lg max-w-2xl [&_.rich-content_p]:text-white/80" />
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="hero-gradient py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <Link to="/teams" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Teams
              </Link>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
                {localizedGroup?.name || group.name}
              </motion.h1>
              {(localizedGroup?.description || group.description) && (
                <RichContent content={localizedGroup?.description || group.description} className="text-white/70 text-lg max-w-2xl [&_.rich-content_p]:text-white/70" />
              )}
            </div>
          </section>
        )}
      </HeroScrollSection>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {members.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No members listed yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member, i) => (
                <motion.div key={member.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-border bg-primary/5 flex items-center justify-center flex-shrink-0">
                    {member.photo ? (
                      <img
                        src={member.photo.startsWith('http') ? member.photo : `/storage/${member.photo.replace(/^\/+/, '')}`}
                        alt={member.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement?.querySelector('.photo-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`photo-fallback text-3xl font-bold text-primary ${member.photo ? 'hidden' : ''}`}>{member.full_name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-heading font-semibold text-foreground text-lg">{member.full_name}</h3>
                    {member.designation && (
                      <p className="text-primary text-sm font-medium mt-1">{localize(member, 'designation', lang)}</p>
                    )}
                    {member.description && (
                      <RichContent content={localize(member, 'description', lang)} className="text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-3" />
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-auto pt-4 border-t border-border text-xs">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors truncate max-w-[180px]">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{member.email}</span>
                        </a>
                      )}
                      {member.mobile && (
                        <a href={`tel:${member.mobile}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {member.mobile}
                        </a>
                      )}
                    </div>
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