import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Quote, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const fallbackStories = [
  { id: '1', title: 'Digital Classroom Transforms School in Kondapur', summary: 'With GramUnnati support, Government High School in Kondapur now has a state-of-the-art digital classroom, benefiting 320 students.', featured_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', village_name: 'Kondapur', is_featured: true },
  { id: '2', title: 'Water Harvest Project Saves Farming Season', summary: 'A check dam built through GramUnnati donations saved the entire kharif season for 85 families in Nalgonda.', featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', village_name: 'Nalgonda', is_featured: true },
  { id: '3', title: 'Women SHG Achieves Financial Independence', summary: '45 women in Warangal\'s Rajapet village now run their own micro-enterprises thanks to GramUnnati skill training.', featured_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80', village_name: 'Warangal', is_featured: false },
  { id: '4', title: '5,000 Trees Planted in a Single Day', summary: 'Record-breaking plantation drive across 12 villages in Chittoor district brings green cover to arid land.', featured_image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', village_name: 'Chittoor', is_featured: false },
  { id: '5', title: 'First Computer Lab in Rampur Village School', summary: '200 students experience computers for the first time. The digital divide is being bridged one school at a time.', featured_image: 'https://images.unsplash.com/photo-1509392069948-8b7b3d3d2d3c?w=600&q=80', village_name: 'Rampur', is_featured: true },
  { id: '6', title: 'Farmer Collective Doubles Income Through FPO', summary: 'GramUnnati helped 120 farmers in Kurnool form a Farmer Producer Organization, doubling their collective income.', featured_image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80', village_name: 'Kurnool', is_featured: false },
];

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SuccessStory.list('-created_date', 20)
      .then(data => setStories(data.length > 0 ? data : fallbackStories))
      .catch(() => setStories(fallbackStories))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="village-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Quote className="w-12 h-12 mx-auto mb-4 opacity-60" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Success Stories</h1>
            <p className="text-white/80 max-w-2xl mx-auto">Real transformations. Real impact. Stories of change from across rural India.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, i) => (
              <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={story.featured_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'} alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {story.is_featured && (
                    <span className="absolute top-3 left-3 bg-donation text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
                  )}
                  {story.village_name && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-village/80 text-white text-xs px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />{story.village_name}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-base mb-2 leading-tight line-clamp-2">{story.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{story.summary}</p>
                  <div className="mt-4 flex items-center gap-1 text-village font-medium text-sm group-hover:gap-2 transition-all">
                    Read Story <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}