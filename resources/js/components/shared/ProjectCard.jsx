import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SafeImage from '@/components/shared/SafeImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { stripHtml } from '@/lib/stripHtml';

const categoryColors = {
  'Village Development': 'bg-service-village-tint text-service-village border-service-village/30',
  'School Development': 'bg-service-school-tint text-service-school border-service-school/30',
  'Tree Plantation': 'bg-service-tree-tint text-service-tree border-service-tree/30',
  'Water Conservation': 'bg-service-water-tint text-service-water border-service-water/30',
  Agriculture: 'bg-service-agriculture-tint text-service-agriculture border-service-agriculture/30',
  Healthcare: 'bg-service-healthcare-tint text-service-healthcare border-service-healthcare/30',
  'Skill Development': 'bg-service-skill-tint text-service-skill border-service-skill/30',
  'Women SHG': 'bg-service-women-tint text-service-women border-service-women/30',
  Infrastructure: 'bg-cream-300 text-brown-700 border-brown-300',
  'Employment Generation': 'bg-cream-200 text-brown-600 border-brown-300',
};

const categoryProgress = {
  'Village Development': '[&>div]:bg-service-village',
  'School Development': '[&>div]:bg-service-school',
  'Tree Plantation': '[&>div]:bg-service-tree',
  'Water Conservation': '[&>div]:bg-service-water',
  Agriculture: '[&>div]:bg-service-agriculture',
  Healthcare: '[&>div]:bg-service-healthcare',
  'Skill Development': '[&>div]:bg-service-skill',
  'Women SHG': '[&>div]:bg-service-women',
};

const statusColors = {
  upcoming: 'bg-service-school-tint text-service-school',
  active: 'bg-service-tree-tint text-service-tree',
  completed: 'bg-cream-200 text-brown-500',
  cancelled: 'bg-service-healthcare-tint text-service-healthcare',
};

export default function ProjectCard({ project, index = 0 }) {
  const { lang } = useLanguage();
  const projectName = localize(project, 'project_name', lang);
  const shortDescription = localize(project, 'short_description', lang);
  const slug = project.slug || project.project_name?.toLowerCase().replace(/\s+/g, '-') || project.id;
  // `category` can arrive as a relation object from the API — always resolve to a string
  const categoryName = typeof project.category === 'string'
    ? project.category
    : project.project_categories?.name || project.category?.name || '';
  const location = [
    project.village_name || project.villages?.village_name,
    project.district || project.villages?.districts?.name,
  ].filter(Boolean).join(', ');
  const raisedPct = project.budget_amount > 0
    ? Math.min(Math.round((project.raised_amount / project.budget_amount) * 100), 100)
    : project.progress_percentage || 0;
  const progressClass = categoryProgress[categoryName] || '[&>div]:bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white rounded-2xl border border-brown-300 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <Link to={`/projects/${slug}`}>
        <div className="relative h-44 overflow-hidden">
          <SafeImage
            src={project.cover_image}
            alt={projectName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {project.is_featured && (
            <div className="absolute top-3 left-3 bg-brown-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              Featured
            </div>
          )}
          {categoryName && (
            <Badge className={`absolute top-3 right-3 text-xs border ${categoryColors[categoryName] || 'bg-cream-100 text-brown-600'}`}>
              {categoryName}
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/projects/${slug}`}>
          <h3 className="font-heading font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {projectName}
          </h3>
        </Link>
        {location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {stripHtml(shortDescription)}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">{raisedPct}%</span>
          </div>
          <Progress value={raisedPct} className={`h-2 bg-cream-200 ${progressClass}`} />
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-primary font-medium">
              ₹{(project.raised_amount || 0).toLocaleString('en-IN')} raised
            </span>
            <span className="text-muted-foreground">
              of ₹{(project.budget_amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${statusColors[project.status] || ''}`}>
            {project.status}
          </Badge>
          <Link to={`/donate?project=${slug}`}>
            <Button size="sm" className="donation-gradient text-white border-0 text-xs">
              <Heart className="w-3 h-3 mr-1" /> Support
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
