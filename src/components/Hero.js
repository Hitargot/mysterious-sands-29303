import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "../styles/Hero.css";

const models = [
  { path: "/models/realistic_3d_bitcoin_model__crypto_asset.glb", scale: 2.7, position: [0, 0, 0] },
  { path: "/models/bag_of_money.glb", scale: 30, position: [0, 1.5, 0] },
  { path: "/models/realistic_3d_bitcoin_model__crypto_asset.glb", scale: 2.7, position: [0, 0, 0] },
];

const AnimatedModel = ({ model, visible }) => {
  const { scene } = useGLTF(model.path);
  const modelRef = useRef();

  useFrame(({ clock }) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Rotation effect
      modelRef.current.position.y = model.position[1] + Math.sin(clock.elapsedTime) * 0.2; // Floating effect
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

  useEffect(() => {
    setIsVisible(true); // Make sure model is visible when changed

    const interval = setInterval(() => {
      setIsVisible(false); // Fade out current model
      setTimeout(() => {
        setActiveModel((prev) => (prev + 1) % models.length);
        setIsVisible(true); // Fade in next model
      }, 500); // Short delay before switching models
    }, 4000); // Change model every 4 secs

    return () => clearInterval(interval);
  }, [activeModel]);

  return (
    <section id="home" className="hero-section">
      <div className="hero-content fade-in">
        <h1>Exchange instantly with Exdollarium!</h1>
        <p>Easily exchange your digital funds (gift card, PayPal, Payoneer, and crypto) for Naira!</p>
        <p className="reasons">
          Enjoy <b>fast, secure, and reliable transactions</b> with no delays or hidden fees—trusted by thousands and offering the best rate for maximum value!
        </p>
        <div className="cta-buttons">
          <button className="btn signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="btn login-btn" onClick={() => navigate("/login")}>Log In</button>
        </div>

      </div>

      <div className="canvas-container">
        <Canvas camera={{ position: [0, 3, 10], fov: 30 }} className="hero-3d-model">
          <ambientLight intensity={2} />
          <directionalLight position={[2, 5, 5]} />

          {models[activeModel] && <AnimatedModel model={models[activeModel]} visible={isVisible} />}

          <OrbitControls enableZoom={false} target={[0, 2, 0]} />
        </Canvas>
      </div>
    </section>
  );
};

export default Hero;
