import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Layout, Loader2, Star, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminHomepage() {
  const [villages, setVillages] = useState([]);
  const [schools, setSchools] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.Village.list('-created_date', 100).catch(() => []),
      base44.entities.School.list('-created_date', 100).catch(() => []),
      base44.entities.Project.list('-created_date', 100).catch(() => []),
      base44.entities.SuccessStory.list('-created_date', 100).catch(() => []),
    ]).then(([v, s, p, st]) => {
      setVillages(v); setSchools(s); setProjects(p); setStories(st);
      setLoading(false);
    });
  }, []);

  const toggleFeatured = async (entity, item, field) => {
    setToggling(prev => ({ ...prev, [item.id]: true }));
    const entityMap = { Village: base44.entities.Village, School: base44.entities.School, Project: base44.entities.Project, SuccessStory: base44.entities.SuccessStory };
    const newVal = !item[field];
    await entityMap[entity].update(item.id, { [field]: newVal });
    const all = await entityMap[entity].list('-created_date', 100);
    if (entity === 'Village') setVillages(all);
    else if (entity === 'School') setSchools(all);
    else if (entity === 'Project') setProjects(all);
    else setStories(all);
    setToggling(prev => ({ ...prev, [item.id]: false }));
    toast.success(`${item.village_name || item.school_name || item.project_name || item.title} ${newVal ? 'featured' : 'unfeatured'}`);
  };

  const toggleActive = async (entity, item) => {
    setToggling(prev => ({ ...prev, [item.id]: true }));
    const entityMap = { Village: base44.entities.Village, School: base44.entities.School, Project: base44.entities.Project };
    const newVal = !item.is_active;
    await entityMap[entity].update(item.id, { is_active: newVal });
    const all = await entityMap[entity].list('-created_date', 100);
    if (entity === 'Village') setVillages(all);
    else if (entity === 'School') setSchools(all);
    else if (entity === 'Project') setProjects(all);
    setToggling(prev => ({ ...prev, [item.id]: false }));
    toast.success(`${item.village_name || item.school_name || item.project_name} ${newVal ? 'active' : 'hidden'}`);
  };

  const Section = ({ title, items, entity, col1, col2, col3 }) => (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 bg-muted/20 border-b border-border font-semibold text-sm flex items-center gap-2">
        <Star className="w-4 h-4 text-donation" /> {title} <span className="text-xs text-muted-foreground font-normal ml-2">({items.length} total)</span>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No {title.toLowerCase()} yet.</div>
        ) : items.map((item) => (
          <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
            <div>
              <div className="font-medium text-sm">{item[col1] || item.title}</div>
              <div className="text-xs text-muted-foreground">{item[col2]}{col3 && item[col3] ? ` · ${item[col3]}` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              {entity !== 'SuccessStory' && (
                <button onClick={() => toggleActive(entity, item)} disabled={toggling[item.id]}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-brown-400'
                  }`}>
                  {toggling[item.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : item.is_active ? 'Active' : 'Hidden'}
                </button>
              )}
              <Button size="sm" variant="ghost" onClick={() => toggleFeatured(entity, item, entity === 'SuccessStory' ? 'is_featured' : 'is_featured')} disabled={toggling[item.id]}
                title={item.is_featured ? 'Remove from featured' : 'Add to featured'}>
                {toggling[item.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                  item.is_featured ? <Star className="w-3.5 h-3.5 fill-donation text-donation" /> : <Star className="w-3.5 h-3.5 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Layout className="w-6 h-6 text-primary" /> Homepage Manager
        </h1>
        <p className="text-muted-foreground mt-1">Control which villages, schools, projects, and stories appear on the homepage</p>
      </div>

      {loading ? (
        <div className="grid gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="grid gap-6">
          <Section title="Featured Villages" items={villages} entity="Village" col1="village_name" col2="district" col3="state" />
          <Section title="Featured Schools" items={schools} entity="School" col1="school_name" col2="village_name" col3="school_type" />
          <Section title="Active Projects on Homepage" items={projects} entity="Project" col1="project_name" col2="category" col3="status" />
          <Section title="Featured Success Stories" items={stories} entity="SuccessStory" col1="title" col2="village_name" />
        </div>
      )}
    </div>
  );
}