import Navigation from './components/Navigation';
import Hero from './components/Hero';
import CoreTechnology from './components/CoreTechnology';
import DataCenter from './components/DataCenter';
import ComputeVisual from './components/ComputeVisual';
import Ecosystem from './components/Ecosystem';
import GovInfrastructure from './components/GovInfrastructure';
import ResearchInnovation from './components/ResearchInnovation';
import AiAcademy from './components/AiAcademy';
import StartupEcosystem from './components/StartupEcosystem';
import GatewayMap from './components/GatewayMap';
import SecuritySection from './components/SecuritySection';
import Roadmap from './components/Roadmap';
import CTA from './components/CTA';
import Footer from './components/Footer';
import SectionReveal from './components/SectionReveal';
import ScrollProgress from './components/ScrollProgress';

export default function App() {
  return (
    <div className="min-h-screen bg-[#03050a] text-gray-100 font-sans selection:bg-indigo-500/30">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <SectionReveal>
        <GatewayMap />
      </SectionReveal>
      <SectionReveal>
        <CoreTechnology />
      </SectionReveal>
      <SectionReveal>
        <DataCenter />
      </SectionReveal>
      <SectionReveal>
        <ComputeVisual />
      </SectionReveal>
      <SectionReveal>
        <Ecosystem />
      </SectionReveal>
      <SectionReveal>
        <GovInfrastructure />
      </SectionReveal>
      <SectionReveal>
        <ResearchInnovation />
      </SectionReveal>
      <SectionReveal>
        <AiAcademy />
      </SectionReveal>
      <SectionReveal>
        <StartupEcosystem />
      </SectionReveal>
      <SectionReveal>
        <SecuritySection />
      </SectionReveal>
      <SectionReveal>
        <Roadmap />
      </SectionReveal>
      <SectionReveal>
        <CTA />
      </SectionReveal>
      <Footer />
    </div>
  );
}
