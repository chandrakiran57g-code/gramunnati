import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const categoryColors = {
  'Village Development': 'bg-village/10 text-village border-village/20',
  'School Development': 'bg-school/10 text-school border-school/20',
  'Tree Plantation': 'bg-green-100 text-green-700 border-green-200',
  'Water Conservation': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Agriculture': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Healthcare': 'bg-red-100 text-red-700 border-red-200',
  'Skill Development': 'bg-purple-100 text-purple-700 border-purple-200',
  'Women SHG': 'bg-pink-100 text-pink-700 border-pink-200',
  'Infrastructure': 'bg-orange-100 text-orange-700 border-orange-200',
  'Employment Generation': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ProjectCard({ project, index = 0 }) {
  const slug = project.slug || project.project_name?.toLowerCase().replace(/\s+/g, '-') || project.id;
  const raisedPct = project.budget_amount > 0
    ? Math.min(Math.round((project.raised_amount / project.budget_amount) * 100), 100)
    : project.progress_percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={project.cover_image || `https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80`}
          alt={project.project_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[project.category] || 'bg-white/90 text-gray-700'} bg-white/90`}>
            {project.category}
          </span>
        </div>
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[project.status] || statusColors.upcoming} bg-white/90`}>
          {project.status || 'upcoming'}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-white text-base leading-tight line-clamp-2">{project.project_name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{project.village_name}, {project.district}</span>
        </div>

        {project.short_description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.short_description}</p>
        )}

        {/* Fundraising progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground">Fundraising Progress</span>
            <span className="font-semibold text-village">{raisedPct}%</span>
          </div>
          <Progress value={raisedPct} className="h-2 bg-muted [&>div]:bg-village" />
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-village font-medium">
              ₹{(project.raised_amount || 0).toLocaleString('en-IN')} raised
            </span>
            {project.budget_amount > 0 && (
              <span className="text-muted-foreground">of ₹{project.budget_amount.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/projects/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs border-projects text-projects hover:bg-projects hover:text-white">
              View Project
            </Button>
          </Link>
          <Link to={`/donate?type=project&project_id=${project.id}`}>
            <Button size="sm" className="donation-gradient text-white border-0 text-xs px-3">
              <Heart className="w-3 h-3 mr-1" />Support
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}