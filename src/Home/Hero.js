import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const models = [
  { path: "/models/realistic_3d_bitcoin_model__crypto_asset.glb", scale: 2.7, position: [0, 0, 0] },
  { path: "/models/bag_of_money.glb", scale: 30, position: [0, 1.5, 0] },
  { path: "/models/realistic_3d_bitcoin_model__crypto_asset.glb", scale: 2.7, position: [0, 0, 0] },
];

const AnimatedModel = ({ model, visible, isDesktop }) => {
  const { scene } = useGLTF(model.path);
  const modelRef = useRef();

  useFrame(({ clock }) => {
    if (modelRef.current) {
      // Only animate rotation/motion on desktop to save mobile CPU/GPU
      if (isDesktop) {
        modelRef.current.rotation.y += 0.01; // Rotation effect
        modelRef.current.position.y = model.position[1] + Math.sin(clock.elapsedTime) * 0.2; // Floating effect
      }
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={model.scale}
      position={model.position}
      style={{
        opacity: visible ? 1 : 0, // Hide model when not visible
        transition: "opacity 1s ease-in-out",
        pointerEvents: 'none',
      }}
    />
  );
};

if (Array.isArray(models)) {
  models.forEach(({ path }) => useGLTF.preload(path));
}

const Hero = () => {
  const navigate = useNavigate();
  const [activeModel, setActiveModel] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Controls model visibility
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 720 : true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Only rotate models on desktop to avoid mobile performance hit
    if (!isDesktop) return;

    setIsVisible(true);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setActiveModel((prev) => (prev + 1) % models.length);
        setIsVisible(true);
      }, 400);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeModel, isDesktop]);

  useEffect(() => {
    // trigger mount animation
    setMounted(true);
  }, []);

  // Inline styles (replacing external CSS)
  const styles = {
    heroSection: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 3%',
      background: 'linear-gradient(180deg, #f8fbff 0%, #eaf3ff 100%)',
      borderRadius: 10,
      boxSizing: 'border-box',
      flexDirection: isDesktop ? 'row' : 'column',
    },
  // On mobile avoid forcing a large base flex size; use auto-sizing instead
  heroLeft: { flex: isDesktop ? '1 1 560px' : '1 1 auto', maxWidth: isDesktop ? 720 : '100%' },
    // collapse right column on mobile
    heroRight: { flex: '1 1 420px', display: isDesktop ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', width: isDesktop ? undefined : '100%' },
    heroContent: { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 420ms ease-out, transform 420ms ease-out' },
    heroTitle: { fontSize: window.innerWidth <= 720 ? '1.3rem' : '2rem', color: '#0f2348', lineHeight: 1.08, margin: '0 0 12px 0', fontWeight: 800 },
    heroSub: { color: '#334155', fontSize: window.innerWidth <= 720 ? '0.95rem' : '1.05rem', margin: '0 0 14px 0' },
    heroCta: { display: 'flex', gap: 12, marginBottom: 12 },
    btn: { padding: '12px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.98rem' },
    primary: { background: 'linear-gradient(90deg,#162660,#1f3b7a)', color: '#fff', boxShadow: '0 8px 30px rgba(16,24,40,0.08)' },
    ghost: { background: 'transparent', color: '#162660', border: '1px solid rgba(16,24,40,0.06)' },
    heroFeatures: { display: 'flex', gap: 12, margin: 0, padding: 0, listStyle: 'none', color: '#475569', fontSize: '0.95rem' },
    featureItem: { background: 'rgba(16,24,40,0.03)', padding: '8px 10px', borderRadius: 8 },
  // Only show the Canvas on desktop; on mobile show a lightweight placeholder
  canvasContainer: { width: '100%', height: isDesktop ? 260 : 200 },
    heroGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    svgPlaceholder: { width: 220, height: 140 },
  };

  return (
    <section id="home" style={styles.heroSection}>
      <div style={styles.heroLeft}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Exchange digital funds to Naira — fast & secure</h1>
          <p style={styles.heroSub}>Convert PayPal, Payoneer, gift cards and crypto with competitive rates and instant payouts.</p>

          <div style={styles.heroCta}>
            <button style={{ ...styles.btn, ...styles.primary }} onClick={() => navigate('/login')}>Get Started — It's Free</button>
            <button
              style={{ ...styles.btn, ...styles.ghost }}
              onClick={() => {
                // Scroll to contact section if present on the same page, otherwise navigate
                const el = typeof document !== 'undefined' && document.getElementById('contact');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  navigate('/contact');
                }
              }}
            >
              Talk to Sales
            </button>
          </div>

          <ul style={styles.heroFeatures}>
            <li style={styles.featureItem}>Instant payouts — typically within minutes</li>
            <li style={styles.featureItem}>Transparent rates, no hidden fees</li>
            <li style={styles.featureItem}>Secure transactions & 24/7 support</li>
          </ul>
        </div>
      </div>

      <div style={styles.heroRight}>
        {isDesktop ? (
          <div style={styles.canvasContainer}>
            <div style={{ width: '100%', height: '100%' }}>
              <Canvas
                camera={{ position: [0, 3, 10], fov: 30 }}
                style={{ width: '100%', height: '100%' }}
                dpr={isDesktop ? [1, typeof window !== 'undefined' ? window.devicePixelRatio : 1] : 1}
                gl={{ antialias: isDesktop, powerPreference: isDesktop ? 'high-performance' : 'low-power' }}
              >
                <ambientLight intensity={isDesktop ? 1.6 : 0.9} />
                <directionalLight position={[2, 5, 5]} />

                {models[activeModel] && (
                  <AnimatedModel model={models[activeModel]} visible={isVisible} isDesktop={isDesktop} />
                )}

                {/* Keep OrbitControls but disable interactions on mobile */}
                <OrbitControls enableZoom={false} enablePan={isDesktop} enableRotate={isDesktop} target={[0, 2, 0]} />
              </Canvas>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;