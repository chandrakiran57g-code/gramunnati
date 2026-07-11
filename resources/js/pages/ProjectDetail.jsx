import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MapPin, Heart, ChevronLeft, Calendar, Target, TrendingUp, Clock, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BeforeAfterSlider from '@/components/shared/BeforeAfterSlider';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import RichContent from '@/components/shared/RichContent';
import { safeText } from '@/lib/safeText';
import { useRoutePageCache } from '@/hooks/useRoutePageCache';
import { useBreadcrumbLabel } from '@/lib/BreadcrumbContext';

const categoryColors = {
  'Village Development': 'text-village bg-village/10',
  'School Development': 'text-school bg-school/10',
  'Tree Plantation': 'text-green-700 bg-green-100',
  'Water Conservation': 'text-cyan-700 bg-cyan-100',
  'Agriculture': 'text-yellow-700 bg-yellow-100',
  'Healthcare': 'text-red-700 bg-red-100',
  'Skill Development': 'text-purple-700 bg-purple-100',
  'Women SHG': 'text-pink-700 bg-pink-100',
  'Infrastructure': 'text-orange-700 bg-orange-100',
  'Employment Generation': 'text-indigo-700 bg-indigo-100',
};

const statusLabels = { upcoming: 'Upcoming', active: 'Active', completed: 'Completed', cancelled: 'Cancelled' };
const statusColors = { upcoming: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, showBlockingLoader } = useRoutePageCache(
    `project-detail:${slug}`,
    async () => {
      const all = await base44.entities.Project.list('-created_date', 200);
      return all.find(p => p.slug === slug || p.id === slug || p.project_name?.toLowerCase().replace(/\s+/g, '-') === slug) || null;
    },
    [slug],
  );

  useBreadcrumbLabel(project?.project_name || slug);

  if (showBlockingLoader) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-projects/30 border-t-projects rounded-full animate-spin" /></div>;

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-6xl mb-4">📋</div>
        <h2 className="font-heading text-2xl font-bold mb-2">Project Not Found</h2>
        <Link to="/projects"><Button className="bg-projects text-white border-0">Browse Projects</Button></Link>
      </div>
    </div>
  );

  const progressPct = project.budget_amount > 0 ? Math.round((project.raised_amount / project.budget_amount) * 100) : 0;
  const phaseProgress = project.status === 'upcoming' ? 0 : project.status === 'active' ? 50 : project.status === 'completed' ? 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src={project.cover_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80'} alt={project.project_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Link to="/projects" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3"><ChevronLeft className="w-4 h-4" /> Back to Projects</Link>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/90 ${categoryColors[project.category] || ''}`}>{project.category}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/90 ${statusColors[project.status]}`}>{statusLabels[project.status]}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">{project.project_name}</h1>
            <p className="text-white/80 text-sm mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" />{project.village_name}, {safeText(project.district)}, {safeText(project.state)}</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8">
          <h2 className="font-heading font-bold text-lg mb-6">Project Progress</h2>
          
          {/* Milestone Steps */}
          <div className="relative mb-8">
            <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded" />
            <div className="absolute top-5 left-0 h-1 bg-projects rounded transition-all duration-700" style={{ width: `${phaseProgress}%` }} />
            <div className="relative flex justify-between">
              {[
                { label: 'Initiated', key: 'initiated', desc: 'Project planning & approvals' },
                { label: 'Funding', key: 'funding', desc: 'Raising required funds' },
                { label: 'Execution', key: 'execution', desc: 'On-ground implementation' },
                { label: 'Completion', key: 'completion', desc: 'Handover to community' },
              ].map((step, i) => {
                const active = i <= Math.floor(phaseProgress / 33);
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: '25%' }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
                      active ? 'bg-projects text-white shadow-lg shadow-projects/30' : 'bg-muted text-muted-foreground'
                    }`}>
                      {active ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-semibold text-center ${active ? 'text-projects' : 'text-muted-foreground'}`}>{step.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-0.5 hidden sm:block">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-projects/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-projects">₹{project.raised_amount?.toLocaleString('en-IN') || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Raised</div>
              <Progress value={progressPct} className="mt-2 h-1.5" />
              <div className="text-xs text-muted-foreground mt-1">{progressPct}% of ₹{project.budget_amount?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div className="bg-school/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-school">{progressPct}%</div>
              <div className="text-xs text-muted-foreground mt-1">Funding Complete</div>
            </div>
            <div className="bg-donation/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-donation">{phaseProgress}%</div>
              <div className="text-xs text-muted-foreground mt-1">Phase Progress</div>
              <Progress value={phaseProgress} className="mt-2 h-1.5 [&>div]:bg-donation" />
            </div>
            <div className="bg-volunteer/5 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-volunteer mx-auto mb-1" />
              <div className="text-2xl font-bold text-volunteer">{statusLabels[project.status]}</div>
              <div className="text-xs text-muted-foreground mt-1">Status</div>
            </div>
          </div>
        </div>

        {/* Donate CTA */}
        <div className="flex gap-3 mb-8">
          <Link to={`/donate?type=project&project_id=${project.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full donation-gradient text-white border-0 font-semibold rounded-xl">
              <Heart className="w-4 h-4 mr-2" /> Donate to This Project
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-muted w-full justify-start overflow-x-auto flex gap-1 h-auto p-1 rounded-xl mb-6">
            {['overview','milestones','budget','before-after','gallery','donations'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm py-2 px-3 whitespace-nowrap">{tab.replace('-',' ')}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-heading font-bold text-lg mb-3">About This Project</h3>
                <RichContent content={project.description || project.short_description || 'Project details coming soon.'} className="text-muted-foreground leading-relaxed text-sm" />
                {project.objective && <div className="mt-4 pt-4 border-t border-border"><h4 className="font-semibold text-sm mb-2">Objective</h4><p className="text-muted-foreground text-sm">{project.objective}</p></div>}
              </div>
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Project Info</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Category', value: project.category },
                    { label: 'Status', value: statusLabels[project.status] },
                    { label: 'Village', value: project.village_name },
                    { label: 'District', value: safeText(project.district) },
                    { label: 'State', value: safeText(project.state) },
                    { label: 'Start Date', value: project.start_date },
                    { label: 'End Date', value: project.end_date },
                  ].map(item => item.value && (
                    <div key={item.label} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-6">Project Milestone Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-projects/20" />
                <div className="space-y-6 pl-12">
                  {[
                    { date: project.start_date || '2026-01-01', title: 'Project Initiated', desc: `Planning phase for ${project.project_name} began.`, type: 'planning', icon: '📋' },
                    { date: project.start_date ? new Date(new Date(project.start_date).getTime() + 30*86400000).toISOString().slice(0,10) : '2026-02-01', title: 'Funding Phase', desc: `Fundraising target: ₹${project.budget_amount?.toLocaleString('en-IN') || '0'}. Currently at ${progressPct}%.`, type: 'funding', icon: '💰' },
                    { date: '2026-04-01', title: 'Execution Phase', desc: 'On-ground implementation and construction activities underway.', type: 'execution', icon: '🔨' },
                    { date: project.end_date || '2026-09-01', title: 'Project Completion', desc: 'Expected completion and handover to community.', type: 'completion', icon: '🎉' },
                  ].map((m, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 w-8 h-8 bg-projects/10 rounded-full flex items-center justify-center text-sm border-2 border-white">{m.icon}</div>
                      <div className="bg-muted/30 rounded-xl p-4">
                        <span className="text-xs font-semibold text-projects">{m.date}</span>
                        <h4 className="font-semibold text-sm mt-1">{m.title}</h4>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Budget Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Total Budget</span><span className="font-bold">₹{project.budget_amount?.toLocaleString('en-IN') || 0}</span></div>
                  <Progress value={100} className="h-3 bg-muted" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Raised</span><span className="font-bold text-green-700">₹{project.raised_amount?.toLocaleString('en-IN') || 0}</span></div>
                  <Progress value={progressPct} className="h-3 bg-muted [&>div]:bg-green-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Spent</span><span className="font-bold text-donation">₹{project.spent_amount?.toLocaleString('en-IN') || 0}</span></div>
                  <Progress value={project.budget_amount > 0 ? Math.round((project.spent_amount || 0) / project.budget_amount * 100) : 0} className="h-3 bg-muted [&>div]:bg-donation" />
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Remaining</span>
                    <span className="text-projects">₹{((project.budget_amount || 0) - (project.spent_amount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="before-after">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Before & After</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <BeforeAfterSlider
                  beforeImage={project.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=60'}
                  afterImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"
                  beforeLabel="Before"
                  afterLabel="After"
                />
                <div className="bg-muted/50 rounded-xl p-5 flex items-center justify-center text-center text-sm text-muted-foreground">
                  Upload before/after photos to showcase the transformation
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[project.cover_image, 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400&q=80'].filter(Boolean).map((src, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden"><img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" /></div>
              ))}
              <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs text-center p-4">More photos coming soon</div>
            </div>
          </TabsContent>

          <TabsContent value="donations">
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <Heart className="w-12 h-12 text-donation/30 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-xl mb-2">Support This Project</h3>
              <p className="text-muted-foreground text-sm mb-6">₹{(project.budget_amount - (project.raised_amount || 0)).toLocaleString('en-IN')} still needed to complete this project.</p>
              <Link to={`/donate?type=project&project_id=${project.id}`}>
                <Button className="donation-gradient text-white border-0 px-10 rounded-xl font-semibold">
                  <Heart className="w-4 h-4 mr-2" /> Donate Now
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}