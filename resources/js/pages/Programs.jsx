import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cmsService } from '@/api/cms';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { stripHtml } from '@/lib/stripHtml';

export default function Programs() {
  const { lang } = useLanguage();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.listPrograms({ activeOnly: true })
      .then((rows) => setPrograms((rows || []).filter((p) => p.status === 'active')))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="brand-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-cream-50">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">What We Do</h1>
            <p className="text-cream-100/90 max-w-2xl mx-auto">Programs creating lasting change across rural India</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Program cards will appear here once added in Admin → What We Do → Cards.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {programs.map((prog, i) => {
              const title = localize(prog, 'title', lang) || prog.title;
              const description = localize(prog, 'description', lang) || prog.description || '';
              const icon = prog.icon || '🌾';
              return (
                <motion.div
                  key={prog.slug || prog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group bg-white rounded-2xl border border-brown-300 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link to={`/programs/${prog.slug}`}>
                    <div className="w-14 h-14 bg-cream-200 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                      {String(icon).startsWith('http') ? <img src={icon} alt="" className="h-full w-full object-cover" /> : icon}
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-4">{stripHtml(description)}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link to={`/programs/${prog.slug}`}>
                      <Button size="sm" variant="outline" className="w-full text-xs border-brown-300 text-foreground">
                        Learn More <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                    <Link to={`/donate?program=${prog.slug}`}>
                      <Button size="sm" className="w-full bg-service-agriculture text-white border-0 text-xs hover:opacity-90">
                        <Heart className="w-3 h-3 mr-1" /> Support This Program
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
