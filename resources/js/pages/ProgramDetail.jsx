import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, School, Users, FolderOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cmsService } from '@/api/cms';
import { programPagesService } from '@/api/programPages';
import { getProgramBySlug, PROGRAMS as STATIC_PROGRAMS } from '@/lib/programs';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';

function linesToList(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeProgram(cmsRow, detailPage, staticFallback) {
  const slug = cmsRow?.slug || staticFallback?.slug;
  const title = cmsRow?.title || staticFallback?.title || slug;
  const description = cmsRow?.description || staticFallback?.description || '';
  const cover = detailPage?.hero_image || cmsRow?.cover_image || staticFallback?.cover || '/hero/village.jpg';
  const longDescription = localize(detailPage, 'long_description') || detailPage?.long_description || staticFallback?.longDescription || description;
  const objectives = linesToList(localize(detailPage, 'objectives') || detailPage?.objectives).length
    ? linesToList(localize(detailPage, 'objectives') || detailPage?.objectives)
    : staticFallback?.objectives || [];
  const activities = linesToList(localize(detailPage, 'activities') || detailPage?.activities).length
    ? linesToList(localize(detailPage, 'activities') || detailPage?.activities)
    : staticFallback?.activities || [];
  const impact = linesToList(localize(detailPage, 'impact_highlights') || detailPage?.impact_highlights).length
    ? linesToList(localize(detailPage, 'impact_highlights') || detailPage?.impact_highlights)
    : staticFallback?.impact || [];
  const stats = {
    villages: detailPage?.stats?.villages ?? staticFallback?.stats?.villages ?? 0,
    schools: detailPage?.stats?.schools ?? staticFallback?.stats?.schools ?? 0,
    volunteers: detailPage?.stats?.volunteers ?? staticFallback?.stats?.volunteers ?? 0,
    donations: detailPage?.stats?.donations ?? staticFallback?.stats?.donations ?? 0,
  };
  const gallery = linesToList(detailPage?.gallery_images);
  const stories = gallery.length
    ? gallery.map((src, i) => ({ title: `Gallery ${i + 1}`, desc: '', img: src }))
    : staticFallback?.stories || [{ title, desc: description, img: cover }];

  return {
    slug,
    title: localize(cmsRow, 'title') || title,
    description: localize(cmsRow, 'description') || description,
    icon: cmsRow?.icon || staticFallback?.icon || '🌾',
    cover,
    longDescription,
    objectives,
    activities,
    impact,
    stats,
    stories,
    color: staticFallback?.color || 'bg-service-agriculture',
    lightColor: staticFallback?.lightColor || 'bg-cream-100',
    textColor: staticFallback?.textColor || 'text-service-agriculture',
  };
}

export default function ProgramDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      cmsService.listPrograms({ activeOnly: true }).catch(() => []),
      programPagesService.getPage(slug).catch(() => null),
    ]).then(([programs, detailPage]) => {
      if (cancelled) return;
      const cmsRow = (programs || []).find((p) => p.slug === slug);
      const staticFallback = getProgramBySlug(slug);
      if (cmsRow || staticFallback) {
        setProgram(mergeProgram(cmsRow, detailPage, staticFallback));
      } else {
        setProgram(null);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-background">
        <div>
          <div className="text-6xl mb-4">📂</div>
          <h2 className="font-heading text-2xl font-bold mb-2">Program Not Found</h2>
          <p className="text-muted-foreground mb-6">This program page does not exist yet.</p>
          <Link to="/programs">
            <Button className="brand-gradient text-white border-0">View All Programs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={program.cover} alt={program.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-900/90 via-brown-900/40 to-brown-900/20" />
        <div className="absolute bottom-8 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6">
          <Link to="/programs" className="inline-flex items-center gap-1 text-cream-100/80 hover:text-cream-50 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Programs
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${program.color} mb-3`}>
              {program.icon} Program
            </span>
            <h1 className={`font-heading text-3xl sm:text-4xl font-bold text-cream-50 mb-3 ${program.textColor}`}>
              {program.title}
            </h1>
            <p className="text-cream-100/90 text-base max-w-2xl">{program.description}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Villages Impacted', value: program.stats.villages, icon: MapPin, color: program.textColor },
            { label: 'Schools Impacted', value: program.stats.schools, icon: School, color: 'text-service-school' },
            { label: 'Volunteers', value: program.stats.volunteers, icon: Users, color: 'text-service-tree' },
            { label: 'Donations Raised', value: program.stats.donations >= 100000 ? `₹${(program.stats.donations / 100000).toFixed(1)}L` : `₹${Number(program.stats.donations).toLocaleString('en-IN')}`, icon: Heart, color: 'text-service-agriculture' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-brown-300 p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {program.impact.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {program.impact.map((item) => (
              <span key={item} className={`text-xs font-medium px-3 py-1.5 rounded-full ${program.lightColor} ${program.textColor}`}>
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="text-center mb-10">
          <Link to={`/donate?program=${program.slug}`}>
            <Button className={`${program.color} text-white border-0 px-12 py-3 rounded-xl font-semibold text-lg hover:opacity-90`}>
              <Heart className="w-5 h-5 mr-2" /> Support This Program
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-cream-100 w-full justify-start overflow-x-auto flex gap-1 h-auto p-1 rounded-xl mb-6 border border-brown-300">
            {['overview', 'objectives', 'activities', 'impact', 'gallery'].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm py-2 px-4 whitespace-nowrap data-[state=active]:bg-white">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-3">About This Program</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{program.longDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="objectives">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Program Objectives</h3>
              {program.objectives.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {program.objectives.map((obj) => (
                    <div key={obj} className={`flex items-start gap-3 ${program.lightColor} rounded-xl p-4`}>
                      <Target className={`w-5 h-5 ${program.textColor} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">{obj}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Objectives will appear here once added in Admin → What We Do → Detail Pages.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Key Activities</h3>
              {program.activities.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {program.activities.map((act) => (
                    <div key={act} className="bg-cream-50 rounded-xl p-4 text-sm font-medium flex items-center gap-2 border border-cream-300">
                      <FolderOpen className={`w-4 h-4 ${program.textColor} flex-shrink-0`} />
                      {act}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Activities will appear here once added in Admin.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Impact Highlights</h3>
              {program.impact.length ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {program.impact.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Impact highlights coming soon.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[program.cover, ...program.stories.map((s) => s.img)].filter(Boolean).map((img, i) => (
                <div key={`${img}-${i}`} className="aspect-square rounded-xl overflow-hidden border border-brown-300">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
