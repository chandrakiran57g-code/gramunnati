import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, School, TreePine } from 'lucide-react';
import { TextReveal } from '@/components/ui/cascade-text';
import MountainVistaParallax from '@/components/ui/mountain-vista-bg';
import HeroScrollHint from '@/components/home/HeroScrollHint';
import { useLanguage } from '@/i18n/LanguageContext';

const headingStyle = {
  fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
  letterSpacing: '-0.02em',
};

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#1b4332]">
      <MountainVistaParallax />
      <div className="absolute inset-0 z-[1] hero-green-gradient pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-28 sm:py-32 text-center flex flex-col items-center">
        <h1
          className="font-heading font-bold text-white leading-[1.15] mb-6 text-balance"
          style={headingStyle}
        >
          <TextReveal
            text={t('home.heroEmpowering')}
            className="font-heading font-bold"
            fontSize="inherit"
            color="#ffffff"
            hoverColor="#ffffff"
            hoverEffect={false}
            animateOnMount
            baseDelay={0}
            staggerDelay={35}
          />{' '}
          <TextReveal
            text={t('home.heroVillages')}
            color="#f59e0b"
            hoverColor="#fbbf24"
            className="font-heading font-bold"
            fontSize="inherit"
            animateOnMount
            baseDelay={280}
            staggerDelay={35}
          />{' '}
          <TextReveal
            text="&"
            className="font-heading font-bold"
            fontSize="inherit"
            color="#ffffff"
            hoverColor="#ffffff"
            hoverEffect={false}
            animateOnMount
            baseDelay={520}
            staggerDelay={35}
          />{' '}
          <TextReveal
            text={t('home.heroSchools')}
            color="#60a5fa"
            hoverColor="#93c5fd"
            className="font-heading font-bold"
            fontSize="inherit"
            animateOnMount
            baseDelay={620}
            staggerDelay={35}
          />
          <br />
          <TextReveal
            text={t('home.heroAcrossIndia')}
            className="font-heading font-bold"
            fontSize="inherit"
            color="#ffffff"
            hoverColor="#ffffff"
            hoverEffect={false}
            animateOnMount
            baseDelay={900}
            staggerDelay={35}
          />
        </h1>

        <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-10 max-w-2xl font-body">
          <TextReveal
            text={t('home.heroSubtitleLong')}
            splitBy="word"
            className="font-body"
            fontSize="inherit"
            color="rgba(255,255,255,0.85)"
            hoverColor="rgba(255,255,255,0.85)"
            hoverEffect={false}
            animateOnMount
            baseDelay={1200}
            staggerDelay={45}
            duration={500}
          />
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-4 w-full">
          <Link
            to="/villages"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-service-village hover:bg-service-village/90 text-white font-semibold text-sm transition-colors shadow-lg shadow-black/20 group"
          >
            <TreePine className="w-4 h-4 shrink-0" />
            <TextReveal
              text={t('home.exploreVillages')}
              className="font-semibold"
              fontSize="inherit"
              color="#ffffff"
              hoverColor="#ffffff"
              hoverEffect={false}
              animateOnMount
              baseDelay={1800}
              staggerDelay={22}
            />
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/schools"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-service-school hover:bg-service-school/90 text-white font-semibold text-sm transition-colors shadow-lg shadow-black/20"
          >
            <School className="w-4 h-4 shrink-0" />
            <TextReveal
              text={t('home.exploreSchools')}
              className="font-semibold"
              fontSize="inherit"
              color="#ffffff"
              hoverColor="#ffffff"
              hoverEffect={false}
              animateOnMount
              baseDelay={1950}
              staggerDelay={22}
            />
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-service-agriculture hover:bg-service-agriculture/90 text-white font-semibold text-sm transition-colors shadow-lg shadow-black/20"
          >
            <Heart className="w-4 h-4 shrink-0" />
            <TextReveal
              text={t('home.donateNow')}
              className="font-semibold"
              fontSize="inherit"
              color="#ffffff"
              hoverColor="#ffffff"
              hoverEffect={false}
              animateOnMount
              baseDelay={2100}
              staggerDelay={22}
            />
          </Link>
        </div>

        <Link
          to="/volunteer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold text-sm hover:bg-white/15 transition-colors backdrop-blur-sm"
        >
          <Users className="w-4 h-4 shrink-0" />
          <TextReveal
            text={t('home.becomeVolunteer')}
            className="font-semibold"
            fontSize="inherit"
            color="#ffffff"
            hoverColor="#ffffff"
            hoverEffect={false}
            animateOnMount
            baseDelay={2300}
            staggerDelay={22}
          />
        </Link>

        <HeroScrollHint />
      </div>
    </section>
  );
}
