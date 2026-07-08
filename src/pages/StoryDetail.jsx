import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Calendar, MapPin, School, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function StoryDetail() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stories = await base44.entities.SuccessStory.list('-created_date', 50).catch(() => []);
      const found = stories.find(s => s.slug === slug || s.id === slug || s.title?.toLowerCase().replace(/\s+/g, '-') === slug);
      setStory(found || null);
      setRelated(found ? stories.filter(s => s.id !== found.id).slice(0, 3) : []);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!story) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">📖</div>
        <h2 className="font-heading text-2xl font-bold mb-2">Story Not Found</h2>
        <Link to="/stories"><Button className="brand-gradient text-white border-0">Browse Stories</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroScrollSection size="detail">
        <div className="relative h-64 sm:h-96 overflow-hidden">
          <img src={story.featured_image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80'} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 max-w-3xl">
            <Link to="/stories" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3"><ArrowLeft className="w-4 h-4" /> Back to Stories</Link>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-3">{story.title}</h1>
            {story.summary && <p className="text-white/80 text-sm max-w-2xl">{story.summary}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-white/70 text-sm">
              {story.published_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(story.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              {story.village_name && <Badge className="bg-white/20 text-white border-0"><MapPin className="w-3 h-3 mr-1" />{story.village_name}</Badge>}
              {story.school_name && <Badge className="bg-white/20 text-white border-0"><School className="w-3 h-3 mr-1" />{story.school_name}</Badge>}
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {story.content || 'Story content coming soon.'}
                </div>
              </motion.div>
            </div>

            {/* Impact Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Village', value: story.village_name || 'N/A', icon: MapPin, color: 'text-primary', bg: 'bg-primary/5' },
                { label: 'School', value: story.school_name || 'N/A', icon: School, color: 'text-school', bg: 'bg-school/5' },
                { label: 'Published', value: story.published_at ? new Date(story.published_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar, color: 'text-donation', bg: 'bg-donation/5' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                  <item.icon className={`w-4 h-4 ${item.color} mx-auto mb-1`} />
                  <div className="text-xs font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h4 className="font-heading font-bold mb-3">Share This Story</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs"><Share2 className="w-3 h-3 mr-1" /> Share</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">Copy Link</Button>
              </div>
            </div>

            {/* Support CTA */}
            <div className="bg-white rounded-2xl border border-border p-5 text-center">
              <Heart className="w-10 h-10 text-donation/40 mx-auto mb-3" />
              <h4 className="font-heading font-bold mb-2">Make a Difference</h4>
              <p className="text-muted-foreground text-xs mb-4">Support more stories like this one.</p>
              <Link to="/donate"><Button className="donation-gradient text-white border-0 w-full">Donate Now</Button></Link>
            </div>

            {/* Related Stories */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="font-heading font-bold mb-4">Related Stories</h4>
                <div className="space-y-3">
                  {related.map(r => (
                    <Link key={r.id} to={`/stories/${r.slug || r.id}`} className="flex gap-3 group">
                      <img src={r.featured_image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&q=60'} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">{r.title}</h5>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.village_name || 'CMSR'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}