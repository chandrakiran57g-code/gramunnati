import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, School, FolderOpen, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/shared/SafeImage';

export default function VillageCard({ village, index = 0 }) {
  const slug = village.slug || village.village_name?.toLowerCase().replace(/\s+/g, '-') || village.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group cs-hover-card bg-white rounded-2xl overflow-hidden border border-brown-300 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-44 overflow-hidden">
        <SafeImage
          src={village.cover_image}
          alt={village.village_name}
          fallbackIndex={index}
          width={600}
          className="cs-hover-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-900/60 to-transparent" />
        {village.is_featured && (
          <span className="absolute top-3 left-3 bg-brown-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <h3 className="font-heading font-bold text-white text-lg leading-tight">{village.village_name}</h3>
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

        {village.short_description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{village.short_description}</p>
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
          <Link to={`/villages/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-service-village text-service-village hover:bg-service-village hover:text-white text-xs">
              View Details
            </Button>
          </Link>
          <Link to={`/donate?type=village&village_id=${village.id}`}>
            <Button size="sm" className="donation-gradient text-white border-0 text-xs px-3">
              <Heart className="w-3 h-3 mr-1" />Donate
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
