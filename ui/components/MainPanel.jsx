// MainPanel component – cinematic UI with hero image and particle effect
import { useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import ParticleEngine from '../utils/ParticleEngine.js';
// CSS is loaded via a <link> tag in the template

/**
 * MainPanel renders a premium visual panel with:
 *  - Dark translucent overlay with backdrop blur
 *  - Hero image that breaks the top border (out‑of‑bounds effect)
 *  - Canvas‑based particle animation for ambience
 */
export function MainPanel() {
  const storeState = useStore();
  const heroImageUrl = storeState?.heroImage || 'assets/logo.png';
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particleEngineRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      particleEngineRef.current = new ParticleEngine(canvasRef.current, {
        density: 80,
        depthRange: [1, 4]
      });
      particleEngineRef.current.start();
    }

    const slainListener = () => {
      if (particleEngineRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        particleEngineRef.current.explosion({
          x: rect.width / 2, 
          y: rect.height / 2, 
          color: '239,68,68', // Sangue / Escarlate
          count: 350, 
          speed: 18 
        });
      }
    };
    
    const fallenListener = () => {
      if (particleEngineRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        particleEngineRef.current.explosion({
          x: rect.width / 2, 
          y: rect.height / 2, 
          color: '229,193,123', // Ouro Frio / Cinzas Arcanas
          count: 400, 
          speed: 25 
        });
      }
    };

    if (window.TOME?.events) {
      window.TOME.events.on('ENTITY_SLAIN', slainListener);
      window.TOME.events.on('HERO_FALLEN', fallenListener);
    }

    return () => {
      if (particleEngineRef.current) {
        particleEngineRef.current.stop();
        particleEngineRef.current = null;
      }
      if (window.TOME?.events) {
        window.TOME.events.off('ENTITY_SLAIN', slainListener);
        window.TOME.events.off('HERO_FALLEN', fallenListener);
      }
    };
  }, []);

  return (
    <div ref={containerRef} class="relative w-full h-screen overflow-hidden bg-obsidian-900/90 backdrop-blur-md flex items-center justify-center text-slate-100 font-sans">
      <canvas ref={canvasRef} class="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]" id="particleCanvas"></canvas>
      <img class="absolute top-[-20%] left-1/2 -translate-x-1/2 max-w-[30vw] md:max-w-[60vw] h-auto z-10 animate-[heroSlideIn_0.6s_ease-out_forwards]" src={heroImageUrl} alt="Hero" />
      <style>
        {`
        @keyframes heroSlideIn {
          0% { top: -40%; opacity: 0; }
          100% { top: -20%; opacity: 1; }
        }
        `}
      </style>
    </div>
  );
}
