import { motion } from 'motion/react';
import { ShieldCheck, Building2, Map, LayoutDashboard, HeartHandshake, CloudRain } from 'lucide-react';

const govFeatures = [
  { title: 'e-Governance Hosting', icon: Building2 },
  { title: 'Digital District', icon: Map },
  { title: 'Digital Panchayat', icon: LayoutDashboard },
  { title: 'Citizen Services', icon: HeartHandshake },
  { title: 'Disaster Recovery', icon: CloudRain },
  { title: 'AI-powered Analytics', icon: ShieldCheck },
];

export default function GovInfrastructure() {
  return (
    <section id="government" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#03050a] to-[#050811]">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              Government Cloud
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Digital Infrastructure for Government
            </h2>
            
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Secure, localized, and compliant infrastructure designed specifically for public sector workloads, empowering e-governance across Northeast India.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
              {govFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
              ))}
            </div>
            
            <a
              href="#explore-gov"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Explore Government Solutions
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Abstract visual representing government dashboard/nodes */}
            <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/10 p-8 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
              
              <div className="relative h-full flex flex-col gap-4">
                <div className="flex gap-4 h-1/3">
                  <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-50" />
                  </div>
                  <div className="w-1/3 rounded-2xl bg-white/5 border border-white/5" />
                </div>
                
                <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden">
                   <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-400/50 flex items-center justify-center">
                         <div className="w-16 h-16 rounded-full bg-emerald-400/20 animate-pulse" />
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-4 h-1/4">
                  <div className="w-1/4 rounded-2xl bg-white/5 border border-white/5" />
                  <div className="flex-1 rounded-2xl bg-white/5 border border-white/5" />
                  <div className="w-1/4 rounded-2xl bg-white/5 border border-white/5" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
