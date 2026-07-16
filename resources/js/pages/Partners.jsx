import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LogoCloud } from '@/components/partners/LogoCloud';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowRight } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { stripHtml } from '@/lib/stripHtml';
import { PARTNER_TYPE_OPTIONS, PARTNER_TYPE_COLORS, partnerTypeLabel } from '@/lib/partnerTypes';
import { useLocalize } from '@/lib/localizedContent';

export default function Partners() {
  const localize = useLocalize();
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Partner.filter({ is_active: true }, '-created_date', 100)
      .then(setPartners).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? partners : partners.filter(p => p.partner_type === filter);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Partner Organizations
            </motion.h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Organizations, institutions, and individuals collaborating to transform rural India
            </p>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {[['all', 'All'], ...PARTNER_TYPE_OPTIONS.map(({ value, label }) => [value, label])].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === key ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >{label}</button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <LogoCloud
              logos={filtered.map((p) => ({
                id: p.id,
                name: p.name,
                src: p.logo,
                alt: p.name,
                website: p.website,
              }))}
            />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-8 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((partner, i) => (
                <motion.div key={partner.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/partners/${partner.slug}`}
                    className="block group bg-white rounded-2xl border border-border p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{localize(partner, 'name') || partner.name}</h3>
                        <Badge className={`mt-1.5 ${PARTNER_TYPE_COLORS[partner.partner_type] || 'bg-gray-100'}`}>
                          {partnerTypeLabel(partner.partner_type)}
                        </Badge>
                      </div>
                    </div>
                    {partner.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">{stripHtml(localize(partner, 'description') || partner.description)}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}