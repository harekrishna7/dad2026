import { motion } from 'motion/react';

const ecosystemNodes = [
  'AI Cloud', 'AI APIs', 'AI Models', 'Data Platform', 
  'Cybersecurity', 'HPC', 'Government Cloud', 'Enterprise Cloud', 
  'AI Academy', 'AI Marketplace'
];

export default function Ecosystem() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#03050a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            AI Platform Ecosystem
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A fully integrated ecosystem where infrastructure, intelligence, and innovation converge.
          </p>
        </div>

        <div className="relative h-[600px] flex items-center justify-center">
          {/* Central Hub */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="absolute z-20 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-900 to-[#03050a] border border-indigo-500/50 flex flex-col items-center justify-center text-center p-6 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 mb-3 animate-pulse" />
            <h3 className="text-white font-bold leading-tight">DADsync AI Platform</h3>
          </motion.div>

          {/* Surrounding Nodes */}
          {ecosystemNodes.map((node, i) => {
            const angle = (i / ecosystemNodes.length) * Math.PI * 2;
            // Elliptical distribution
            const radiusX = typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 300;
            const radiusY = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 200;
            
            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;

            return (
              <motion.div
                key={node}
                initial={{ opacity: 0, x: 0, y: 0 }}
                whileInView={{ opacity: 1, x, y }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="absolute z-10"
              >
                {/* Connection Line Pseudo */}
                
                <div className="group relative">
                  <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 text-sm font-medium whitespace-nowrap backdrop-blur-md hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-white transition-all cursor-default">
                    {node}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Abstract background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[300px] h-[300px] border border-indigo-500 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[500px] h-[500px] border border-dashed border-cyan-500 rounded-full animate-[spin_90s_linear_infinite_reverse]" />
          </div>
        </div>
      </div>
    </section>
  );
}
