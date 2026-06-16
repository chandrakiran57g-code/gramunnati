import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, TreePine, School, Users, Droplets, Wheat, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";

const pillars = [
  { icon: TreePine, title: 'Village Development', desc: 'Infrastructure improvement, roads, buildings, and community facilities for rural villages.', color: 'bg-village/10 text-village' },
  { icon: School, title: 'School Empowerment', desc: 'Digital classrooms, furniture, books, labs, and teacher training for rural schools.', color: 'bg-school/10 text-school' },
  { icon: TreePine, title: 'Tree Plantation', desc: 'Massive plantation drives creating greener, eco-friendly villages across India.', color: 'bg-green-100 text-green-700' },
  { icon: Droplets, title: 'Water Conservation', desc: 'Bore wells, water harvesting, and groundwater recharge projects.', color: 'bg-cyan-100 text-cyan-700' },
  { icon: Wheat, title: 'Agriculture', desc: 'Modern farming, equipment, and market linkages supporting farmers.', color: 'bg-yellow-100 text-yellow-700' },
  { icon: Handshake, title: 'Women SHGs', desc: 'Empowering women through self-help groups, micro-finance, and skill training.', color: 'bg-pink-100 text-pink-700' },
  { icon: Users, title: 'Skill Development', desc: 'Youth vocational training and employment generation in rural areas.', color: 'bg-purple-100 text-purple-700' },
  { icon: Heart, title: 'Healthcare', desc: 'Primary healthcare, medical camps, and health awareness programs.', color: 'bg-red-100 text-red-700' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="village-gradient py-20 px-4">
        <div className="max-w-5xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={LOGO_URL} alt="GramUnnati" className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-white/30 object-contain bg-white/10 p-1" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">About GramUnnati</h1>
            <p className="text-xl text-white/80 mb-3 italic font-medium">"Our Village – Our Responsibility – Our Development"</p>
            <p className="text-white/60 text-sm">"మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి"</p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              As <strong>responsible citizens</strong>, we all have a social responsibility towards our communities and society.
              Through this initiative, citizens can voluntarily come together to support the holistic development of villages and schools across India.
            </p>
            <blockquote className="border-l-4 border-village pl-6 text-left bg-village/5 rounded-r-xl p-6">
              <p className="text-foreground font-medium leading-relaxed mb-2">
                By uniting citizens, communities, professionals, institutions, and stakeholders on a common platform, 
                we can create <strong>sustainable, self-reliant, and model villages and schools</strong> that serve as examples for future generations.
              </p>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* What We Support */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">Our Eight Pillars of Development</h2>
            <p className="text-muted-foreground">Every pillar represents a crucial aspect of rural transformation</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 border border-border hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center mb-3`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-village/5 border border-village/20 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-village/10 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-village" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-village mb-4">Our Vision</h3>
              <p className="text-foreground leading-relaxed">
                To create a nationwide digital ecosystem where every village and school has a digital identity,
                enabling citizens, donors, and volunteers from across India and the world to participate in rural development.
              </p>
              <p className="text-sm text-muted-foreground mt-3 italic">
                "Transforming 600,000+ villages into sustainable, self-reliant communities"
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-school/5 border border-school/20 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-school/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-school" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-school mb-4">Our Mission</h3>
              <p className="text-foreground leading-relaxed">
                To connect villagers, students, employees, NRVs (Non-Resident Villagers), volunteers, donors, 
                professionals, schools, and organizations on one platform — enabling collaborative village and school development.
              </p>
              <p className="text-sm text-muted-foreground mt-3 italic">
                "Empowering every child with quality education through community support"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Future Impact */}
      <section className="py-16 village-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl font-bold mb-4">As Villages Grow, India Grows</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              As villages become greener, more prosperous, and better connected — farmers, rural entrepreneurs, artisans, 
              women, and youth will benefit through improved livelihoods and increased economic opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <Button size="lg" className="bg-white text-village hover:bg-white/90 font-semibold rounded-full px-10">
                  💛 Support Our Mission
                </Button>
              </Link>
              <Link to="/volunteer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-10">
                  Join as Volunteer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}