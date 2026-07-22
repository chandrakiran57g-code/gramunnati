import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsService } from '@/api/cms';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { Button } from '@/components/ui/button';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { stripHtml } from '@/lib/stripHtml';

const categoryColors = {
  Environment: 'bg-green-100 text-green-700',
  Education: 'bg-school/10 text-school',
  Volunteer: 'bg-volunteer/10 text-volunteer',
  Agriculture: 'bg-yellow-100 text-yellow-700',
  Conference: 'bg-projects/10 text-projects',
  Healthcare: 'bg-red-100 text-red-700',
  general: 'bg-muted text-muted-foreground',
};

function formatEvent(item) {
  return {
    ...item,
    image: item.featured_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    start_date: item.start_date ? new Date(item.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
    category: item.category || 'general',
  };
}

export default function Events() {
  const { lang } = useLanguage();
  const [tab, setTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cmsService.listEvents({ limit: 50, upcoming: true, publishedOnly: true }),
      cmsService.listEvents({ limit: 50, upcoming: false, publishedOnly: true }),
    ])
      .then(([upRes, allRes]) => {
        const now = Date.now();
        const upcomingItems = (upRes.data || []).map(formatEvent);
        const pastItems = (allRes.data || [])
          .filter((e) => e.start_date && new Date(e.start_date).getTime() < now)
          .map(formatEvent);
        setUpcoming(upcomingItems);
        setPast(pastItems);
      })
      .catch(() => {
        setUpcoming([]);
        setPast([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const events = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="py-10 sm:py-12 px-4" style={{ background: 'linear-gradient(135deg, #7C3AED, #4f46e5)' }}>
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-70" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Events</h1>
              <p className="text-white/80 max-w-xl mx-auto">Plantation drives, inaugurations, camps, summits — join the movement for rural development</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-2 mb-8">
          {['upcoming', 'past'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${tab === t ? 'bg-projects text-white' : 'bg-white border border-border text-muted-foreground hover:border-projects'}`}>
              {t === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No {tab} events yet. Add events in the admin panel.</div>
        ) : (
          <div className="space-y-6">
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
                <div className="relative sm:w-72 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {tab === 'past' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Completed</span></div>}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${categoryColors[event.category] || categoryColors.general}`}>{event.category}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"><Calendar className="w-3 h-3" />{event.start_date}</div>
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">{localize(event, 'title', lang) || event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{stripHtml(localize(event, 'description', lang) || event.description)}</p>
                    {event.location && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{localize(event, 'location', lang) || event.location}</div>}
                  </div>
                  {tab === 'upcoming' && event.registration_link && (
                    <div className="mt-4">
                      <a href={normalizeExternalUrl(event.registration_link)} target="_blank" rel="noreferrer">
                        <Button className="bg-projects text-white border-0 rounded-xl">Register to Attend <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
