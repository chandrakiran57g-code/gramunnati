import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { normalizeExternalUrl } from '@/lib/externalUrl';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import RichContent from '@/components/shared/RichContent';

const categoryColors = {
  Environment: 'bg-green-100 text-green-700', Education: 'bg-school/10 text-school', Volunteer: 'bg-volunteer/10 text-volunteer',
  Agriculture: 'bg-yellow-100 text-yellow-700', Conference: 'bg-projects/10 text-projects', Healthcare: 'bg-red-100 text-red-700', Community: 'bg-primary/10 text-primary',
};

export default function EventDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EventItem.list('-created_date', 50)
      .then(data => {
        const found = data.find(e => e.slug === slug || e.id === slug);
        setEvent(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-projects/30 border-t-projects rounded-full animate-spin" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">📅</div><h2 className="font-heading text-2xl font-bold mb-2">Event Not Found</h2><Link to="/events"><Button className="bg-projects text-white border-0">Browse Events</Button></Link></div></div>;

  const isPast = new Date(event.start_date) < new Date();
  const daysLeft = Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        <div className="relative h-48 sm:h-60 overflow-hidden">
          <img src={event.featured_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            {event.category && <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/90 ${categoryColors[event.category] || ''}`}>{event.category}</span>}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-2">{localize(event, 'title', lang) || event.title}</h1>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <Calendar className="w-5 h-5 text-projects mx-auto mb-2" />
            <div className="font-semibold text-sm">{event.start_date}</div>
            {event.end_date && <div className="text-xs text-muted-foreground">to {event.end_date}</div>}
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <MapPin className="w-5 h-5 text-projects mx-auto mb-2" />
            <div className="font-semibold text-sm">{localize(event, 'location', lang) || event.location}</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <Clock className="w-5 h-5 text-projects mx-auto mb-2" />
            {isPast ? (
              <div className="font-semibold text-sm text-muted-foreground">Event Completed</div>
            ) : (
              <div className="font-semibold text-sm text-projects">{daysLeft} days to go</div>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-heading font-bold text-lg mb-3">About This Event</h3>
          <RichContent content={localize(event, 'description', lang) || event.description || 'Event details coming soon.'} className="text-muted-foreground text-sm leading-relaxed" />
        </motion.div>

        {!isPast && (
          <div className="text-center">
            <a href={normalizeExternalUrl(event.registration_url) || '#'} target="_blank" rel="noopener noreferrer">
              <Button className="bg-projects text-white border-0 px-10 rounded-xl font-semibold"><Users className="w-4 h-4 mr-2" />Register to Attend</Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}