import { motion } from 'motion/react';
import { Shield, Lock, Activity, Eye, FileWarning } from 'lucide-react';

const securityFeatures = [
  { title: 'Security Operations Center (SOC)', icon: Shield },
  { title: 'SIEM Integration', icon: Activity },
  { title: 'Threat Monitoring', icon: Eye },
  { title: 'Security Analytics', icon: FileWarning },
  { title: 'Access Control', icon: Lock },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24 relative overflow-hidden bg-[#050811]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative h-[400px] rounded-3xl bg-[#0a0f1c] border border-rose-500/20 overflow-hidden flex items-center justify-center"
          >
            {/* Dark cybersecurity visual */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center gap-6 w-full px-12">
              <div className="w-full flex items-center justify-between">
                <div className="px-4 py-2 rounded bg-white/5 text-gray-400 text-xs font-mono">INTERNET</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent relative">
                  <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                </div>
                <div className="px-4 py-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">FIREWALL</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent relative">
                  <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                </div>
                <div className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white text-xs font-mono">CORE INFRA</div>
              </div>
              
              <div className="w-full h-32 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <Shield className="w-12 h-12 text-rose-500 relative z-10 opacity-80" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Security by Architecture
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Enterprise-grade security integrated at every layer of our infrastructure. We protect your most sensitive data and workloads with advanced threat detection and continuous monitoring.
            </p>
            
            <div className="space-y-4">
              {securityFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium">{feature.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
