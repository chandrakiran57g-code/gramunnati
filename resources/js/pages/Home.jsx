import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import HeroSection from '@/components/home/HeroSection';
import ImpactCounter from '@/components/home/ImpactCounter';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeUrgentProjects from '@/components/home/HomeUrgentProjects';
import HomeActiveWorks from '@/components/home/HomeActiveWorks';
import HomeMegaCTA from '@/components/home/HomeMegaCTA';
import HomeExitTracker from '@/components/home/HomeExitTracker';

export default function Home() {
  const { data, isLoading } = useHomeData();

  return (
    <div className="overflow-x-hidden bg-gray-50">
      <HomeExitTracker />
      <div id="home-hero" data-home-section="home-hero">
        <HeroSection />
      </div>

      <div id="home-impact" data-home-section="home-impact">
        <ImpactCounter stats={data?.stats} loading={isLoading} />
      </div>

      <div id="home-how-it-works" data-home-section="home-how-it-works">
        <HomeHowItWorks />
      </div>

      <div id="home-urgent" data-home-section="home-urgent">
        <HomeUrgentProjects projects={data?.urgentProjects} loading={isLoading} />
      </div>

      <div id="home-active-works" data-home-section="home-active-works">
        <HomeActiveWorks loading={isLoading} />
      </div>

      <div id="home-cta" data-home-section="home-cta">
        <HomeMegaCTA stats={data?.stats} loading={isLoading} />
      </div>
    </div>
  );
}
