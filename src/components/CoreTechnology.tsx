import { motion } from 'motion/react';
import { Cloud, Cpu, Server, Shield, Database, Network } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const technologies = [
  {
    title: 'AI Cloud',
    description: 'GPU/CPU compute, AI workloads and scalable cloud infrastructure.',
    icon: Cloud,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'GPU Compute',
    description: 'High-performance GPU infrastructure for AI training and inference.',
    icon: Cpu,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    title: 'Enterprise Cloud',
    description: 'Secure cloud, VPS, dedicated infrastructure, storage and backup.',
    icon: Server,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Government Cloud',
    description: 'Digital infrastructure for government and public-sector workloads.',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Cybersecurity',
    description: 'SOC, security monitoring, threat detection and infrastructure protection.',
    icon: Shield,
    color: 'from-rose-500 to-orange-600',
  },
  {
    title: 'HPC',
    description: 'High-performance computing for scientific and enterprise workloads.',
    icon: Network,
    color: 'from-indigo-500 to-purple-600',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

export default function CoreTechnology() {
  return (
    <section id="infrastructure" className="py-24 relative z-10 bg-[#03050a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Infrastructure Built for the AI Era
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A comprehensive suite of next-generation digital infrastructure designed to scale with your most demanding workloads.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
          {technologies.map((tech) => (
            <motion.div
              key={tech.title}
              variants={item}
              whileHover={{ 
                y: -10, 
                rotateX: 2, 
                rotateY: -2,
                transition: { duration: 0.2 }
              }}
              className="h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <SpotlightCard className="h-full rounded-2xl bg-white/[0.02] border border-white/5 p-8 backdrop-blur-sm overflow-hidden" spotlightColor="rgba(255, 255, 255, 0.05)">
              {/* Hover Glow Effect */}
              <div className={`absolute -inset-px bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-xl z-0`} />
              
              <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${tech.color} bg-opacity-10 shadow-lg`}>
                  <tech.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  {tech.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-6">
                  {tech.description}
                </p>
                
                <div className="flex items-center text-sm font-semibold text-white/70 group-hover:text-white transition-colors cursor-pointer">
                  Learn more
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
