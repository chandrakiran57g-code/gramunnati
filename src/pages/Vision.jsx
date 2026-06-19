import { motion } from 'framer-motion';
import { Eye, Target, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const pillars = [
  { icon: '🏘️', title: 'Village Development', desc: 'Build model villages with complete infrastructure, sanitation, roads, electricity, and connectivity.' },
  { icon: '🏫', title: 'School Empowerment', desc: 'Provide every rural school with digital classrooms, qualified teachers, libraries, and safe facilities.' },
  { icon: '🌳', title: 'Environmental Sustainability', desc: 'Plant millions of trees and create water conservation structures for an eco-friendly India.' },
  { icon: '💧', title: 'Water Security', desc: 'Ensure every village has access to clean drinking water and groundwater conservation systems.' },
  { icon: '🌾', title: 'Agricultural Progress', desc: 'Modernize farming with technology, market linkages, and farmer producer organizations.' },
  { icon: '👩‍👩‍👧', title: 'Women Empowerment', desc: 'Establish Self-Help Groups enabling women to achieve financial independence and social leadership.' },
  { icon: '🎓', title: 'Skill Development', desc: 'Train rural youth with vocational skills aligned to market demand, creating sustainable employment.' },
  { icon: '🏥', title: 'Rural Healthcare', desc: 'Improve access to primary healthcare, maternal health, and preventive care in remote villages.' },
];

const objectives = [
  'Register and digitally empower 10,000+ villages across India',
  'Improve infrastructure in 5,000+ government schools',
  'Create 1,00,000+ employment opportunities in rural areas',
  'Plant 50,00,000 trees through community plantation drives',
  'Establish 10,000+ Women Self-Help Groups',
  'Provide clean water access to 5,00,000+ households',
  'Train 1,00,000+ rural youth in vocational skills',
  'Mobilize ₹100 Crore+ for rural development by 2030',
];

export default function Vision() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroScrollSection size="page">
        <div className="hero-gradient py-20 px-4">
          <div className="max-w-5xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Eye className="w-16 h-16 mx-auto mb-6 opacity-70" />
              <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-4">Our Vision</h1>
              <p className="text-2xl sm:text-3xl font-heading text-white/80 italic mb-4">"Our Village – Our Responsibility – Our Development"</p>
              <p className="text-white/60 text-sm">మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Target className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold mb-4">Our Mission</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                As responsible citizens, we all have a social responsibility towards our communities and society. Through GramUnnati, citizens can voluntarily come together to support village development and school empowerment across India.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By uniting citizens, communities, professionals, institutions, and stakeholders on a common digital platform, we aim to create sustainable, self-reliant, and model villages and schools that serve as examples for future generations.
              </p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <p className="text-primary font-heading text-lg font-bold italic mb-4">
                "బాధ్యతగల పౌరులుగా మన సమాజం మరియు గ్రామాల అభివృద్ధి పట్ల ప్రతి ఒక్కరికీ సామాజిక బాధ్యత ఉంది."
              </p>
              <p className="text-muted-foreground text-sm">
                As responsible citizens, each one of us has a social responsibility towards our society and the development of our villages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Pillars */}
      <section className="py-20 bg-gradient-to-b from-green-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">Eight Pillars of Development</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The foundational pillars that guide all our programs and activities</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-border p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-heading font-bold text-sm mb-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Star className="w-10 h-10 text-donation mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Our Objectives</h2>
            <p className="text-white/70">Measurable targets driving our work towards 2030</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3">
            {objectives.map((obj, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-white/10 rounded-xl px-5 py-3 border border-white/10">
                <CheckCircle className="w-5 h-5 text-donation flex-shrink-0 mt-0.5" />
                <span className="text-white/90 text-sm">{obj}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/donate">
              <Button className="donation-gradient text-white border-0 px-10 font-semibold rounded-full">💛 Support Our Mission</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}