import { motion } from 'motion/react';
import { Brain, Languages, MessageSquare, Eye, Zap, Layers } from 'lucide-react';

const researchAreas = [
  { title: 'LLM Development', icon: Brain },
  { title: 'Bengali AI', icon: Languages },
  { title: 'Kokborok AI', icon: Languages },
  { title: 'Assamese AI', icon: Languages },
  { title: 'Voice AI', icon: MessageSquare },
  { title: 'Computer Vision', icon: Eye },
  { title: 'AI Agents', icon: Zap },
  { title: 'Multimodal AI', icon: Layers },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as any } }
};

export default function ResearchInnovation() {
  return (
    <section id="research" className="py-24 relative bg-[#050811]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            From Infrastructure to Intelligence
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Pioneering AI research to develop localized models and intelligent systems tailored for the unique linguistic and cultural landscape of Northeast India.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {researchAreas.map((area) => (
            <motion.div
              key={area.title}
              variants={item}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
            >
              <area.icon className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white">{area.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
