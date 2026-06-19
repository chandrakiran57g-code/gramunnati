import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Filter } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { Button } from '@/components/ui/button';

const upcomingEvents = [
  { id: '1', title: 'Mass Tree Plantation Drive — Nalgonda', description: 'Join thousands of volunteers for the largest tree plantation drive of the year across all Nalgonda mandals.', location: 'Nalgonda District, Telangana', start_date: '2026-07-15', category: 'Environment', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', type: 'upcoming' },
  { id: '2', title: 'Digital Classroom Inauguration — Kondapur School', description: 'Grand inauguration of the new digital classroom funded by GramUnnati donors. All stakeholders are invited.', location: 'Kondapur Village, Medak District', start_date: '2026-07-20', category: 'Education', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', type: 'upcoming' },
  { id: '3', title: 'Volunteer Orientation Camp — Hyderabad', description: 'Two-day orientation camp for new volunteers. Learn about the GramUnnati platform, project management, and community engagement.', location: 'Hyderabad, Telangana', start_date: '2026-07-28', category: 'Volunteer', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', type: 'upcoming' },
  { id: '4', title: 'Farmers Producer Organization Launch', description: 'Launch ceremony for the Kurnool FPO bringing 200+ farmers together for collective marketing and support.', location: 'Kurnool, Andhra Pradesh', start_date: '2026-08-05', category: 'Agriculture', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80', type: 'upcoming' },
  { id: '5', title: 'Annual GramUnnati Impact Summit 2026', description: 'Annual gathering of all stakeholders — donors, volunteers, village reps, and partners. Celebrating achievements and planning the year ahead.', location: 'Hyderabad Convention Center', start_date: '2026-09-01', category: 'Conference', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', type: 'upcoming' },
];

const pastEvents = [
  { id: '6', title: 'Health Camp — Warangal Villages', description: 'Free medical checkups for 2,000+ villagers in 15 remote villages.', location: 'Warangal, Telangana', start_date: '2026-05-10', category: 'Healthcare', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', type: 'past' },
  { id: '7', title: 'School Furniture Distribution Drive', description: 'Distribution of desks, chairs, and blackboards to 8 government schools in Nalgonda.', location: 'Nalgonda, Telangana', start_date: '2026-04-20', category: 'Education', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', type: 'past' },
];

const categoryColors = {
  Environment: 'bg-green-100 text-green-700',
  Education: 'bg-school/10 text-school',
  Volunteer: 'bg-volunteer/10 text-volunteer',
  Agriculture: 'bg-yellow-100 text-yellow-700',
  Conference: 'bg-projects/10 text-projects',
  Healthcare: 'bg-red-100 text-red-700',
};

export default function Events() {
  const [tab, setTab] = useState('upcoming');

  const events = tab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #7C3AED, #4f46e5)' }}>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['upcoming', 'past'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${tab === t ? 'bg-projects text-white' : 'bg-white border border-border text-muted-foreground hover:border-projects'}`}>
              {t === 'upcoming' ? '🗓️ Upcoming Events' : '📋 Past Events'}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
              <div className="relative sm:w-72 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                {tab === 'past' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Completed</span></div>}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[event.category] || 'bg-muted text-muted-foreground'}`}>{event.category}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{event.start_date}</div>
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{event.location}</div>
                </div>
                {tab === 'upcoming' && (
                  <div className="mt-4">
                    <Button className="bg-projects text-white border-0 rounded-xl">
                      Register to Attend <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}