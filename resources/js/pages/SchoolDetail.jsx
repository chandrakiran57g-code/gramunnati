import { useState, useEffect } from 'react';
import { safeText } from '@/lib/safeText';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { MapPin, Users, BookOpen, Heart, ChevronLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import BeforeAfterGallery from '@/components/shared/BeforeAfterGallery';
import { groupGalleryRows } from '@/lib/beforeAfterGallery';
import RichContent from '@/components/shared/RichContent';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const schoolTypeLabel = { government: 'Government', private: 'Private', aided: 'Aided', model: 'Model School' };
const schoolTypeColor = { government: 'bg-primary/10 text-primary', private: 'bg-school/10 text-school', aided: 'bg-purple-100 text-purple-700', model: 'bg-donation/10 text-donation' };

export default function SchoolDetail() {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [gallery, setGallery] = useState({ before: [], after: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.School.list('-created_date', 200)
      .then(async (all) => {
        const found = all.find(s => s.slug === slug || s.id === slug || s.school_name?.toLowerCase().replace(/\s+/g, '-') === slug);
        setSchool(found || null);
        if (found?.id) {
          const { data } = await supabase
            .from('galleries')
            .select('*')
            .eq('galleryable_type', 'school')
            .eq('galleryable_id', found.id)
            .order('sort_order', { ascending: true });
          setGallery(groupGalleryRows(data));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-school/30 border-t-school rounded-full animate-spin" /></div>;

  if (!school) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🏫</div>
        <h2 className="font-heading text-2xl font-bold mb-2">School Not Found</h2>
        <p className="text-muted-foreground mb-6">This school hasn't been registered yet.</p>
        <Link to="/schools"><Button className="school-gradient text-white border-0">Browse Schools</Button></Link>
      </div>
    </div>
  );

  const infra = [
    { label: 'Library', value: school.library_available },
    { label: 'Computer Lab', value: school.computer_lab_available },
    { label: 'Playground', value: school.playground_available },
    { label: 'Drinking Water', value: school.drinking_water_available },
    { label: 'Toilets', value: school.toilet_available },
    { label: 'Electricity', value: school.electricity_available },
    { label: 'Digital Classroom', value: school.digital_classroom_available },
    { label: 'Boundary Wall', value: school.boundary_wall_available },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src={school.cover_image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80'} alt={school.school_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Link to="/schools" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3"><ChevronLeft className="w-4 h-4" /> Back to Schools</Link>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/90 ${schoolTypeColor[school.school_type]}`}>{schoolTypeLabel[school.school_type]}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">{school.school_name}</h1>
            <div className="text-white/80 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{safeText(school.village_name)}, {safeText(school.district)}, {safeText(school.state)}</div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-school">{school.student_count?.toLocaleString('en-IN') || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Students</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{school.teacher_count || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Teachers</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-projects">{school.classroom_count || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Classrooms</div>
          </div>
        </div>

        {/* Development Score Radar */}
        <div className="bg-white rounded-xl border border-border p-5 mb-6">
          <h3 className="font-heading font-bold text-lg mb-2">School Development Score</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={[
              { subject: 'Infrastructure', score: Math.min(100, infra.filter(i => i.value).length * 12.5 + 10), fullMark: 100 },
              { subject: 'Academics', score: Math.min(100, ((school.student_count || 0) * 0.02 + (school.teacher_count || 0) * 2)), fullMark: 100 },
              { subject: 'Digital', score: (school.digital_classroom_available ? 60 : 20) + (school.computer_lab_available ? 40 : 0), fullMark: 100 },
              { subject: 'Facilities', score: (school.library_available ? 25 : 0) + (school.playground_available ? 25 : 0) + (school.drinking_water_available ? 25 : 0) + (school.toilet_available ? 25 : 0), fullMark: 100 },
              { subject: 'Safety', score: (school.boundary_wall_available ? 50 : 20) + (school.electricity_available ? 50 : 0), fullMark: 100 },
            ]}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3 mb-8">
          <Link to={`/donate?type=school&school_id=${school.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full donation-gradient text-white border-0 font-semibold rounded-xl">
              <Heart className="w-4 h-4 mr-2" /> Support This School
            </Button>
          </Link>
          <Button variant="outline" className="border-school text-school hover:bg-school hover:text-white rounded-xl">
            <Star className="w-4 h-4 mr-1.5" /> Follow School
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-muted w-full justify-start overflow-x-auto flex gap-1 h-auto p-1 rounded-xl mb-6">
            {['overview','infrastructure','academics','requirements','timeline','gallery','donations'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm py-2 px-3 whitespace-nowrap">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-heading font-bold mb-3">School Information</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'School Name', value: school.school_name },
                    { label: 'Type', value: schoolTypeLabel[school.school_type] },
                    { label: 'UDISE Code', value: school.udise_code },
                    { label: 'Village', value: school.village_name },
                    { label: 'District', value: safeText(school.district) },
                    { label: 'State', value: safeText(school.state) },
                  ].map(item => item.value && (
                    <div key={item.label} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-heading font-bold mb-3">Administration</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Principal', value: school.principal_name },
                    { label: 'Contact', value: school.contact_number },
                    { label: 'Email', value: school.email },
                    { label: 'Website', value: school.website },
                  ].map(item => item.value && (
                    <div key={item.label} className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  {!school.principal_name && <p className="text-muted-foreground text-xs">Contact information not yet available.</p>}
                </div>
              </div>
            </div>
            {(school.description || school.vision || school.challenges || school.achievements) && (
              <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                {school.description && (
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2">About {school.school_name}</h3>
                    <RichContent content={school.description} className="text-muted-foreground leading-relaxed text-sm" />
                  </div>
                )}
                {school.vision && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">Vision</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{school.vision}</p>
                  </div>
                )}
                {school.challenges && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">Challenges</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{school.challenges}</p>
                  </div>
                )}
                {school.achievements && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">Achievements</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{school.achievements}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="infrastructure">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Infrastructure Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {infra.map(item => (
                  <div key={item.label} className={`rounded-xl p-4 border text-center ${item.value ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {item.value
                      ? <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      : <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    }
                    <div className={`text-xs font-medium ${item.value ? 'text-green-700' : 'text-red-600'}`}>{item.label}</div>
                    <div className={`text-xs mt-0.5 ${item.value ? 'text-green-600' : 'text-red-500'}`}>{item.value ? 'Available' : 'Not Available'}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academics">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Academic Information</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Students', value: school.student_count?.toLocaleString('en-IN') || '—', color: 'text-school' },
                  { label: 'Teaching Staff', value: school.teacher_count || '—', color: 'text-primary' },
                  { label: 'Classrooms', value: school.classroom_count || '—', color: 'text-projects' },
                ].map(item => (
                  <div key={item.label} className="text-center bg-muted/50 rounded-xl p-5">
                    <div className={`text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-4">School Requirements</h3>
              <p className="text-muted-foreground text-sm mb-4">Items needed by this school. Your donation can help fulfill these requirements.</p>
              {[
                { name: 'Furniture', needed: 50000, raised: 20000 },
                { name: 'Computers', needed: 150000, raised: 45000 },
                { name: 'Books & Stationery', needed: 30000, raised: 15000 },
                { name: 'Infrastructure Repairs', needed: 80000, raised: 10000 },
                { name: 'Sports Equipment', needed: 20000, raised: 8000 },
                { name: 'Science Lab Equipment', needed: 60000, raised: 0 },
              ].map((req, i) => {
                const pct = req.needed > 0 ? Math.round((req.raised / req.needed) * 100) : 0;
                return (
                  <div key={req.name} className="py-3 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{req.name}</span>
                      <span className="text-xs text-muted-foreground">₹{req.raised.toLocaleString('en-IN')} / ₹{req.needed.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold w-8 text-right">{pct}%</span>
                      <Link to={`/donate?type=school&school_id=${school.id}`}>
                        <Button size="sm" variant="outline" className="text-xs border-donation text-donation hover:bg-donation hover:text-white h-7 px-2">Donate</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-6">School Development Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-school/20" />
                <div className="space-y-6 pl-12">
                  {[
                    { date: 'Jun 2026', title: 'School Registered on CMSR', desc: `${school.school_name} was officially registered on the CMSR digital platform.`, type: 'milestone', icon: '🏫' },
                    { date: 'May 2026', title: 'Infrastructure Audit Completed', desc: 'Full audit of existing infrastructure completed — library, computer lab, playground status documented.', type: 'assessment', icon: '📋' },
                    { date: 'Apr 2026', title: 'First Digital Classroom Initiated', desc: 'Planning began for the first digital classroom setup with smart board and internet connectivity.', type: 'education', icon: '💻' },
                    { date: 'Mar 2026', title: 'Teacher Training Workshop', desc: '12 teachers attended a professional development workshop on digital teaching tools.', type: 'education', icon: '👩‍🏫' },
                    { date: 'Feb 2026', title: 'Enrollment Drive', desc: `Community-led enrollment drive brought ${school.student_count || 'hundreds of'} students to the school.`, type: 'community', icon: '📣' },
                  ].map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 w-8 h-8 bg-school/10 rounded-full flex items-center justify-center text-sm border-2 border-white">{event.icon}</div>
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-school">{event.date}</span>
                          <span className="text-xs bg-school/10 text-school px-2 py-0.5 rounded-full capitalize">{event.type}</span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <BeforeAfterGallery gallery={gallery} />
          </TabsContent>

          <TabsContent value="donations">
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <Heart className="w-12 h-12 text-donation/30 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-xl mb-2">Support {school.school_name}</h3>
              <p className="text-muted-foreground text-sm mb-6">Your donation directly helps provide better education resources to {school.student_count || 'hundreds of'} students.</p>
              <Link to={`/donate?type=school&school_id=${school.id}`}>
                <Button className="donation-gradient text-white border-0 px-10 rounded-xl font-semibold">
                  <Heart className="w-4 h-4 mr-2" /> Donate to This School
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}