import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Eye,
  Globe2,
  HandHeart,
  Handshake,
  Heart,
  Landmark,
  MapPin,
  School,
  Sparkles,
  Target,
  TreePine,
  Users,
  Wallet,
  Wheat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CmsrBrandText from '@/components/brand/CmsrBrandText';
import { BRAND_LOGO_URL, BRAND_TAGLINE } from '@/lib/brand';
import { PROGRAMS } from '@/lib/programs';
import { usePublicSettings } from '@/hooks/usePublicSettings';

const PILLAR_ICONS = {
  'village-development': TreePine,
  'school-empowerment': School,
  'tree-plantation': TreePine,
  'water-conservation': Droplets,
  'agriculture-development': Wheat,
  'women-shgs': Handshake,
  'skill-development': Users,
  healthcare: Heart,
};

const STATIC_PILLARS = PROGRAMS.map((p) => ({
  title: p.title,
  desc: p.description,
  lightColor: p.lightColor,
  textColor: p.textColor,
  Icon: PILLAR_ICONS[p.slug] || TreePine,
}));

const HERO_STATS = [
  { value: '6,00,000+', label: 'Villages in India we aim to empower' },
  { value: '8', label: 'Pillars of holistic rural development' },
  { value: '1', label: 'Nationwide digital platform for citizens' },
];

const STAKEHOLDERS = [
  { icon: Users, title: 'Villagers & Gram Sabhas', desc: 'Local communities who identify needs, track progress, and own village transformation.' },
  { icon: School, title: 'Schools & Students', desc: 'Government schools that receive infrastructure, digital tools, and community-backed support.' },
  { icon: Globe2, title: 'NRVs & Diaspora', desc: 'Non-Resident Villagers and Indians abroad who reconnect with their roots through giving and volunteering.' },
  { icon: HandHeart, title: 'Volunteers', desc: 'Skilled citizens who contribute time, expertise, and on-ground effort to active projects.' },
  { icon: Wallet, title: 'Donors & CSR Partners', desc: 'Individuals, companies, and foundations who fund transparent, outcome-driven development.' },
  { icon: Landmark, title: 'Institutions & NGOs', desc: 'Educational bodies, government schemes, and partner organizations aligned with rural upliftment.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Discover', desc: 'Browse villages, schools, programs, and active works. Every entity has a digital profile with real needs and progress.' },
  { step: '02', title: 'Connect', desc: 'Register as a member, volunteer, or donor. Choose the village, school, or program closest to your heart.' },
  { step: '03', title: 'Contribute', desc: 'Donate funds, offer skills, or mobilize your network. Contributions are tracked with transparency on the platform.' },
  { step: '04', title: 'Transform', desc: 'Watch roads, classrooms, trees, and livelihoods improve — creating model villages and schools others can follow.' },
];

