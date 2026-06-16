import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const programs = [
  {
    icon: '🏘️',
    title: 'Village Development',
    slug: 'village-development',
    color: 'bg-village',
    lightColor: 'bg-village/10',
    textColor: 'text-village',
    description: 'Comprehensive infrastructure improvement for rural villages including roads, public buildings, sanitation, and community facilities.',
    impact: ['500+ roads improved', '1,200+ villages covered', '₹8Cr invested'],
    activities: ['Road construction & repair', 'Public building renovation', 'Sanitation facilities', 'Electricity connection', 'Street lighting'],
  },
  {
    icon: '🏫',
    title: 'School Development',
    slug: 'school-development',
    color: 'bg-school',
    lightColor: 'bg-school/10',
    textColor: 'text-school',
    description: 'Empowering rural schools with modern infrastructure, digital resources, and quality education materials.',
    impact: ['450+ schools supported', '1.5L+ students benefited', '₹4.2Cr invested'],
    activities: ['Digital classroom setup', 'Library establishment', 'Furniture & equipment', 'Teacher training', 'Computer labs'],
  },
  {
    icon: '🌳',
    title: 'Tree Plantation',
    slug: 'tree-plantation',
    color: 'bg-green-600',
    lightColor: 'bg-green-100',
    textColor: 'text-green-700',
    description: 'Massive tree plantation drives to create greener villages and combat climate change.',
    impact: ['50,000+ trees planted', '320 villages greened', 'CO2 reduction tracked'],
    activities: ['Mass plantation drives', 'Fruit tree distribution', 'Forest conservation', 'Village boundary planting', 'School garden projects'],
  },
  {
    icon: '💧',
    title: 'Water Conservation',
    slug: 'water-conservation',
    color: 'bg-cyan-600',
    lightColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    description: 'Ensuring water security for rural communities through conservation, harvesting, and groundwater recharge.',
    impact: ['320 water projects', '8,500 farmers helped', '40+ bore wells'],
    activities: ['Check dam construction', 'Bore well drilling', 'Rainwater harvesting', 'Tank restoration', 'Pipeline installation'],
  },
  {
    icon: '🌾',
    title: 'Agriculture Development',
    slug: 'agriculture',
    color: 'bg-yellow-600',
    lightColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    description: 'Supporting farmers with modern techniques, equipment, market linkages, and training programs.',
    impact: ['8,500+ farmers helped', '25% yield increase', '120+ FPOs formed'],
    activities: ['Modern farming training', 'Equipment distribution', 'Organic farming', 'Market linkages', 'Crop insurance awareness'],
  },
  {
    icon: '👩‍👩‍👧',
    title: 'Women Self-Help Groups',
    slug: 'women-shg',
    color: 'bg-pink-600',
    lightColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    description: 'Empowering rural women through self-help groups, micro-finance, skill development, and entrepreneurship.',
    impact: ['2,400+ SHGs supported', '45,000+ women benefited', '₹3Cr micro-loans'],
    activities: ['SHG formation', 'Skill training', 'Micro-finance facilitation', 'Market access', 'Leadership programs'],
  },
  {
    icon: '🎓',
    title: 'Skill Development',
    slug: 'skill-development',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    description: 'Youth skill development, vocational training, and employment generation programs.',
    impact: ['12,000+ youth trained', '8,500+ employed', '45+ trade courses'],
    activities: ['Vocational training', 'Computer literacy', 'English communication', 'Entrepreneurship courses', 'Apprenticeship programs'],
  },
  {
    icon: '🏥',
    title: 'Healthcare',
    slug: 'healthcare',
    color: 'bg-red-600',
    lightColor: 'bg-red-100',
    textColor: 'text-red-700',
    description: 'Primary healthcare access, medical camps, disease prevention, and health awareness for rural communities.',
    impact: ['250+ medical camps', '85,000+ patients served', '40+ PHCs supported'],
    activities: ['Medical camps', 'Health awareness', 'Vaccination drives', 'Nutrition programs', 'Mental health support'],
  },
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="village-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Programs</h1>
            <p className="text-white/80 max-w-2xl mx-auto">Eight pillars of rural development creating lasting change across India</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {programs.map((prog, i) => (
            <motion.div key={prog.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="group bg-white rounded-2xl border border-border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${prog.lightColor} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {prog.icon}
              </div>
              <h3 className={`font-heading font-bold text-lg mb-2 ${prog.textColor}`}>{prog.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{prog.description}</p>

              <div className="space-y-1 mb-4">
                {prog.impact.map(i => (
                  <div key={i} className={`flex items-center gap-1.5 text-xs font-medium ${prog.textColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {i}
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Key Activities</div>
                {prog.activities.slice(0, 3).map(a => (
                  <div key={a} className="text-xs text-muted-foreground py-0.5">• {a}</div>
                ))}
              </div>

              <Link to="/donate" className="mt-4 block">
                <Button size="sm" className={`w-full ${prog.color} text-white border-0 text-xs hover:opacity-90 group-hover:shadow-md transition-all`}>
                  Support This Program
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center bg-village/5 border border-village/20 rounded-2xl p-10"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Want to Start a Program in Your Village?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Register your village, identify needs, and let our community help you create lasting change.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate">
              <Button className="donation-gradient text-white border-0 rounded-full px-8 hover:opacity-90">
                💛 Donate to a Program
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-village text-village hover:bg-village hover:text-white rounded-full px-8">
                Contact Us <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}