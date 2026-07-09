import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, School, Users, FolderOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { needsSupportService } from '@/api/needsSupport';
import { needSupportPagesService } from '@/api/needSupportPages';
import { homeService } from '@/api/home';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import RichContent from '@/components/shared/RichContent';
import { resolveImageUrl } from '@/lib/villageImages';

function linesToList(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) return [raw];
  return raw.split('\n').map((s) => s.trim()).filter(Boolean);
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NeedSupportDetail() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const [card, setCard] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      needsSupportService.listItems({ activeOnly: true }).catch(() => []),
      needSupportPagesService.getPage(slug).catch(() => null),
    ]).then(([items, page]) => {
      if (cancelled) return;
      const found = (items || []).find((i) => i.slug === slug) || null;
      setCard(found);
      setDetail(page);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-background">
        <div>
          <div className="text-6xl mb-4">💚</div>
          <h2 className="font-heading text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">This Need Support page does not exist yet.</p>
          <Link to="/need-support">
            <Button className="brand-gradient text-white border-0">View All</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = localize(card, 'name', lang) || card.name;
  const description = String(localize(card, 'description', lang) || card.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cover = detail?.hero_image || card.cover_image || resolveImageUrl(null, 0, 1200);
  const longDescription = localize(detail, 'long_description', lang) || detail?.long_description || description;
  const objectives = linesToList(localize(detail, 'objectives', lang) || detail?.objectives);
  const activities = linesToList(localize(detail, 'activities', lang) || detail?.activities);
  const impact = linesToList(localize(detail, 'impact_highlights', lang) || detail?.impact_highlights);
  const gallery = linesToList(detail?.gallery_images);
  const target = Number(card.funding_goal || 0);
  const raised = Number(card.raised_amount || 0);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const stats = {
    villages: detail?.stats?.villages ?? 0,
    schools: detail?.stats?.schools ?? 0,
    volunteers: detail?.stats?.volunteers ?? 0,
    donations: detail?.stats?.donations ?? raised,
  };
  const donateHref = `/donate?project_slug=${encodeURIComponent(card.slug)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={cover} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-900/90 via-brown-900/40 to-brown-900/20" />
        <div className="absolute bottom-8 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6">
          <Link to="/need-support" className="inline-flex items-center gap-1 text-cream-100/80 hover:text-cream-50 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Need Support
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#8B6914] mb-3">
              Needs Support
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-cream-50 mb-3">{title}</h1>
            {description && <p className="text-cream-100/90 text-base max-w-2xl">{description}</p>}
            {card.village_name && (
              <p className="text-cream-100/70 text-sm mt-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {card.village_name}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {(target > 0 || raised > 0) && (
          <div className="bg-white rounded-xl border border-brown-300 p-5 mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Raised {homeService.formatINR(raised)}</span>
              {target > 0 && <span>Goal {homeService.formatINR(target)}</span>}
            </div>
            <div className="home-progress-bar">
              <div className="home-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Villages Impacted', value: stats.villages, icon: MapPin },
            { label: 'Schools Impacted', value: stats.schools, icon: School },
            { label: 'Volunteers', value: stats.volunteers, icon: Users },
            { label: 'Donations Raised', value: stats.donations >= 100000 ? `₹${(stats.donations / 100000).toFixed(1)}L` : `₹${Number(stats.donations).toLocaleString('en-IN')}`, icon: Heart },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-brown-300 p-4 text-center">
              <stat.icon className="w-5 h-5 text-[#8B6914] mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <Link to={donateHref}>
            <Button className="bg-[#8B6914] text-white border-0 px-12 py-3 rounded-xl font-semibold text-lg hover:opacity-90">
              <Heart className="w-5 h-5 mr-2" /> {t('home.supportNow') || 'Support Now'}
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
              <RichContent content={longDescription} />
            </div>
          </TabsContent>

          <TabsContent value="objectives">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Objectives</h3>
              {objectives.length ? (
                objectives.some((o) => /<\/?[a-z][\s\S]*>/i.test(o)) ? (
                  <RichContent content={objectives.join('\n')} />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {objectives.map((obj) => (
                      <div key={obj} className="flex items-start gap-3 bg-cream-100 rounded-xl p-4">
                        <Target className="w-5 h-5 text-[#8B6914] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{stripHtml(obj)}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-muted-foreground text-sm">Objectives will appear once added in Admin → Need Support → Detail Pages.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Key Activities</h3>
              {activities.length ? (
                activities.some((a) => /<\/?[a-z][\s\S]*>/i.test(a)) ? (
                  <RichContent content={activities.join('\n')} />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activities.map((act) => (
                      <div key={act} className="bg-cream-50 rounded-xl p-4 text-sm font-medium flex items-center gap-2 border border-cream-300">
                        <FolderOpen className="w-4 h-4 text-[#8B6914] flex-shrink-0" />
                        {stripHtml(act)}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-muted-foreground text-sm">Activities will appear once added in Admin.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="bg-white rounded-xl border border-brown-300 p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Impact Highlights</h3>
              {impact.length ? (
                impact.some((i) => /<\/?[a-z][\s\S]*>/i.test(i)) ? (
                  <RichContent content={impact.join('\n')} />
                ) : (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {impact.map((item) => <li key={item}>• {stripHtml(item)}</li>)}
                  </ul>
                )
              ) : (
                <p className="text-muted-foreground text-sm">Impact highlights coming soon.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[cover, ...gallery].filter(Boolean).map((img, i) => (
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
