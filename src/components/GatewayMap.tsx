import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

const regions = [
  { name: 'Northeast India', status: 'Core Hub', top: '50%', left: '50%' },
  { name: 'Bangladesh', status: 'Vision', top: '70%', left: '40%' },
  { name: 'Bhutan', status: 'Vision', top: '35%', left: '45%' },
  { name: 'Nepal', status: 'Vision', top: '40%', left: '30%' },
  { name: 'Myanmar', status: 'Vision', top: '65%', left: '70%' },
];

export default function GatewayMap() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#050811] to-[#03050a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            A Digital Gateway for Northeast India
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Connecting regional innovation, cloud infrastructure, AI capabilities and digital services with emerging markets across the region.
          </p>
        </motion.div>

        <div className="relative w-full aspect-[2/1] max-h-[600px] bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            {/* Abstract map outline representation */}
            <div className="w-[80%] h-[80%] border border-dashed border-indigo-500/30 rounded-full" />
            <div className="absolute w-[60%] h-[60%] border border-dashed border-cyan-500/30 rounded-full" />
          </div>

          {regions.map((region, i) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="absolute group"
              style={{ top: region.top, left: region.left, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex flex-col items-center">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider mb-2 uppercase ${
                  region.status === 'Core Hub' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                    : 'bg-white/5 text-gray-500 border border-white/10'
                }`}>
                  {region.status}
                </div>
                
                <div className="relative">
                  {region.status === 'Core Hub' && (
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                  )}
                  <MapPin className={`w-6 h-6 ${region.status === 'Core Hub' ? 'text-indigo-400' : 'text-gray-600'}`} />
                </div>
                
                <span className={`mt-2 font-medium ${region.status === 'Core Hub' ? 'text-white' : 'text-gray-500'}`}>
                  {region.name}
                </span>
              </div>
            </motion.div>
          ))}
          
          {/* Legend */}
          <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-[#050811]/80 border border-white/10 backdrop-blur-md">
            <h4 className="text-white text-sm font-semibold mb-3">Map Legend</h4>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-400 text-xs">Current Operational Core</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full border border-gray-500" />
              <span className="text-gray-400 text-xs">Planned Regional Expansion (Vision)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
