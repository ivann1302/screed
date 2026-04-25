import { siteConfig } from '@/config/site';
import Hero from '@/components/Hero';

export default function App() {
  return (
    <>
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
    </>
  );
}
