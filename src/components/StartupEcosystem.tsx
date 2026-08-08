import { motion } from 'motion/react';
import { Lightbulb, Settings, Zap, Cloud, Building2, TrendingUp } from 'lucide-react';

const pipeline = [
  { title: 'Idea', icon: Lightbulb },
  { title: 'Prototype', icon: Settings },
  { title: 'AI Compute', icon: Zap },
  { title: 'Cloud', icon: Cloud },
  { title: 'Incubation', icon: Building2 },
  { title: 'Enterprise', icon: Building2 },
  { title: 'Scale', icon: TrendingUp },
];

const pipelineContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const pipelineItem = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" as const, stiffness: 100 } }
};

const servicesContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
};

const serviceItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

export default function StartupEcosystem() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#050811]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Build. Compute. Scale.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Empowering the startup ecosystem with the infrastructure, credits, and mentorship needed to build the next generation of AI products.
          </p>
        </motion.div>

        {/* Pipeline Visualization */}
        <div className="relative mb-20 overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0">
          <motion.div variants={pipelineContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="min-w-[800px] flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/50 to-indigo-500/20 -translate-y-1/2 z-0" />
            
            {pipeline.map((step) => (
              <motion.div
                key={step.title}
                variants={pipelineItem}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#050811] border-2 border-indigo-500/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <step.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-white font-medium text-sm">{step.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Services Grid */}
        <motion.div variants={servicesContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Startup Incubation', 'AI Compute Credits', 'Cloud Infrastructure', 'Mentorship', 'Technical Support', 'Government Innovation Programs'].map((service, i) => (
            <motion.div key={i} variants={serviceItem} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-gray-300 font-medium">{service}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
