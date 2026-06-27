import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Video } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import GalleryCard from '@/components/gallery/GalleryCard';
import GalleryCollectionModal from '@/components/gallery/GalleryCollectionModal';
import { GALLERY_CATEGORIES, filterCollections, hasVideos } from '@/lib/galleryData';
import { useGalleryCollections } from '@/hooks/useGalleryCollections';

const TABS = ['Photos', 'Videos'];

export default function Gallery() {
  const { collections, loading } = useGalleryCollections();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Photos');
  const [selectedCollection, setSelectedCollection] = useState(null);

  const filtered = filterCollections(collections, activeCategory);
  const videoCollections = filtered.filter(hasVideos);

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

      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary/10'
              }`}
            >
              {tab === 'Photos' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-b border-border sticky top-[7.25rem] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex gap-2 overflow-x-auto">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-muted-foreground text-sm ml-auto flex items-center whitespace-nowrap">
            {activeTab === 'Photos' ? filtered.length : videoCollections.length} items
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading gallery…</div>
        ) : activeTab === 'Videos' ? (
          videoCollections.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No videos found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="wait">
                {videoCollections.map((collection, i) => (
                  <GalleryCard
                    key={collection.id}
                    collection={collection}
                    index={i}
                    variant="video"
                    onClick={setSelectedCollection}
                  />
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            <AnimatePresence mode="wait">
              {filtered.map((collection, i) => (
                <div key={collection.id} className="break-inside-avoid">
                  <GalleryCard
                    collection={collection}
                    index={i}
                    variant="photo"
                    onClick={setSelectedCollection}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <GalleryCollectionModal
        collection={selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />
    </div>
  );
}
