import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, School, TreePine } from 'lucide-react';
import { TextReveal } from '@/components/ui/cascade-text';
import RotatingHeroWord from '@/components/ui/rotating-hero-word';
import MountainVistaParallax from '@/components/ui/mountain-vista-bg';
import HeroScrollHint from '@/components/home/HeroScrollHint';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const { heroRotatingWords, heroRotatingWidthAnchor } = translations[lang].home;

  return (
    <section className="hero-section-viewport relative flex items-center justify-center overflow-hidden bg-[#1b4332]">
      <MountainVistaParallax />
      <div className="absolute inset-0 z-[1] hero-green-gradient pointer-events-none" />

      <div className="hero-section-inner relative z-10 flex w-full max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <h1 className="hero-section-title font-heading font-bold text-white overflow-visible">
          <span className="hero-section-title-stack">
            <RotatingHeroWord
              className="hero-section-title-line font-heading font-bold tracking-wide"
              color="#ffffff"
              words={heroRotatingWords}
              widthAnchor={heroRotatingWidthAnchor}
            />
            <span className="hero-section-title-main flex flex-wrap items-baseline justify-center gap-x-2 overflow-visible">
              <TextReveal
                text={t('home.heroVillages')}
                splitBy="word"
                color="#f59e0b"
                hoverColor="#fbbf24"
                className="font-heading font-bold hero-title-accent"
                fontSize="inherit"
                animateOnMount
                baseDelay={280}
                staggerDelay={35}
              />
              <TextReveal
                text={t('home.heroAnd')}
                splitBy="word"
                className="font-heading font-bold"
                fontSize="inherit"
                color="#ffffff"
                hoverColor="#ffffff"
                hoverEffect={false}
                animateOnMount
                baseDelay={520}
                staggerDelay={35}
              />
              <TextReveal
                text={t('home.heroSchools')}
                splitBy="word"
                color="#93c5fd"
                hoverColor="#bfdbfe"
                className="font-heading font-bold hero-title-schools"
                fontSize="inherit"
                animateOnMount
                baseDelay={620}
                staggerDelay={35}
              />
            </span>
            <span className="hero-section-title-line">
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
            </span>
          </span>
        </h1>

        <p className="hero-section-subtitle max-w-2xl font-body text-white/85">
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

        <div className="hero-section-cta flex w-full flex-wrap items-center justify-center">
          <Link
            to="/villages"
            className="hero-section-cta-link inline-flex items-center gap-1.5 rounded-xl bg-service-village font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-service-village/90 group"
          >
            <TreePine className="h-3.5 w-3.5 shrink-0" />
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
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/schools"
            className="hero-section-cta-link inline-flex items-center gap-1.5 rounded-xl bg-service-school font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-service-school/90"
          >
            <School className="h-3.5 w-3.5 shrink-0" />
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
            className="hero-section-cta-link inline-flex items-center gap-1.5 rounded-xl bg-service-agriculture font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-service-agriculture/90"
          >
            <Heart className="h-3.5 w-3.5 shrink-0" />
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
          className="hero-section-volunteer inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
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
