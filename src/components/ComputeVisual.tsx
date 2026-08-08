import { motion } from 'motion/react';
import { Cpu, Activity, Network, HardDrive, Share2 } from 'lucide-react';

export default function ComputeVisual() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#03050a] to-[#050811]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Compute Without Boundaries
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A massively scalable GPU and CPU infrastructure designed for the most demanding AI workloads, training, and inference.
          </p>
        </div>

        <div className="relative h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm p-8 flex flex-col justify-center items-center">
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-4xl justify-between relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 -translate-y-1/2 z-0" />
            
            {/* Nodes */}
            <motion.div 
              className="z-10 bg-[#050811] p-6 rounded-2xl border border-indigo-500/30 flex flex-col items-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cpu className="w-12 h-12 text-indigo-400 mb-3" />
              <span className="text-white font-medium">GPU Node</span>
            </motion.div>
            
            <Share2 className="w-6 h-6 text-indigo-500/50 hidden md:block z-10" />
            
            <motion.div 
              className="z-10 bg-[#050811] p-6 rounded-2xl border border-indigo-500/30 flex flex-col items-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <HardDrive className="w-12 h-12 text-indigo-400 mb-3" />
              <span className="text-white font-medium">GPU Cluster</span>
            </motion.div>
            
            <Share2 className="w-6 h-6 text-indigo-500/50 hidden md:block z-10" />
            
            <motion.div 
              className="z-10 bg-indigo-900/20 p-8 rounded-2xl border border-indigo-400 flex flex-col items-center shadow-[0_0_30px_rgba(99,102,241,0.2)]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <Activity className="w-16 h-16 text-cyan-400 mb-3" />
              <span className="text-white font-bold text-lg">AI Workload</span>
            </motion.div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-16">
            {['Scalable Compute', 'AI Training', 'AI Inference', 'HPC Workloads'].map((label, i) => (
              <div key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium">
                {label}
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
