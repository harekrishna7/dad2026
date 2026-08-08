import { motion } from 'motion/react';

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    items: ['AI Cloud', 'Enterprise Cloud', 'Government Cloud', 'AI Academy'],
  },
  {
    phase: 'Phase 2',
    title: 'Expansion',
    items: ['AI Research', 'Cyber Defense', 'AI Marketplace', 'Startup Incubation', 'Regional Cloud'],
  },
  {
    phase: 'Phase 3',
    title: 'Future Vision',
    items: ['HPC', 'AI Supercomputing', 'Digital Twin', 'Robotics', 'Advanced AI Infrastructure'],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

export default function Roadmap() {
  return (
    <section className="py-24 relative bg-[#03050a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Future Technology Roadmap
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our strategic vision for deploying next-generation digital infrastructure across the region.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 hidden md:block" />

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-8">
            {roadmapPhases.map((phase) => (
              <motion.div
                key={phase.phase}
                variants={item}
                className="relative"
              >
                {/* Node dot on the line */}
                <div className="w-6 h-6 rounded-full bg-[#03050a] border-4 border-indigo-500 absolute left-1/2 top-0 md:top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10" />
                
                <div className="pt-8 md:pt-16 pb-8 px-6 bg-white/[0.02] border border-white/5 rounded-2xl md:bg-transparent md:border-none md:p-0">
                  <div className="inline-block px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 text-sm font-bold mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">{phase.title}</h3>
                  <ul className="space-y-3">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
