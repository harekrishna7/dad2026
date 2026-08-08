import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, MeshDistortMaterial, Trail, Float, Stars, Environment } from '@react-three/drei';
import { motion } from 'motion/react';
import * as THREE from 'three';

// 3D Core Node
function CoreNode() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <MeshDistortMaterial
          color="#1e1b4b" // Deep violet
          emissive="#4338ca" // Indigo glow
          emissiveIntensity={2}
          wireframe
          distort={0.4}
          speed={2}
        />
      </mesh>
      
      {/* Inner glowing sphere */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color="#06b6d4" // Cyan
          emissive="#0891b2"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </Sphere>
    </Float>
  );
}

// Data Streams
function DataStreams() {
  const lines = useMemo(() => {
    return Array.from({ length: 15 }).map(() => {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      const end = new THREE.Vector3().copy(start).multiplyScalar(0.2); // towards center
      return { start, end };
    });
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <Trail
          key={i}
          width={0.2}
          color={new THREE.Color(i % 2 === 0 ? '#06b6d4' : '#6366f1')} // cyan or indigo
          length={2}
          decay={1}
          local={false}
          stride={0}
          interval={1}
        >
          <mesh position={line.start}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </Trail>
      ))}
    </group>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#050811]" />
      <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        
        {/* Left Side: Content */}
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Powering Northeast India’s AI Future
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              The Engine for <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                AI Infrastructure
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              Building the next generation of AI cloud, data infrastructure, HPC, cybersecurity, and digital technology from Northeast India.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#infrastructure"
                className="px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Explore Infrastructure
              </a>
              <a
                href="#partner"
                className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Partner With Us
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Side: 3D Visualization */}
        <div className="h-[500px] lg:h-[700px] w-full relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="w-full h-full"
          >
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
              <Environment preset="city" />
              
              <Stars radius={10} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
              
              <CoreNode />
              
              {/* Note: Trail requires moving meshes to generate trails. For a simple static setup, we'll rely on the spinning core and stars. */}
              
              {/* Optional: OrbitControls for user interaction, but kept disabled or limited to avoid breaking layout */}
              {/* <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} /> */}
            </Canvas>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}
