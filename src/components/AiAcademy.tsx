import { motion } from 'motion/react';
import { BookOpen, Terminal, Shield, Database, GraduationCap, Award, Code2, Cloud } from 'lucide-react';

const courses = [
  { title: 'AI Training', icon: BookOpen },
  { title: 'Cloud Computing', icon: Cloud },
  { title: 'DevOps', icon: Terminal },
  { title: 'Cybersecurity', icon: Shield },
  { title: 'Data Engineering', icon: Database },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

export default function AiAcademy() {
  return (
    <section id="academy" className="py-24 relative overflow-hidden bg-[#03050a]">
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-16 backdrop-blur-sm relative overflow-hidden">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                Education & Training
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                DADsync AI Academy
              </h2>
              
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Building the next generation of AI and cloud professionals. We provide industry-aligned training, certifications, and hands-on experience with enterprise-grade infrastructure.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {['Internship', 'Certification', 'Industry Projects', 'Mentorship'].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {courses.map((course) => (
                <motion.div
                  key={course.title}
                  variants={item}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors"
                >
                  <course.icon className="w-8 h-8 text-purple-400 mb-3" />
                  <span className="font-medium text-white">{course.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
