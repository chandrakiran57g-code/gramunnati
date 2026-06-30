import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { activeWorkService } from '@/api/activeWork';
import { isProgramTemplate, getProgramTemplateMeta } from '@/lib/activeWorkTemplates';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Heart, MapPin, ChevronLeft } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import VillageInsightsCharts from '@/components/village/VillageInsightsCharts';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';

export default function ActiveWorkDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItem = useCallback(({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    activeWorkService.getItem(slug, { bustCache: soft })
      .then(setItem)
      .finally(() => { if (!soft) setLoading(false); });
  }, [slug]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  usePlatformRefresh(() => loadItem({ soft: true }));

  if (loading && !item) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div><h2 className="text-2xl font-bold mb-2">Not Found</h2><Link to="/"><Button>Home</Button></Link></div>
    </div>
  );

  const ds = item.development_score || {};
  const radarData = [
    { subject: 'Education', score: ds.education || 50, fullMark: 100 },
    { subject: 'Infrastructure', score: ds.infrastructure || 50, fullMark: 100 },
    { subject: 'Environment', score: ds.environment || 50, fullMark: 100 },
    { subject: 'Agriculture', score: ds.agriculture || 50, fullMark: 100 },
    { subject: 'Community', score: ds.community || 50, fullMark: 100 },
  ];

  const isProgram = isProgramTemplate(item.template_type);
  const programMeta = isProgram ? getProgramTemplateMeta(item.template_type) : null;
  const impact = item.impact || {};
  const mockVillage = {
    population: 500, male_population: 250, female_population: 250,
    farmer_count: impact.farmer_count || 40, volunteers_count: impact.volunteers_count || 30,
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        <div className="relative h-72 overflow-hidden">
          <img src={item.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Link to="/" className="text-white/70 text-sm flex items-center gap-1 mb-2"><ChevronLeft className="w-4 h-4" /> Back</Link>
            <h1 className="font-heading text-3xl font-bold text-white">{programMeta?.icon ? `${programMeta.icon} ` : ''}{item.name}</h1>
            {item.location?.district && <p className="text-white/80 text-sm mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" />{item.location.district}</p>}
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {(isProgram
            ? [
                ['Beneficiaries', impact.beneficiaries],
                ['Villages', impact.villages_reached],
                ['Schools', impact.schools_reached],
                ['Volunteers', impact.volunteers],
                ['Projects', impact.projects_count],
                ['Raised', impact.funds_raised ? `₹${Number(impact.funds_raised).toLocaleString('en-IN')}` : 0],
              ]
            : [
                ['Trees', impact.trees_planted], ['Water Bodies', impact.water_bodies], ['Farmers', impact.farmer_count],
                ['Schools', impact.schools_count], ['Projects', impact.projects_count], ['Volunteers', impact.volunteers_count],
              ]
          ).map(([label, val]) => (
            <div key={label} className="bg-white rounded-xl border p-3 text-center">
              <div className="text-lg font-bold">{Number(val || 0).toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-5 mb-8">
          <h3 className="font-heading font-bold mb-2">Development Score</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="score" stroke="#2D6A4F" fill="#2D6A4F" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto">
            {['overview', 'statistics', 'timeline', 'gallery', 'donations', 'insights'].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview">
            <div className="bg-white rounded-xl border p-6 prose max-w-none space-y-4">
              <p>{item.overview?.about || item.description || 'No overview yet.'}</p>
              {isProgram && item.program_details?.objectives && (
                <div>
                  <h4 className="font-semibold mb-2">Objectives</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {item.program_details.objectives.split('\n').filter(Boolean).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {isProgram && item.program_details?.activities && (
                <div>
                  <h4 className="font-semibold mb-2">Activities</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {item.program_details.activities.split('\n').filter(Boolean).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="statistics">
            <div className="bg-white rounded-xl border p-6 text-sm space-y-2">
              {Object.entries(item.statistics || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-2"><span className="text-muted-foreground capitalize">{k}</span><span>{String(v)}</span></div>
              ))}
              {!Object.keys(item.statistics || {}).length && <p className="text-muted-foreground">Statistics will appear when admin adds them.</p>}
            </div>
          </TabsContent>
          <TabsContent value="timeline">
            <div className="space-y-4">
              {(item.timeline || []).map((ev, i) => (
                <div key={i} className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-primary font-semibold">{ev.date}</div>
                  <h4 className="font-semibold">{ev.title}</h4>
                  <p className="text-sm text-muted-foreground">{ev.description}</p>
                </div>
              ))}
              {!item.timeline?.length && <p className="text-muted-foreground">No timeline entries yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(item.gallery || []).map((g, i) => (
                <img key={i} src={g.image} alt={g.caption || ''} className="rounded-xl aspect-square object-cover" />
              ))}
              {!item.gallery?.length && <p className="text-muted-foreground col-span-full">No gallery images yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="donations">
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="text-3xl font-bold text-donation mb-2">₹{Number(item.donations?.raised || 0).toLocaleString('en-IN')}</div>
              <p className="text-muted-foreground mb-4">raised of ₹{Number(item.donations?.goal || 0).toLocaleString('en-IN')} goal</p>
              <Link to={`/donate?project_id=${item.id}`}><Button className="donation-gradient text-white border-0"><Heart className="w-4 h-4 mr-2" /> Donate</Button></Link>
            </div>
          </TabsContent>
          <TabsContent value="insights">
            <VillageInsightsCharts village={mockVillage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
