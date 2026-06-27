import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { hasVideos } from '@/lib/galleryData';

export default function GalleryCard({ collection, index = 0, variant = 'photo', onClick }) {
  const showVideoBadge = variant === 'video' || hasVideos(collection);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(collection)}
      className="group relative w-full aspect-square rounded-xl overflow-hidden bg-muted text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <SafeImage
        src={collection.coverSrc}
        alt={collection.title}
        fallbackIndex={index}
        width={800}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 pointer-events-none" />

      {variant === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-90 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
        <span className="inline-block text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
          {collection.category}
        </span>
        <p className="text-white text-sm font-semibold mt-1.5 leading-snug line-clamp-2 drop-shadow-sm">
          {collection.title}
        </p>
        {showVideoBadge && variant === 'photo' && hasVideos(collection) && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
            <Play className="w-2.5 h-2.5" />
            Includes videos
          </span>
        )}
      </div>
    </motion.button>
  );
}
