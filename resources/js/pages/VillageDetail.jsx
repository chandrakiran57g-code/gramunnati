import { useState, useEffect } from 'react';
import { safeText } from '@/lib/safeText';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { villagesService } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { MapPin, Users, School, FolderOpen, Heart, TreePine, Droplets, ChevronLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import VillageInsightsCharts from '@/components/village/VillageInsightsCharts';
import BeforeAfterGallery from '@/components/shared/BeforeAfterGallery';
import { groupGalleryRows } from '@/lib/beforeAfterGallery';
import RichContent from '@/components/shared/RichContent';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { activityLogToTimelineEvent, formatTimelineDate } from '@/lib/villageTimeline';
import { availabilityLabel, cropRowToEditor } from '@/lib/villageCrops';
import { VILLAGE_DETAIL_TABS } from '@/lib/detailPageTabs';
import { normalizeVillageRecord } from '@/lib/villageDisplay';
import { fetchDonationTotal } from '@/lib/donationTotals';
import { useRoutePageCache } from '@/hooks/useRoutePageCache';
import { useBreadcrumbLabel } from '@/lib/BreadcrumbContext';

export default function VillageDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const { data, showBlockingLoader } = useRoutePageCache(
    `village-detail:${slug}`,
    async () => {
      const all = await base44.entities.Village.list('-created_date', 200);
      const found = all.find(v => v.slug === slug || v.id === slug || v.village_name?.toLowerCase().replace(/\s+/g, '-') === slug);
      const normalized = found ? normalizeVillageRecord(found) : null;
      if (!normalized?.id) {
        return {
          village: null,
          gallery: { before: [], after: [] },
          timeline: [],
          crops: [],
          totalDonations: 0,
        };
      }

      const [{ data: galleryRows }, { data: timelineRows }, { data: cropRows }, donationTotal] = await Promise.all([
        supabase
          .from('galleries')
          .select('*')
          .eq('galleryable_type', 'village')
          .eq('galleryable_id', normalized.id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('loggable_type', 'village')
          .eq('loggable_id', normalized.id)
          .order('activity_date', { ascending: false }),
        supabase
          .from('village_crops')
          .select('*')
          .eq('village_id', normalized.id)
          .order('sort_order', { ascending: true }),
        fetchDonationTotal({ villageId: normalized.id }).catch(() => 0),
      ]);

      return {
        village: normalized,
        gallery: groupGalleryRows(galleryRows),
        timeline: (timelineRows || []).map(activityLogToTimelineEvent),
        crops: (cropRows || []).map(cropRowToEditor),
        totalDonations: donationTotal || 0,
      };
    },
    [slug],
  );
  const village = data?.village ?? null;
  const gallery = data?.gallery ?? { before: [], after: [] };
  const timeline = data?.timeline ?? [];
  const crops = data?.crops ?? [];
  const totalDonations = data?.totalDonations ?? 0;
  useBreadcrumbLabel(village?.village_name || slug);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!village?.id || !isAuthenticated || !user?.id) {
      setFollowing(false);
      return;
    }
    villagesService.isFollowing(village.id, user.id).then(setFollowing).catch(() => setFollowing(false));
  }, [village?.id, isAuthenticated, user?.id]);

  const handleFollow = async () => {
    if (!village?.id) return;
    if (!isAuthenticated || !user?.id) {
      navigateToLogin();
      return;
    }
    setFollowLoading(true);
    try {
      if (following) {
        await villagesService.unfollow(village.id, user.id);
        setFollowing(false);
        toast.success('Unfollowed village');
      } else {
        await villagesService.follow(village.id, user.id);
        setFollowing(true);
        toast.success('You are now following this village');
      }
    } catch (e) {
      toast.error(e.message || 'Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (showBlockingLoader) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!village) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🏘️</div>
        <h2 className="font-heading text-2xl font-bold mb-2">Village Not Found</h2>
        <p className="text-muted-foreground mb-6">This village hasn't been registered on the platform yet.</p>
        <Link to="/villages"><Button className="brand-gradient text-white border-0">Browse Villages</Button></Link>
      </div>
    </div>
  );

  const infraItems = [
    { label: 'Trees Planted', value: village.trees_count || 0, icon: TreePine, color: 'text-green-600' },
    { label: 'Water Bodies', value: village.water_bodies_count || 0, icon: Droplets, color: 'text-cyan-600' },
    { label: 'Farmer Count', value: village.farmer_count || 0, icon: '🌾', isEmoji: true },
    { label: 'Schools', value: village.schools_count || 0, icon: School, color: 'text-school' },
    { label: 'Projects', value: village.projects_count || 0, icon: FolderOpen, color: 'text-projects' },
    { label: 'Volunteers', value: village.volunteers_count || 0, icon: Users, color: 'text-volunteer' },
  ];

  const radarData = [
    { subject: 'Education', score: Math.min(100, (village.schools_count || 0) * 20 + (village.literacy_rate || 0)), fullMark: 100 },
    { subject: 'Infrastructure', score: Math.min(100, (village.projects_count || 0) * 15 + 20), fullMark: 100 },
    { subject: 'Environment', score: Math.min(100, (village.trees_count || 0) * 0.1 + (village.water_bodies_count || 0) * 5), fullMark: 100 },
    { subject: 'Agriculture', score: Math.min(100, (village.farmer_count || 0) * 0.2 + 20), fullMark: 100 },
    { subject: 'Community', score: Math.min(100, (village.volunteers_count || 0) * 3 + 20), fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroScrollSection size="detail">
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={village.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'} alt={village.village_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Link to="/villages" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Villages
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">{village.village_name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{safeText(village.district)}, {safeText(village.mandal)}</span>
              <span className="flex items-center gap-1">📍 {safeText(village.state)}</span>
              {village.pincode && <span>📮 {village.pincode}</span>}
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {infraItems.map((item, i) => (
            <div key={item.label} className="bg-white rounded-xl border border-border p-3 text-center">
              <div className="text-lg font-bold text-foreground">{typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Donation + Follow + Compare Actions */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Link to={`/donate?type=village&village_id=${village.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full donation-gradient text-white border-0 font-semibold rounded-xl">
              <Heart className="w-4 h-4 mr-2" /> Donate to this Village
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            disabled={followLoading}
            onClick={handleFollow}
            className={`rounded-xl ${following ? 'border-primary bg-primary/10 text-primary' : 'border-primary text-primary hover:bg-primary hover:text-white'}`}
          >
            <Star className={`w-4 h-4 mr-1.5 ${following ? 'fill-primary' : ''}`} />
            {followLoading ? 'Please wait…' : following ? 'Following' : 'Follow Village'}
          </Button>
          <Link to={`/compare`}><Button variant="outline" className="border-projects text-projects hover:bg-projects hover:text-white rounded-xl">Compare</Button></Link>
        </div>

        {/* Development Score Radar */}
        <div className="bg-white rounded-xl border border-border p-5 mb-8">
          <h3 className="font-heading font-bold text-lg mb-2">Village Development Score</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="score" stroke="#2D6A4F" fill="#2D6A4F" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted w-full justify-start overflow-x-auto flex gap-1 h-auto p-1 rounded-xl mb-6">
            {VILLAGE_DETAIL_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg text-sm py-2 px-4 whitespace-nowrap">{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-3">About {village.village_name}</h3>
              <RichContent content={village.description || village.short_description || 'Village description not yet available. Contact the village representative to add information.'} className="text-muted-foreground leading-relaxed text-sm" />
              {village.history && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm mb-2">History</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{village.history}</p>
                </div>
              )}
              {village.vision && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm mb-2">Vision</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{village.vision}</p>
                </div>
              )}
              {village.challenges && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm mb-2">Challenges</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{village.challenges}</p>
                </div>
              )}
              {village.achievements && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm mb-2">Achievements</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{village.achievements}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="bg-white rounded-xl border border-border p-6 max-w-xl">
              <h3 className="font-heading font-bold text-lg mb-4">Location</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'State', value: safeText(village.state) },
                  { label: 'District', value: safeText(village.district) },
                  { label: 'Mandal', value: safeText(village.mandal) },
                  { label: 'Pincode', value: village.pincode },
                  { label: 'Village Code', value: village.village_code },
                ].map(item => item.value ? (
                  <div key={item.label} className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ) : null)}
                {!safeText(village.state) && !safeText(village.district) && !safeText(village.mandal) && !village.pincode && !village.village_code && (
                  <p className="text-muted-foreground text-sm">Location details not yet available for this village.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Population Statistics</h3>
                {village.population > 0 && (
                  <>
                    <div className="text-3xl font-bold text-primary mb-1">{village.population.toLocaleString('en-IN')}</div>
                    <div className="text-sm text-muted-foreground mb-4">Total Population</div>
                    {village.male_population > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Male</span><span className="font-medium">{village.male_population.toLocaleString('en-IN')}</span></div>
                        <Progress value={village.population > 0 ? (village.male_population / village.population) * 100 : 0} className="h-2" />
                        <div className="flex justify-between text-sm"><span>Female</span><span className="font-medium">{(village.female_population || 0).toLocaleString('en-IN')}</span></div>
                        <Progress value={village.population > 0 ? ((village.female_population || 0) / village.population) * 100 : 0} className="h-2 [&>div]:bg-pink-500" />
                      </div>
                    )}
                    {village.literacy_rate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Literacy Rate</span><span className="font-bold text-primary">{village.literacy_rate}%</span></div>
                        <Progress value={village.literacy_rate} className="h-2 [&>div]:bg-primary" />
                      </div>
                    )}
                  </>
                )}
                {(!village.population || village.population === 0) && (
                  <p className="text-muted-foreground text-sm">Population data not yet available for this village.</p>
                )}
              </div>
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Agriculture & Environment</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Farmer Count', value: village.farmer_count },
                    { label: 'Cultivable Land', value: village.cultivable_land },
                    { label: 'Trees Planted', value: village.trees_count?.toLocaleString('en-IN') },
                    { label: 'Water Bodies', value: village.water_bodies_count },
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

          <TabsContent value="development">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { area: 'Infrastructure', icon: '🏗️', desc: 'Roads, buildings, electricity, sanitation' },
                { area: 'Education', icon: '📚', desc: `${village.schools_count || 0} schools registered` },
                { area: 'Agriculture', icon: '🌾', desc: `${village.farmer_count || 0} farmers, ${village.cultivable_land || 'data pending'}` },
                { area: 'Water Conservation', icon: '💧', desc: `${village.water_bodies_count || 0} water bodies` },
                { area: 'Environment', icon: '🌳', desc: `${village.trees_count || 0} trees planted` },
                { area: 'Healthcare', icon: '🏥', desc: 'Primary healthcare access' },
              ].map(area => (
                <div key={area.area} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all">
                  <div className="text-3xl mb-2">{area.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{area.area}</h4>
                  <p className="text-xs text-muted-foreground">{area.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crops">
            <div className="space-y-4">
              {crops.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {crops.map((crop) => (
                    <div key={crop.id || crop.name} className="bg-white rounded-xl border border-border overflow-hidden">
                      {crop.image && (
                        <img src={crop.image} alt={crop.name} className="h-40 w-full object-cover" />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="font-heading font-bold text-lg">{crop.name}</h4>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            crop.availability === 'in_season' ? 'bg-green-100 text-green-700'
                              : crop.availability === 'harvesting' ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {availabilityLabel(crop.availability)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {crop.price_per_kg !== '' && crop.price_per_kg != null && (
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Price / kg</span>
                              <span className="font-medium">₹{Number(crop.price_per_kg).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {crop.sowing_period && (
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Sowing period</span>
                              <span className="font-medium">{crop.sowing_period}</span>
                            </div>
                          )}
                          {crop.harvest_period && (
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Harvest period</span>
                              <span className="font-medium">{crop.harvest_period}</span>
                            </div>
                          )}
                          {crop.estimated_yield && (
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Estimated yield</span>
                              <span className="font-medium">{crop.estimated_yield}</span>
                            </div>
                          )}
                          {crop.cultivation_area && (
                            <div className="flex justify-between py-1">
                              <span className="text-muted-foreground">Total cultivation area</span>
                              <span className="font-medium">{crop.cultivation_area}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-border p-6">
                  <p className="text-muted-foreground text-sm">No crop information available yet for this village.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-6">Village Development Timeline</h3>
              {timeline.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
                  <div className="space-y-6 pl-12">
                    {timeline.map((event) => (
                      <div key={event.id || `${event.title}-${event.date}`} className="relative">
                        <div className="absolute -left-8 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm border-2 border-white">
                          {event.icon}
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-primary">{formatTimelineDate(event.date)}</span>
                            {event.type && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{event.type}</span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                          {event.desc && <p className="text-xs text-muted-foreground leading-relaxed">{event.desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No timeline events yet. Milestones will appear here once added in admin.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <BeforeAfterGallery gallery={gallery} />
          </TabsContent>

          <TabsContent value="donations">
            <div className="bg-white rounded-xl border border-border p-6">
              {totalDonations > 0 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-donation mb-1">₹{totalDonations.toLocaleString('en-IN')}</div>
                    <div className="text-muted-foreground">Total donations received</div>
                  </div>
                  <div className="space-y-3 max-w-md mx-auto">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Donations Received</span><span className="font-bold">₹{totalDonations.toLocaleString('en-IN')}</span></div>
                      <Progress value={100} className="h-2 [&>div]:bg-green-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Funds Utilized</span><span className="font-bold text-donation">₹{Math.round(totalDonations * 0.7).toLocaleString('en-IN')}</span></div>
                      <Progress value={70} className="h-2 [&>div]:bg-donation" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Remaining</span><span className="font-bold text-projects">₹{Math.round(totalDonations * 0.3).toLocaleString('en-IN')}</span></div>
                      <Progress value={30} className="h-2 [&>div]:bg-projects" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Heart className="w-12 h-12 text-donation/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Be the first to donate to {village.village_name}!</p>
                </div>
              )}
              <div className="text-center mt-6">
                <Link to={`/donate?type=village&village_id=${village.id}`}>
                  <Button className="donation-gradient text-white border-0 px-10 rounded-xl font-semibold">
                    <Heart className="w-4 h-4 mr-2" /> Donate Now
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-2">Village Insights — Progress Statistics</h3>
              <p className="text-sm text-muted-foreground mb-4">Auto-generated from village population, farmer, and volunteer data.</p>
              <VillageInsightsCharts village={village} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}