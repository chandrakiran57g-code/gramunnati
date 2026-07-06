import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

function ProgramCard({ program, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), { stiffness: 180, damping: 22 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <>
      <span className="text-3xl sm:text-4xl mb-4 block">{program.icon}</span>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#3D2914] mb-2">{program.title}</h3>
      <p className="text-sm text-[#5C4033]/80 leading-relaxed flex-1 font-body">{program.description}</p>
    </>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`home-program-card ${program.tone} ${program.span || 'lg:col-span-1'}`}
    >
      {program.slug ? (
        <Link to={`/programs/${program.slug}`} className="flex flex-col h-full">{content}</Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

export default function ProgramsBento({ programs = [], loading }) {
  if (!loading && programs.length === 0) return null;
  const display = programs;

  return (
    <section className="py-24 sm:py-28 home-programs-section relative overflow-hidden">
      <div className="absolute inset-0 home-programs-texture pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2
              className="font-heading font-bold text-[#3D2914] mb-3 text-balance"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
            >
              What We Do
            </h2>
            <p className="text-[#5C4033]/75 max-w-lg text-pretty font-body">
              {loading ? 'Loading…' : 'Programs creating lasting change across rural India'}
            </p>
          </motion.div>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-[#8B4513] hover:text-[#6B3410] font-semibold text-sm transition-colors group shrink-0"
          >
            View all programs
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-[#E8DFD0]/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)] [perspective:900px]">
            {display.map((program, i) => (
              <ProgramCard key={program.id || program.title} program={program} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
