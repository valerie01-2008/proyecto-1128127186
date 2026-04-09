import { Metadata } from 'next';
import { readHomeData } from '@/lib/dataService';
import HolaMundo from '@/components/HolaMundo';

export const metadata: Metadata = {
  title: 'Home | Mi App',
  description: 'Página principal del sistema',
};

export default function Home() {
  const homeData = readHomeData();

  return (
    <HolaMundo
      title={homeData.hero.title}
      subtitle={homeData.hero.subtitle}
      description={homeData.hero.description}
    />
  );
}
