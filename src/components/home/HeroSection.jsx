import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, School, TreePine } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80')] bg-cover bg-center opacity-20" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-donation/10 rounded-full blur-3xl" />

      {/* Main content - centered vertically with flex-1 */}
      <div className="relative flex-1 flex items-center w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                <span className="w-2 h-2 bg-donation rounded-full animate-pulse" />
                "Our Village – Our Responsibility – Our Development"
              </span>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
                Empowering{' '}
                <span className="text-donation">Villages</span>
                {' & '}
                <span className="text-blue-300">Schools</span>
                {' '}Across India
              </h1>

              <p className="text-lg text-white/80 leading-relaxed mb-7">
                A nationwide platform connecting citizens, volunteers, donors, and organizations to 
                build sustainable, self-reliant villages and empowered schools.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/villages"
                  className="inline-flex items-center gap-2 px-6 py-3 village-gradient text-white font-semibold rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-village/30"
                >
                  <TreePine className="w-4 h-4" />
                  Explore Villages
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/schools"
                  className="inline-flex items-center gap-2 px-6 py-3 school-gradient text-white font-semibold rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-school/30"
                >
                  <School className="w-4 h-4" />
                  Explore Schools
                </Link>
                <Link to="/donate"
                  className="inline-flex items-center gap-2 px-6 py-3 donation-gradient text-white font-semibold rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-donation/30"
                >
                  <Heart className="w-4 h-4" />
                  Donate Now
                </Link>
                <Link to="/volunteer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/25 transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Become Volunteer
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - pinned to bottom */}
      <div className="relative pb-6 flex justify-center">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 text-white/50 text-xs"
        >
          <span>Scroll to explore</span>
          <div className="w-6 h-9 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}