const OBJECTIVES_2030 = [
  'Register and digitally empower 10,000+ villages across India',
  'Improve infrastructure in 5,000+ government schools',
  'Create 1,00,000+ employment opportunities in rural areas',
  'Plant 50,00,000 trees through community plantation drives',
  'Establish 10,000+ Women Self-Help Groups',
  'Provide clean water access to 5,00,000+ households',
  'Train 1,00,000+ rural youth in vocational skills',
  'Mobilize ₹100 Crore+ for rural development by 2030',
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export default function About() {
  const { logoUrl } = usePublicSettings();
  const brandLogo = logoUrl || BRAND_LOGO_URL;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero (static — no scroll redirect) ─────────────── */}
      <div className="about-hero-shell relative overflow-hidden py-16 sm:py-20 px-4">
          <div className="about-hero-grain absolute inset-0" aria-hidden="true" />
          <div
            className="about-glow-orb absolute -left-20 top-16 h-56 w-56 rounded-full bg-[#2D6A4F]/40"
            aria-hidden="true"
          />
          <div
            className="about-glow-orb about-glow-orb-delay absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[#CA8A04]/30"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <img
                src={brandLogo}
                alt="CMSR"
                className="mx-auto mb-8 h-24 w-24 rounded-full border-4 border-white/25 bg-white/10 object-contain p-1.5 shadow-2xl"
              />
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                {BRAND_TAGLINE}
              </p>
              <h1 className="font-heading text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
                About <CmsrBrandText className="font-heading" />
              </h1>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-white/90 leading-relaxed font-medium italic">
                &ldquo;Our Village – Our Responsibility – Our Development&rdquo;
              </p>
              <p className="mt-2 text-sm text-white/60">మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి</p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="about-stat-chip rounded-2xl px-5 py-3 text-left min-w-[140px]">
                    <div className="font-heading text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-[11px] leading-snug text-white/65 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
      </div>

      {/* ── What is CMSR ───────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <SectionLabel>What is CMSR?</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-5 mb-4">
              A citizen-led movement for rural India
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              <CmsrBrandText /> — <strong>Common Man Social Responsibility</strong> — is a nationwide digital platform
              where ordinary citizens voluntarily unite to develop villages and empower schools. It is not a government
              scheme alone; it is a shared responsibility model where every person can participate.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5 text-gray-600 leading-relaxed"
            >
              <p>
                India has more than <strong>6 lakh villages</strong> and thousands of rural schools that lack basic
                infrastructure, digital access, and consistent community support. CMSR bridges this gap by giving every
                village and school a <strong>digital identity</strong> — making needs visible, progress measurable, and
                participation open to all.
              </p>
              <p>
                Whether you live in the village, work in a city, or belong to the diaspora abroad, you can discover
                real projects, donate transparently, volunteer your skills, and follow outcomes — all on one trusted
                platform built for <strong>grassroots development at scale</strong>.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  'Voluntary participation — no compulsion, only collective will',
                  'Transparent tracking of donations, projects, and impact',
                  'Eight integrated development pillars covering every rural need',
                  'Telugu & English support for inclusive nationwide reach',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2D6A4F] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(61,41,20,0.08)]"
            >
              <div className="absolute -top-3 -right-3 h-20 w-20 rounded-full bg-[#2D6A4F]/10 blur-2xl" aria-hidden="true" />
              <div className="flex items-center gap-3 mb-4">
                <TreePine className="h-10 w-10 shrink-0 text-[#2D6A4F]" />
                <h3 className="font-heading text-xl font-bold text-gray-900">Why it matters</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                As responsible citizens, we carry a social duty toward our communities. When villages grow greener,
                schools gain quality classrooms, and youth find livelihoods — the entire nation moves forward.
                CMSR turns that duty into <strong>action you can see and measure</strong>.
              </p>
              <blockquote className="border-l-4 border-gray-400 bg-gray-50 rounded-r-2xl pl-5 pr-4 py-4 text-sm italic text-gray-600">
                &ldquo;బాధ్యతగల పౌరులుగా మన సమాజం మరియు గ్రామాల అభివృద్ధి పట్ల ప్రతి ఒక్కరికీ సామాజిక బాధ్యత ఉంది.&rdquo;
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Who participates ───────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <SectionLabel>Our ecosystem</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-5 mb-3">
              Who comes together on CMSR
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Development succeeds when villagers, professionals, institutions, and donors act as one community.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STAKEHOLDERS.map((s, i) => (
              <motion.div
                key={s.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-5">
              From discovery to lasting change
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] about-step-connector" aria-hidden="true" />
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative rounded-2xl bg-white border border-gray-200 p-6 shadow-sm"
              >
                <span className="font-heading text-4xl font-bold text-gray-300">{step.step}</span>
                <h3 className="font-heading text-lg font-bold text-gray-900 mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eight Pillars ─────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <SectionLabel>Eight pillars</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-5 mb-3">
              Our Eight Pillars of Development
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every CMSR program maps to one of these pillars — together they cover infrastructure, education,
              environment, livelihoods, women&apos;s empowerment, skills, and health for complete rural transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STATIC_PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 shrink-0 ${p.lightColor} rounded-xl flex items-center justify-center`}>
                    <p.Icon className={`w-6 h-6 ${p.textColor}`} />
                  </div>
                  <h3 className={`font-semibold text-sm ${p.textColor}`}>{p.title}</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ───────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5EE]">
                  <Eye className="h-7 w-7 text-[#2D6A4F]" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#2D6A4F]">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                To create a nationwide digital ecosystem where every village and school has a visible identity,
                enabling citizens, donors, and volunteers from across India and the world to participate in
                transparent, sustainable rural development.
              </p>
              <p className="text-sm italic text-gray-500 border-t border-gray-200 pt-4">
                &ldquo;Transforming 600,000+ villages into sustainable, self-reliant communities.&rdquo;
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                  <Target className="h-7 w-7 text-[#2563EB]" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#2563EB]">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                To connect villagers, students, employees, NRVs (Non-Resident Villagers), volunteers, donors,
                professionals, schools, and organizations on one platform — enabling collaborative village and
                school development with measurable outcomes.
              </p>
              <p className="text-sm italic text-gray-500 border-t border-gray-200 pt-4">
                &ldquo;Empowering every child with quality education through community support.&rdquo;
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2030 Objectives ────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-gray-50 border-t border-gray-100">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <SectionLabel>Goals by 2030</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-5 mb-3">
              Measurable targets driving our work
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Ambitious, transparent goals that guide every village project, school upgrade, and community initiative.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3">
            {OBJECTIVES_2030.map((obj, i) => (
              <motion.div
                key={obj}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2D6A4F] mt-0.5" />
                <span className="text-sm text-gray-700 leading-relaxed">{obj}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MapPin className="h-10 w-10 text-gray-500 mx-auto mb-5" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              As Villages Grow, India Grows
            </h2>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              When villages become greener, schools gain modern classrooms, and youth find meaningful work —
              farmers, artisans, women entrepreneurs, and entire communities rise together. Your participation
              on CMSR makes that future possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate">
                <Button size="lg" className="donation-gradient text-white border-0 rounded-full px-10 h-12 font-semibold">
                  <Heart className="w-5 h-5 mr-2" /> Support Our Mission
                </Button>
              </Link>
              <Link to="/volunteer">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-12 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                >
                  Join as Volunteer
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="lg" variant="ghost" className="rounded-full px-8 h-12 text-gray-600">
                  View all programs <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
