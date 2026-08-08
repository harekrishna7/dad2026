import { motion } from 'motion/react';
import { Database, Zap, Shield, Globe, HardDrive } from 'lucide-react';
import { useState } from 'react';
import SpotlightCard from './SpotlightCard';

const components = [
  { id: 'compute', title: 'Compute', description: 'GPU / CPU infrastructure', icon: Zap, color: 'text-indigo-400' },
  { id: 'storage', title: 'Storage', description: 'High-performance data storage', icon: Database, color: 'text-cyan-400' },
  { id: 'network', title: 'Network', description: 'High-speed connectivity', icon: Globe, color: 'text-emerald-400' },
  { id: 'security', title: 'Security', description: '24/7 infrastructure protection', icon: Shield, color: 'text-rose-400' },
  { id: 'power', title: 'Power', description: 'Reliable infrastructure architecture', icon: HardDrive, color: 'text-amber-400' },
];

const listContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
};

export default function DataCenter() {
  const [activeComponent, setActiveComponent] = useState(components[0]);

  return (
    <section className="py-24 relative overflow-hidden bg-[#03050a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Modular Data Center
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our state-of-the-art facilities designed for maximum performance, efficiency, and reliability.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          <motion.div variants={listContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-4 flex flex-col gap-4">
            {components.map((comp) => (
              <motion.button
                variants={listItem}
                key={comp.id}
                onMouseEnter={() => setActiveComponent(comp)}
                className={`text-left p-6 rounded-2xl border transition-all ${
                  activeComponent.id === comp.id
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <comp.icon className={`w-6 h-6 ${activeComponent.id === comp.id ? comp.color : 'text-gray-500'}`} />
                  <div>
                    <h3 className={`font-semibold ${activeComponent.id === comp.id ? 'text-white' : 'text-gray-400'}`}>
                      {comp.title}
                    </h3>
                    {activeComponent.id === comp.id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-gray-400 mt-1"
                      >
                        {comp.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
          
          <SpotlightCard className="lg:col-span-8 h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center backdrop-blur-sm" spotlightColor="rgba(255, 255, 255, 0.05)">
            {/* Pseudo-3D representation since we want to avoid massive three.js scenes when not needed */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent" />
            
            <motion.div
              key={activeComponent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center justify-center text-center p-8 w-full h-full"
            >
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                <activeComponent.icon className={`w-12 h-12 ${activeComponent.color}`} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{activeComponent.title}</h3>
              <p className="text-xl text-gray-400">{activeComponent.description}</p>
              
              <div className="mt-8 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-2 rounded-full ${
                      i < 4 ? activeComponent.color.replace('text-', 'bg-') : 'bg-white/10'
                    } ${i < 4 ? 'opacity-80' : ''}`}
                  />
                ))}
              </div>
            </motion.div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
}
