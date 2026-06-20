import { VILLAGE_GALLERY_PHOTOS } from '@/lib/villageImages';
import SafeImage from '@/components/shared/SafeImage';

export default function HomeGalleryMarquee({ images = [], loading }) {
  const items = images.length > 0
    ? images.filter((img) => img?.image_path)
    : VILLAGE_GALLERY_PHOTOS;

  const doubled = [...items, ...items];

  if (loading) {
    return (
      <section className="py-12 overflow-hidden">
        <div className="flex gap-4 px-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-48 h-32 bg-[#E8DFD0] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-16 overflow-hidden border-y border-[#D4B896]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <h2 className="font-heading font-bold text-[#3D2914] text-2xl sm:text-3xl" style={{ letterSpacing: '-0.025em' }}>
          Gaon ki tasveerein — asli zindagi
        </h2>
        <p className="text-[#5C4033]/65 text-sm mt-1 font-body">Village life, schools aur khet — real photos</p>
      </div>
      <div className="home-gallery-marquee overflow-hidden">
        <div className="home-gallery-inner flex gap-4 w-max">
          {doubled.map((img, i) => (
            <figure
              key={`${img.id}-${i}`}
              className="home-gallery-item shrink-0 w-52 sm:w-64 h-36 sm:h-44 rounded-lg overflow-hidden relative group"
            >
              <SafeImage
                src={img.image_path}
                alt={img.title || 'Gallery'}
                fallbackIndex={i % VILLAGE_GALLERY_PHOTOS.length}
                width={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {img.title && (
                <figcaption className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-[#3D2914]/85 via-[#3D2914]/40 to-transparent pointer-events-none">
                  {img.category && (
                    <span className="inline-block text-[10px] text-white font-medium bg-black/45 px-2 py-0.5 rounded-full mb-1">
                      {img.category}
                    </span>
                  )}
                  <p className="text-[11px] text-amber-50 font-semibold leading-snug line-clamp-2 font-body">
                    {img.title}
                  </p>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
