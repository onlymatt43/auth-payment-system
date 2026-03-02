'use client';

/**
 * Motion Effects Component
 * Adds global CSS animations for twinkling lights, glowing effects, etc.
 */
export function MotionEffects() {
  return (
    <style>{`
      /* Twinkling animation - subtle pulsing glow */
      @keyframes twinkle {
        0%, 100% { opacity: 0.8; filter: brightness(1); }
        50% { opacity: 1; filter: brightness(1.2); }
      }

      /* Glow pulse - for attention-grabbing elements */
      @keyframes glowPulse {
        0%, 100% { 
          filter: drop-shadow(0 0 8px rgba(255, 255, 0, 0.3)) 
                  drop-shadow(0 0 4px rgba(255, 255, 0, 0.1));
        }
        50% { 
          filter: drop-shadow(0 0 16px rgba(255, 255, 0, 0.6)) 
                  drop-shadow(0 0 8px rgba(255, 255, 0, 0.3));
        }
      }

      /* Animated gradient background */
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Cards floating effect */
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      /* Shimmer effect - light reflection */
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }

      /* Classes for animations */
      .animate-twinkle {
        animation: twinkle 3s ease-in-out infinite;
      }

      .animate-glow-pulse {
        animation: glowPulse 2s ease-in-out infinite;
      }

      .animate-gradient-shift {
        background-size: 200% 200%;
        animation: gradientShift 6s ease infinite;
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-shimmer {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        background-size: 1000px 100%;
        animation: shimmer 3s infinite;
      }

      /* Smooth hover lift effect (desktop only) */
      @media (hover: hover) {
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.4));
        }
      }

      /* Glow on hover */
      @media (hover: hover) {
        .hover-glow {
          transition: all 0.3s ease;
        }

        .hover-glow:hover {
          filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.6));
        }
      }

      /* Scale on hover - subtle */
      @media (hover: hover) {
        .hover-scale {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }
      }

      /* Cursor glow effect container */
      .cursor-glow-container {
        position: relative;
        overflow: hidden;
      }

      .cursor-glow-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(0, 217, 255, 0.15) 0%,
          transparent 50%
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .cursor-glow-container:hover::before {
        opacity: 1;
      }
    `}</style>
  );
}

/**
 * Twinkling Stars/Lights decorative element
 */
export function TwinklingLights({ count = 5, intensity = 'subtle' }) {
  const baseDelay = intensity === 'subtle' ? 3 : 2;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `rgba(255, 255, 0, ${Math.random() * 0.5 + 0.3})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * baseDelay}s`,
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 0, 0.8))',
          }}
        />
      ))}
    </>
  );
}
