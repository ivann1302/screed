import { siteConfig } from '@/config/site';
import Hero from '@/components/Hero';
import Services from '@/components/Services';

export default function App() {
  return (
    <>
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <Services services={siteConfig.services} />
    </>
  );
}
