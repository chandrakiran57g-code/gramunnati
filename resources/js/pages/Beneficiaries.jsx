import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const typeLabels = { village: 'Village', school: 'School', farmer: 'Farmer', student: 'Student', women_shg: 'Women SHG', youth_group: 'Youth Group', artisan: 'Artisan', other: 'Other' };
const typeColors = { village: 'bg-green-100 text-green-700', school: 'bg-blue-100 text-blue-700', farmer: 'bg-yellow-100 text-yellow-700', student: 'bg-purple-100 text-purple-700', women_shg: 'bg-pink-100 text-pink-700', youth_group: 'bg-orange-100 text-orange-700', artisan: 'bg-indigo-100 text-indigo-700', other: 'bg-gray-100 text-gray-700' };

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Beneficiary.filter({ status: 'active' }, '-created_date', 100)
      .then(setBeneficiaries).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? beneficiaries : beneficiaries.filter(b => b.beneficiary_type === filter);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">Beneficiaries</motion.h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">People and communities benefiting from development programs</p>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {Object.entries({ all: 'All', ...typeLabels }).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === key ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-8 animate-pulse">
                  <div className="h-40 bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((b, i) => (
                <motion.div key={b.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/beneficiaries/${b.slug}`}
                    className="block group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full"
                  >
                    <div className="h-44 bg-muted overflow-hidden">
                      {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><Heart className="w-10 h-10 text-muted-foreground/30" /></div>}
                    </div>
                    <div className="p-6">
                      <Badge className={`mb-2 ${typeColors[b.beneficiary_type] || 'bg-gray-100'}`}>
                        {typeLabels[b.beneficiary_type] || b.beneficiary_type}
                      </Badge>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{b.name}</h3>
                      {(b.village_name || b.state) && (
                        <p className="text-xs text-muted-foreground mb-2">{[b.village_name, b.district, b.state].filter(Boolean).join(', ')}</p>
                      )}
                      {b.description && <p className="text-muted-foreground text-sm line-clamp-2">{b.description}</p>}
                      <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
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