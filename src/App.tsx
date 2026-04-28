import { siteConfig } from '@/config/site';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HeroStats from '@/components/HeroStats';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import { ConstructionTape } from '@/components/ui/ConstructionTape';
import Cases from '@/components/Cases';
import ScreedCalculator from '@/components/ScreedCalculator';
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
      <Header master={siteConfig.master} project={siteConfig.project} assets={siteConfig.assets} links={siteConfig.navLinks} />
      <Hero hero={siteConfig.hero} master={siteConfig.master} minAreaM2={siteConfig.project.minAreaM2} theme={siteConfig.theme} />
      <HeroStats stats={siteConfig.about.stats} />
      <Services services={siteConfig.services} />
      <Cases cases={siteConfig.cases} />
      <ScreedCalculator minAreaM2={siteConfig.project.minAreaM2} />
      <WhyUs whyUs={siteConfig.whyUs} />
      <About about={siteConfig.about} master={siteConfig.master} imageUrl={siteConfig.hero.imageUrl} />
      <ConstructionTape />
      <Quiz />
      <Reviews reviews={siteConfig.reviews} />
      <LeadForm />
      <FAQ faq={siteConfig.faq} />
      <Footer master={siteConfig.master} project={siteConfig.project} contacts={siteConfig.contacts} />
      <ConsultationBanner />
    </>
  );
}
