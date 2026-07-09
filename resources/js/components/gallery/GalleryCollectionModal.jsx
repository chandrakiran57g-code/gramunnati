import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Image, Video, MapPin } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { getCollectionPhotos, getCollectionVideos } from '@/lib/galleryData';

export default function GalleryCollectionModal({ collection, onClose }) {
  const [activeMedia, setActiveMedia] = useState(null);
  const photos = getCollectionPhotos(collection);
  const videos = getCollectionVideos(collection);

  return (
    <AnimatePresence>
      {collection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-background shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
              <div>
                <span className="inline-block text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-2">
                  {collection.category}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{collection.title}</h2>
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {collection.location}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-8">
              {photos.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                    <Image className="w-4 h-4 text-primary" />
                    Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-muted text-left"
                      >
                        <SafeImage
                          src={item.src}
                          alt={item.caption}
                          fallbackIndex={0}
                          width={600}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <p className="absolute bottom-0 left-0 right-0 p-2.5 text-[11px] sm:text-xs text-white font-medium leading-snug line-clamp-2">
                          {item.caption}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {videos.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                    <Video className="w-4 h-4 text-primary" />
                    Videos ({videos.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {videos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-muted text-left"
                      >
                        {item.embedId ? (
                          <img
                            src={`https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`}
                            alt={item.caption}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            src={item.src}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-primary ml-0.5" />
                          </div>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 p-2.5 text-[11px] sm:text-xs text-white font-medium leading-snug line-clamp-2">
                          {item.caption}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {activeMedia && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
                onClick={() => setActiveMedia(null)}
              >
                <button
                  type="button"
                  className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
                  onClick={() => setActiveMedia(null)}
                  aria-label="Close preview"
                >
                  <X className="w-8 h-8" />
                </button>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="max-w-4xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeMedia.type === 'image' ? (
                    <SafeImage
                      src={activeMedia.src}
                      alt={activeMedia.caption}
                      fallbackIndex={0}
                      width={1200}
                      className="w-full max-h-[80vh] object-contain rounded-xl mx-auto bg-[#2d4a3e]"
                    />
                  ) : activeMedia.embedId ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe
                        title={activeMedia.caption}
                        src={`https://www.youtube.com/embed/${activeMedia.embedId}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={activeMedia.src}
                      controls
                      autoPlay
                      playsInline
                      className="w-full max-h-[80vh] rounded-xl mx-auto bg-black"
                    />
                  )}
                  <p className="text-center text-white font-medium mt-3">{activeMedia.caption}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
