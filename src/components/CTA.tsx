import { motion } from 'motion/react';

export default function CTA() {
  return (
    <section id="partner" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#050811] to-[#03050a]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build the Future of AI Infrastructure With Us
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            DADsync is building a scalable AI and digital infrastructure ecosystem designed to support enterprises, government, researchers, startups, and the next generation of technology businesses.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Partner With DADsync
            </a>
            <a
              href="#vision"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Explore Our Vision
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-full bg-transparent text-gray-300 font-semibold hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
