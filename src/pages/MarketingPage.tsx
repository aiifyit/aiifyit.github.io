import Hero from '../components/sections/Hero';
import SocialProof from '../components/sections/SocialProof';
import About from '../components/sections/About';
import Process from '../components/sections/Process';
import Services from '../components/sections/Services';
import Results from '../components/sections/Results';
import Precision from '../components/sections/Precision';
import CTA from '../components/sections/CTA';

export default function MarketingPage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <About />
      <Process />
      <Services />
      <Results />
      <Precision />
      <CTA />
    </main>
  );
}
