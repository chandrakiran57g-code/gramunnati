import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, ArrowRight } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function Teams() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TeamGroup.filter({ status: 'active' }, 'display_order', 50)
      .then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Our Teams
            </motion.h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Meet the dedicated individuals driving change across rural India
            </p>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-8 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, i) => (
                <motion.div key={group.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                >
                  <Link to={`/teams/${group.slug}`}
                    className="block group bg-white rounded-2xl border border-border p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {group.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      View Members <ArrowRight className="w-4 h-4" />
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