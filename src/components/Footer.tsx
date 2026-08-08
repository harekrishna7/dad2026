export default function Footer() {
  return (
    <footer className="bg-[#03050a] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">DADsync</h3>
            <p className="text-gray-400 max-w-sm mb-6">
              Dharmanagar AI DataSync Private Limited. Powering Northeast India’s AI Future through advanced cloud infrastructure and research.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Infrastructure</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">AI Cloud</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">GPU Compute</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Government Cloud</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Enterprise Cloud</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Research</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Academy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Dharmanagar AI DataSync Private Limited. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
