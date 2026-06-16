import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, School, Users, FolderOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROGRAMS = [
  {
    id: 'model-village', title: 'Model Village Development', slug: 'model-village',
    icon: '🏘️', color: 'from-village to-village-light',
    desc: 'Transforming villages into self-sustaining model communities with infrastructure, education, and economic development.',
    objectives: ['Rural infrastructure development', 'Clean drinking water access', 'Solar energy adoption', 'Digital connectivity', 'Self-help group formation'],
    activities: ['Infrastructure audits', 'Community meetings', 'SHG training workshops', 'Tree plantation drives', 'Digital literacy camps'],
    stats: { villages: 45, schools: 120, volunteers: 350, donations: 2500000 },
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    stories: [{ title: 'Medaram Goes Solar', desc: '45 households now have solar-powered lighting reducing electricity costs by 60%.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80' }]
  },
  {
    id: 'model-school', title: 'Model School Empowerment', slug: 'model-school',
    icon: '🏫', color: 'from-school to-school-light',
    desc: 'Upgrading government schools with digital classrooms, libraries, and modern facilities.',
    objectives: ['Digital classroom setup', 'Library establishment', 'Sports infrastructure', 'Teacher training', 'Student scholarships'],
    activities: ['School infrastructure audits', 'Digital literacy programs', 'Teacher workshops', 'Student mentorship', 'STEM camps'],
    stats: { villages: 30, schools: 85, volunteers: 200, donations: 1800000 },
    cover: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
    stories: [{ title: 'Digital Classroom at ZPHS', desc: 'Smart board and 20 tablets deployed, benefiting 350 students.', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80' }]
  },
  {
    id: 'tree-plantation', title: 'Tree Plantation Drive', slug: 'tree-plantation',
    icon: '🌳', color: 'from-green-600 to-emerald-600',
    desc: 'Large-scale afforestation drives to improve rural environment and create green cover.',
    objectives: ['10,000 trees per season target', 'Native species plantation', 'Community maintenance', 'Carbon footprint reduction'],
    activities: ['Sapling distribution', 'Plantation camps', 'Tree audits', 'Awareness programs'],
    stats: { villages: 80, schools: 150, volunteers: 600, donations: 800000 },
    cover: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
    stories: [{ title: '5,000 Trees in One Weekend', desc: 'Community effort planted 5,000 saplings across 12 villages.', img: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400&q=80' }]
  },
  {
    id: 'water-conservation', title: 'Water Conservation', slug: 'water-conservation',
    icon: '💧', color: 'from-cyan-600 to-blue-600',
    desc: 'Rainwater harvesting, check dams, and water body restoration for sustainable water management.',
    objectives: ['Rainwater harvesting units', 'Check dam construction', 'Pond restoration', 'Watershed management'],
    activities: ['Water body surveys', 'Harvesting system installation', 'Check dam construction', 'Community training'],
    stats: { villages: 35, schools: 50, volunteers: 180, donations: 1200000 },
    cover: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=1200&q=80',
    stories: [{ title: 'Reviving Kotha Cheruvu', desc: 'Historic village pond restored, now holds water year-round.', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80' }]
  },
  {
    id: 'women-shg', title: 'Women Self-Help Groups', slug: 'women-shg',
    icon: '👩‍👩‍👧', color: 'from-pink-600 to-rose-600',
    desc: 'Empowering women through self-help groups with skill training and micro-finance.',
    objectives: ['SHG formation', 'Skill development', 'Micro-enterprise support', 'Financial literacy'],
    activities: ['SHG meetings', 'Tailoring workshops', 'Financial literacy camps', 'Market linkages'],
    stats: { villages: 55, schools: 0, volunteers: 120, donations: 900000 },
    cover: 'https://images.unsplash.com/photo-1607749091702-1e02e549d8b9?w=1200&q=80',
    stories: [{ title: 'From Zero to Enterprise', desc: '30 women started their own tailoring business generating steady income.', img: 'https://images.unsplash.com/photo-1490127252417-7c393f993ee3?w=400&q=80' }]
  },
  {
    id: 'skill-development', title: 'Skill Development', slug: 'skill-development',
    icon: '🔧', color: 'from-purple-600 to-violet-600',
    desc: 'Vocational training and skill building programs for rural youth employment.',
    objectives: ['Computer training', 'Vocational skills', 'Job placement', 'Entrepreneurship support'],
    activities: ['Computer classes', 'Trade workshops', 'Job fairs', 'Mentorship programs'],
    stats: { villages: 40, schools: 60, volunteers: 90, donations: 600000 },
    cover: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
    stories: [{ title: '100 Youth Trained in IT', desc: 'Basic computer training enabled 100 youth to secure local employment.', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80' }]
  },
  {
    id: 'healthcare', title: 'Rural Healthcare', slug: 'healthcare',
    icon: '🏥', color: 'from-red-600 to-rose-600',
    desc: 'Improving healthcare access through medical camps and health awareness programs.',
    objectives: ['Medical camps', 'Health awareness', 'Sanitation drives', 'Nutrition programs'],
    activities: ['Monthly health camps', 'Sanitation drives', 'Nutrition awareness', 'Vaccination drives'],
    stats: { villages: 60, schools: 100, volunteers: 250, donations: 1500000 },
    cover: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    stories: [{ title: 'Free Eye Camp', desc: '350 villagers received free eye check-ups and 80 received spectacles.', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80' }]
  },
  {
    id: 'agriculture', title: 'Agriculture Support', slug: 'agriculture',
    icon: '🌾', color: 'from-amber-600 to-yellow-600',
    desc: 'Supporting farmers with modern techniques, organic farming, and market access.',
    objectives: ['Organic farming promotion', 'Irrigation support', 'Market linkages', 'Farmer training'],
    activities: ['Organic farming workshops', 'Soil testing', 'Farmer collectives', 'Market connects'],
    stats: { villages: 70, schools: 0, volunteers: 160, donations: 1100000 },
    cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80',
    stories: [{ title: 'Organic Farming Success', desc: '25 farmers shifted to organic, improving soil health and profits.', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80' }]
  },
];

export default function ProgramDetail() {
  const { slug } = useParams();
  const program = PROGRAMS.find(p => p.slug === slug);

  if (!program) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">📂</div>
        <h2 className="font-heading text-2xl font-bold mb-2">Program Not Found</h2>
        <Link to="/programs"><Button className="village-gradient text-white border-0">View All Programs</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={program.cover} alt={program.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <Link to="/programs" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3"><ArrowLeft className="w-4 h-4" /> Back to Programs</Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">{program.icon} {program.title}</h1>
          <p className="text-white/80 text-sm max-w-xl">{program.desc}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Villages Impacted', value: program.stats.villages, icon: MapPin, color: 'text-village' },
            { label: 'Schools Impacted', value: program.stats.schools, icon: School, color: 'text-school' },
            { label: 'Volunteers', value: program.stats.volunteers, icon: Users, color: 'text-volunteer' },
            { label: 'Donations Raised', value: `₹${(program.stats.donations / 100000).toFixed(1)}L`, icon: Heart, color: 'text-donation' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Donate CTA */}
        <div className="text-center mb-8">
          <Link to="/donate">
            <Button className="donation-gradient text-white border-0 px-12 py-3 rounded-xl font-semibold text-lg">
              <Heart className="w-5 h-5 mr-2" /> Support This Program
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-muted w-full justify-start overflow-x-auto flex gap-1 h-auto p-1 rounded-xl mb-6">
            {['overview','objectives','activities','impact','gallery'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm py-2 px-4 whitespace-nowrap">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-3">About This Program</h3>
              <p className="text-muted-foreground leading-relaxed">{program.desc}</p>
            </div>
          </TabsContent>

          <TabsContent value="objectives">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Program Objectives</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {program.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-xl p-4">
                    <Target className="w-5 h-5 text-village flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Key Activities</h3>
              <div className="grid grid-cols-2 gap-3">
                {program.activities.map((act, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-projects flex-shrink-0" />{act}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Success Stories</h3>
              <div className="space-y-4">
                {program.stories.map((story, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 bg-muted/30 rounded-xl p-4">
                    <img src={story.img} alt={story.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-semibold mb-1">{story.title}</h4>
                      <p className="text-sm text-muted-foreground">{story.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { label: 'Villages', value: program.stats.villages },
                  { label: 'Schools', value: program.stats.schools },
                  { label: 'Volunteers', value: program.stats.volunteers },
                  { label: 'Donations', value: `₹${(program.stats.donations / 100000).toFixed(1)}L` },
                ].map(stat => (
                  <div key={stat.label} className="text-center bg-muted/30 rounded-xl p-3">
                    <div className="text-lg font-bold text-village">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {program.stories.map((story, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={story.img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
              <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                More photos coming soon
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}