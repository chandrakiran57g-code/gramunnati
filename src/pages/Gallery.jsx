import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Play, Image, Video } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const galleryItems = [
  { id: 1, category: 'Villages', type: 'image', title: 'Kondapur Village Development', src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', location: 'Telangana' },
  { id: 2, category: 'Schools', type: 'image', title: 'New School Building', src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', location: 'Andhra Pradesh' },
  { id: 3, category: 'Projects', type: 'image', title: 'Tree Plantation Drive', src: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', location: 'Karnataka' },
  { id: 4, category: 'Villages', type: 'image', title: 'Water Conservation Project', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', location: 'Maharashtra' },
  { id: 5, category: 'Schools', type: 'image', title: 'Digital Classroom Setup', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', location: 'Tamil Nadu' },
  { id: 6, category: 'Events', type: 'image', title: 'Volunteer Training Camp', src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', location: 'Delhi' },
  { id: 7, category: 'Projects', type: 'image', title: 'Agriculture Development', src: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80', location: 'Punjab' },
  { id: 8, category: 'Villages', type: 'image', title: 'Community Meeting', src: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80', location: 'UP' },
  { id: 9, category: 'Events', type: 'image', title: 'Annual Review Meet', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', location: 'Hyderabad' },
  { id: 10, category: 'Schools', type: 'image', title: 'Library Books Donation', src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', location: 'West Bengal' },
  { id: 11, category: 'Projects', type: 'image', title: 'Women SHG Workshop', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', location: 'Odisha' },
  { id: 12, category: 'Villages', type: 'image', title: 'Solar Power Installation', src: 'https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80', location: 'Rajasthan' },
];

const CATEGORIES = ['All', 'Villages', 'Schools', 'Projects', 'Events'];
const TABS = ['Photos', 'Videos'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Photos');
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeCategory === 'All' ? galleryItems : galleryItems.filter(i => i.category === activeCategory);

  const videoItems = [
    { id: 'v1', title: 'GramUnnati Village Transformation Journey', embedId: 'dQw4w9WgXcQ', category: 'Villages', location: 'Telangana' },
    { id: 'v2', title: 'Digital Classroom Success Story', embedId: 'dQw4w9WgXcQ', category: 'Schools', location: 'Andhra Pradesh' },
    { id: 'v3', title: 'Mega Tree Plantation Drive 2026', embedId: 'dQw4w9WgXcQ', category: 'Projects', location: 'Nationwide' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div style={{ background: 'linear-gradient(135deg, #1B1B2F, #2D6A4F)' }} className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-70" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Photo & Video Gallery</h1>
              <p className="text-white/70 max-w-xl mx-auto">A visual journey of transformation across rural India</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      {/* Tab + Category filter */}
      <div className="bg-white border-b border-border sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
              {tab === 'Photos' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white border-b border-border sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-muted-foreground text-sm ml-auto flex items-center whitespace-nowrap">{filtered.length} items</span>
        </div>
      </div>

      {/* Grid / Videos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {activeTab === 'Videos' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoItems.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="aspect-video bg-brown-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/70" />
                  </div>
                  <div className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">{v.category}</div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm">{v.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{v.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence mode="wait">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted"
                onClick={() => setLightbox(item)}
              >
                <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <div className="p-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">{item.category}</span>
                    <p className="text-white text-xs mt-1 font-semibold">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
              <X className="w-8 h-8" />
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.title} className="w-full max-h-[80vh] object-contain rounded-xl" />
              <div className="text-center mt-3">
                <p className="text-white font-semibold">{lightbox.title}</p>
                <p className="text-white/60 text-sm">{lightbox.location} · {lightbox.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}