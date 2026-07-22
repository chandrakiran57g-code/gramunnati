import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, School, FolderOpen, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/shared/SafeImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { stripHtml } from '@/lib/stripHtml';
import { normalizeVillageRecord } from '@/lib/villageDisplay';
import { useInstantNavigation } from '@/lib/instantNavigation';

export default function VillageCard({ village: rawVillage, index = 0 }) {
  const { lang } = useLanguage();
  const instant = useInstantNavigation();
  const navigate = useNavigate();
  const village = normalizeVillageRecord(rawVillage);
  const villageName = localize(village, 'village_name', lang);
  const shortDescription = localize(village, 'short_description', lang);
  const slug = village.slug || village.village_name?.toLowerCase().replace(/\s+/g, '-') || village.id;
  const detailHref = `/villages/${slug}`;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 20 }}
      animate={instant ? { opacity: 1, y: 0 } : undefined}
      whileInView={instant ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={instant ? { duration: 0 } : { delay: index * 0.1, duration: 0.5 }}
      onClick={() => navigate(detailHref)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(detailHref); }}
      className="group cs-hover-card bg-white rounded-2xl overflow-hidden border border-brown-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden">
        <SafeImage
          src={village.cover_image}
          alt={villageName}
          fallbackIndex={index}
          width={600}
          className="cs-hover-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-900/60 to-transparent" />
        {village.is_featured && (
          <span className="absolute top-3 left-3 bg-brown-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <h3 className="font-heading font-bold text-white text-lg leading-tight">{villageName}</h3>
          <div className="flex items-center gap-1 bg-service-village/90 text-white text-xs px-2 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            {village.state}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{village.district}{village.mandal ? `, ${village.mandal}` : ''}</span>
        </div>

        {shortDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{stripHtml(shortDescription)}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-service-school-tint rounded-lg py-2">
            <div className="font-bold text-sm text-service-school">{village.schools_count || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <School className="w-3 h-3" />Schools
            </div>
          </div>
          <div className="text-center bg-service-skill-tint rounded-lg py-2">
            <div className="font-bold text-sm text-service-skill">{village.projects_count || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <FolderOpen className="w-3 h-3" />Projects
            </div>
          </div>
          <div className="text-center bg-service-tree-tint rounded-lg py-2">
            <div className="font-bold text-sm text-service-tree">{village.volunteers_count || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <Users className="w-3 h-3" />Vols
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={detailHref} onClick={(e) => e.stopPropagation()} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-service-village text-service-village hover:bg-service-village hover:text-white text-xs">
              View Details
            </Button>
          </Link>
          <Link to={`/donate?type=village&village_id=${village.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" className="donation-gradient text-white border-0 text-xs px-3">
              <Heart className="w-3 h-3 mr-1" />Donate
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
