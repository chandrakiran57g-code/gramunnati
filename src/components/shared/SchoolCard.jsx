import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, BookOpen, Heart, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const typeColors = {
  government: 'bg-village/10 text-village',
  private: 'bg-school/10 text-school',
  aided: 'bg-purple-100 text-purple-700',
  model: 'bg-donation/10 text-donation',
};

const typeLabel = {
  government: 'Government',
  private: 'Private',
  aided: 'Aided',
  model: 'Model School',
};

export default function SchoolCard({ school, index = 0 }) {
  const slug = school.slug || school.school_name?.toLowerCase().replace(/\s+/g, '-') || school.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={school.cover_image || `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80`}
          alt={school.school_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {school.is_featured && (
          <span className="absolute top-3 left-3 bg-school text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${typeColors[school.school_type] || typeColors.government} bg-white/90`}>
          {typeLabel[school.school_type] || 'School'}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-white text-base leading-tight line-clamp-2">{school.school_name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{school.village_name}, {school.district}, {school.state}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-school/5 rounded-lg py-2">
            <div className="font-bold text-sm text-school">{school.student_count?.toLocaleString('en-IN') || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <Users className="w-3 h-3" />Students
            </div>
          </div>
          <div className="text-center bg-village/5 rounded-lg py-2">
            <div className="font-bold text-sm text-village">{school.teacher_count || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <GraduationCap className="w-3 h-3" />Teachers
            </div>
          </div>
          <div className="text-center bg-projects/5 rounded-lg py-2">
            <div className="font-bold text-sm text-projects">{school.classroom_count || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
              <BookOpen className="w-3 h-3" />Rooms
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/schools/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-school text-school hover:bg-school hover:text-white text-xs">
              View Details
            </Button>
          </Link>
          <Link to={`/donate?type=school&school_id=${school.id}`}>
            <Button size="sm" className="bg-donation hover:bg-donation-light text-white border-0 text-xs px-3">
              <Heart className="w-3 h-3 mr-1" />Donate
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}