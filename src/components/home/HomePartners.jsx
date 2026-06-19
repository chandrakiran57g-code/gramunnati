import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePartners({ partners = [], loading }) {
  if (!loading && partners.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#F5E6C8]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10">
        <h2 className="font-heading font-bold text-[#3D2914] text-xl sm:text-2xl mb-2">
          Saath mein kaam karne wale
        </h2>
        <p className="text-[#5C4033]/60 text-sm font-body">Partner organizations jo gaon ke vikas mein judi hain</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 sm:gap-12">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="w-24 h-12 bg-[#E8DFD0] rounded animate-pulse" />
            ))
          : partners.slice(0, 8).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={p.slug ? `/partners/${p.slug}` : '/partners'}
                  className="home-partner-logo flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                >
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="h-10 sm:h-12 w-auto max-w-[120px] object-contain grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <span className="font-heading font-semibold text-[#5C4033]/80 text-sm">{p.name}</span>
                  )}
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
