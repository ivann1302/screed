import { siteConfig } from '@/config/site';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HeroStats from '@/components/HeroStats';
import Services from '@/components/Services';
import Pricing from '@/components/Pricing';
import Cases from '@/components/Cases';
import About from '@/components/About';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';

export default function App() {
  return (
    <>
      <Header master={siteConfig.master} />
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <HeroStats stats={siteConfig.about.stats} />
      <Services services={siteConfig.services} />
      <Pricing pricing={siteConfig.pricing} />
      <Cases cases={siteConfig.cases} />
      <About about={siteConfig.about} master={siteConfig.master} />
      <Reviews reviews={siteConfig.reviews} />
      <FAQ faq={siteConfig.faq} />
      <LeadForm />
      <Footer master={siteConfig.master} contacts={siteConfig.contacts} />
    </>
  );
}
