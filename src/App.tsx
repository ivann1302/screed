import { siteConfig } from '@/config/site';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HeroStats from '@/components/HeroStats';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import { ConstructionTape } from '@/components/ui/ConstructionTape';
import Cases from '@/components/Cases';
import About from '@/components/About';
import Quiz from '@/components/Quiz';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import ConsultationBanner from '@/components/ConsultationBanner';

export default function App() {
  return (
    <>
      <Header master={siteConfig.master} />
      <Hero hero={siteConfig.hero} master={siteConfig.master} />
      <HeroStats stats={siteConfig.about.stats} />
      <Services services={siteConfig.services} />
      <Cases cases={siteConfig.cases} />
      <About about={siteConfig.about} master={siteConfig.master} />
      <WhyUs whyUs={siteConfig.whyUs} />
      <ConstructionTape />
      <Quiz />
      <Reviews reviews={siteConfig.reviews} />
      <LeadForm />
      <FAQ faq={siteConfig.faq} />
      <Footer master={siteConfig.master} contacts={siteConfig.contacts} />
      <ConsultationBanner />
    </>
  );
}
