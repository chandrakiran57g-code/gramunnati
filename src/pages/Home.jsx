import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import ImpactCounter from '@/components/home/ImpactCounter';
import HomeHowItWorks from '@/components/home/HomeHowItWorks';
import HomeUrgentProjects from '@/components/home/HomeUrgentProjects';
import HomeFeaturedTabs from '@/components/home/HomeFeaturedTabs';
import HomeMegaCTA from '@/components/home/HomeMegaCTA';

export default function Home() {
  const { data, isLoading } = useHomeData();

  return (
    <div className="overflow-x-hidden bg-cream-50">
      <HeroSection />

      <SearchSection />

      <ImpactCounter stats={data?.stats} loading={isLoading} />

      <HomeHowItWorks />

      <HomeUrgentProjects projects={data?.urgentProjects} loading={isLoading} />

      <HomeFeaturedTabs
        villages={data?.villages}
        schools={data?.schools}
        projects={data?.projects}
        loading={isLoading}
      />

      <HomeMegaCTA stats={data?.stats} loading={isLoading} />
    </div>
  );
}
