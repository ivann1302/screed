import { siteConfig } from '@/config/site';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Pricing from '@/components/Pricing';
import Cases from '@/components/Cases';
import About from '@/components/About';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function App() {
  return (
    <>
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <Services services={siteConfig.services} />
      <Pricing pricing={siteConfig.pricing} />
      <Cases cases={siteConfig.cases} />
      <About about={siteConfig.about} master={siteConfig.master} />
      <Reviews reviews={siteConfig.reviews} />
      <FAQ faq={siteConfig.faq} />
      <Footer master={siteConfig.master} contacts={siteConfig.contacts} />
    </>
  );
}
