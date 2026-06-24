import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import HeroSection from '@/components/home/HeroSection';
import ImpactCounter from '@/components/home/ImpactCounter';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeUrgentProjects from '@/components/home/HomeUrgentProjects';
import HomeActiveWorks from '@/components/home/HomeActiveWorks';
import HomeMegaCTA from '@/components/home/HomeMegaCTA';

export default function Home() {
  const { data, isLoading } = useHomeData();

  return (
    <div className="overflow-x-hidden bg-cream-50">
      <HeroSection />

      <ImpactCounter stats={data?.stats} loading={isLoading} />

      <HomeHowItWorks />

      <HomeUrgentProjects projects={data?.urgentProjects} loading={isLoading} />

      <HomeActiveWorks loading={isLoading} />

      <HomeMegaCTA stats={data?.stats} loading={isLoading} />
    </div>
  );
}
