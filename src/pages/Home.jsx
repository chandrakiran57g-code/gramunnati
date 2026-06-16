import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/home/HeroSection';

import SearchSection from '@/components/home/SearchSection';
import ImpactCharts from '@/components/home/ImpactCharts';
import LiveActivityFeed from '@/components/home/LiveActivityFeed';
import VillageCard from '@/components/shared/VillageCard';
import SchoolCard from '@/components/shared/SchoolCard';
import ProjectCard from '@/components/shared/ProjectCard';
import { ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const programs = [
  { title: 'Village Development', icon: '🏘️', color: 'bg-village', description: 'Infrastructure, roads, water supply, electricity and more for rural villages.' },
  { title: 'School Development', icon: '🏫', color: 'bg-school', description: 'Digital classrooms, furniture, books, labs and teacher training programs.' },
  { title: 'Tree Plantation', icon: '🌳', color: 'bg-green-600', description: 'Massive tree plantation drives to create green, eco-friendly villages.' },
  { title: 'Water Conservation', icon: '💧', color: 'bg-cyan-600', description: 'Groundwater recharge, bore wells, and water harvesting structures.' },
  { title: 'Agriculture', icon: '🌾', color: 'bg-yellow-600', description: 'Modern farming techniques, equipment and market linkages for farmers.' },
  { title: 'Women SHGs', icon: '👩‍👩‍👧', color: 'bg-pink-600', description: 'Empowering women through self-help groups, skills and microfinance.' },
  { title: 'Healthcare', icon: '🏥', color: 'bg-red-600', description: 'Primary healthcare, medical camps, and health awareness programs.' },
  { title: 'Skill Development', icon: '🎓', color: 'bg-purple-600', description: 'Youth skill development, vocational training, and employment generation.' },
];

const testimonials = [
  { name: 'Lakshmi Devi', village: 'Kondapur, Telangana', message: 'Thanks to GramUnnati, our village school now has a digital classroom. Our children can now compete with city kids.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80' },
  { name: 'Raju Farmer', village: 'Nalgonda, Telangana', message: 'The water conservation project helped us recharge our bore wells. Now we have water year-round for our crops.', photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80' },
  { name: 'Priya Teacher', village: 'Warangal, Telangana', message: 'GramUnnati connected us with donors who provided books and stationery for 200 students. The joy on their faces was priceless.', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80' },
];

export default function Home() {
  const [villages, setVillages] = useState([]);
  const [schools, setSchools] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    base44.entities.Village.filter({ is_featured: true }, '-created_date', 6).then(setVillages).catch(() => {});
    base44.entities.School.filter({ is_featured: true }, '-created_date', 6).then(setSchools).catch(() => {});
    base44.entities.Project.filter({ status: 'active' }, '-created_date', 6).then(setProjects).catch(() => {});
  }, []);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <SearchSection />

      {/* Featured Villages */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest text-village uppercase mb-2 block">🏘️ Villages Module</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Featured Villages</h2>
              <p className="text-muted-foreground mt-2">Discover villages building a better tomorrow</p>
            </div>
            <Link to="/villages" className="hidden sm:flex items-center gap-2 text-village hover:text-village-light font-semibold text-sm transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {villages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {villages.map((v, i) => <VillageCard key={v.id} village={v} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/villages">
              <Button variant="outline" className="border-village text-village hover:bg-village hover:text-white">
                Explore All Villages <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      <section className="py-20 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest text-school uppercase mb-2 block">🏫 Schools Module</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Featured Schools</h2>
              <p className="text-muted-foreground mt-2">Schools building the future of rural India</p>
            </div>
            <Link to="/schools" className="hidden sm:flex items-center gap-2 text-school hover:text-school-light font-semibold text-sm transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {schools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((s, i) => <SchoolCard key={s.id} school={s} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/schools">
              <Button variant="outline" className="border-school text-school hover:bg-school hover:text-white">
                Explore All Schools <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Projects */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest text-projects uppercase mb-2 block">📋 Projects Module</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Current Projects</h2>
              <p className="text-muted-foreground mt-2">Active development projects needing your support</p>
            </div>
            <Link to="/projects" className="hidden sm:flex items-center gap-2 text-projects hover:text-purple-800 font-semibold text-sm transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-village uppercase mb-2 block">Our Programs</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">How We Help</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Eight pillars of rural development driving sustainable change across India</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {programs.map((prog, i) => (
              <motion.div
                key={prog.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group text-center p-5 rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`w-14 h-14 ${prog.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {prog.icon}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{prog.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">{prog.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/programs">
              <Button variant="outline" className="border-village text-village hover:bg-village hover:text-white">
                View All Programs <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Charts */}
      <ImpactCharts />

      {/* Live Activity */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-4">
                <h2 className="font-heading text-2xl font-bold">Live Impact Feed</h2>
                <p className="text-muted-foreground text-sm">Real-time updates from the field</p>
              </motion.div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: '₹1,23,456', subtitle: 'Total Raised This Month', icon: '💛', color: 'bg-donation/10 border-donation/20' },
                  { title: '247', subtitle: 'Active Volunteers Nationwide', icon: '🌱', color: 'bg-volunteer/10 border-volunteer/20' },
                  { title: '12,500', subtitle: 'Trees Planted This Season', icon: '🌳', color: 'bg-green-50 border-green-200' },
                  { title: '38', subtitle: 'Active Development Projects', icon: '📋', color: 'bg-projects/10 border-projects/20' },
                ].map(card => (
                  <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className={`${card.color} border rounded-2xl p-5 flex items-center gap-4`}>
                    <span className="text-3xl">{card.icon}</span>
                    <div>
                      <div className="text-2xl font-bold">{card.title}</div>
                      <div className="text-sm text-muted-foreground">{card.subtitle}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <LiveActivityFeed />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-village to-village-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">Success Stories</h2>
            <p className="text-white/70 max-w-xl mx-auto">Real impact. Real lives. Real change.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <Quote className="w-8 h-8 text-donation mb-4 opacity-80" />
                <p className="text-white/90 text-sm leading-relaxed mb-6 italic">"{t.message}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-white/60 text-xs">{t.village}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/stories">
              <Button className="bg-white text-village hover:bg-white/90 font-semibold">
                View All Stories <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Donate */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Together, We Can Transform Rural India
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your contribution — big or small — directly impacts a village, a school, a child's future. 
              Join thousands of changemakers who believe in the power of community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <Button size="lg" className="donation-gradient text-white border-0 px-10 font-semibold rounded-full hover:opacity-90">
                  💛 Donate Now
                </Button>
              </Link>
              <Link to="/volunteer">
                <Button size="lg" variant="outline" className="border-village text-village hover:bg-village hover:text-white rounded-full px-10">
                  Become a Volunteer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}