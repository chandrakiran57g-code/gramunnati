import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Newspaper, Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const CATEGORIES = ['All', 'Village Development', 'School Empowerment', 'Tree Plantation', 'Water Conservation', 'Healthcare', 'Volunteer Stories'];

const fallbackNews = [
  { id: '1', title: 'GramUnnati Launches Mega Tree Plantation Drive in Telangana', summary: 'Over 10,000 trees to be planted across 50 villages in Nalgonda and Warangal districts this season.', featured_image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', category: 'Tree Plantation', published_at: '2026-06-01' },
  { id: '2', title: 'Digital Classrooms Installed in 12 Government Schools', summary: 'Thanks to donor support, 12 government schools across Andhra Pradesh now have fully equipped digital classrooms.', featured_image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', category: 'School Empowerment', published_at: '2026-05-25' },
  { id: '3', title: 'Water Conservation Project Saves 85 Farming Families', summary: 'The check dam constructed in Kondapur has recharged groundwater levels and saved the kharif season for 85 families.', featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', category: 'Water Conservation', published_at: '2026-05-18' },
  { id: '4', title: 'New Volunteer Batch Completes Training Program', summary: '120 new volunteers completed their orientation and skill training program and are ready to serve rural communities.', featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', category: 'Volunteer Stories', published_at: '2026-05-10' },
  { id: '5', title: 'GramUnnati Partners with State Government for Village Development', summary: 'MoU signed with Telangana government to jointly develop 100 model villages under the joint initiative.', featured_image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', category: 'Village Development', published_at: '2026-05-03' },
  { id: '6', title: 'Mobile Health Camps Reach Remote Villages', summary: 'Free medical checkups, medicines and awareness programs conducted in 30 remote villages across Rayalaseema.', featured_image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80', category: 'Healthcare', published_at: '2026-04-28' },
];

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    base44.entities.Program.list('-created_date', 50)
      .then(data => setNews(data.length > 0 ? data : fallbackNews))
      .catch(() => setNews(fallbackNews))
      .finally(() => setLoading(false));
  }, []);

  const displayed = news.filter(n => {
    const matchCat = activeCategory === 'All' || n.category === activeCategory;
    const matchQ = !query || n.title?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="school-gradient py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-70" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Latest News</h1>
              <p className="text-white/80 max-w-xl mx-auto">Updates, announcements and stories from GramUnnati's village and school empowerment work</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search news..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === c ? 'bg-school text-white' : 'bg-white border border-border text-muted-foreground hover:border-school'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {displayed.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative rounded-3xl overflow-hidden mb-10 cursor-pointer">
            <div className="h-72 sm:h-96">
              <img src={displayed[0].featured_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80'} alt={displayed[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              {displayed[0].category && <span className="bg-school text-white text-xs px-2.5 py-1 rounded-full font-medium mb-3 inline-block">{displayed[0].category}</span>}
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">{displayed[0].title}</h2>
              <p className="text-white/80 text-sm line-clamp-2">{displayed[0].summary || displayed[0].description}</p>
              <div className="flex items-center gap-3 mt-3">
                {displayed[0].published_at && <span className="text-white/60 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{displayed[0].published_at}</span>}
                <span className="flex items-center gap-1 text-white font-medium text-sm">Read More <ArrowRight className="w-4 h-4" /></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.slice(1).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="relative h-44 overflow-hidden">
                  <img src={item.featured_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80'} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-school/80 text-white text-xs px-2 py-0.5 rounded-full">{item.category}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-sm leading-tight mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.summary || item.description}</p>
                  {item.published_at && <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Calendar className="w-3 h-3" />{item.published_at}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {displayed.length === 0 && !loading && (
          <div className="text-center py-20"><p className="text-muted-foreground">No news articles found.</p></div>
        )}
      </div>
    </div>
  );
}