import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    THREE?: any;
    VANTA?: {
      BIRDS?: (options: Record<string, any>) => { destroy: () => void };
      HALO?: (options: Record<string, any>) => { destroy: () => void };
      TOPOLOGY?: (options: Record<string, any>) => { destroy: () => void };
    };
  }
}

interface VantaBirdsProps {
  className?: string;
  backgroundColor?: number;
  color1?: number;
  color2?: number;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  quantity?: number;
  children?: React.ReactNode;
}

export function VantaBirdsBackground({
  className = "",
  backgroundColor = 0xe5f2e5,
  color1 = 0x1e6121,
  color2 = 0xb3ff00,
  birdSize = 3.00,
  wingSpan = 24.00,
  speedLimit = 5.00,
  quantity = 5.00,
  children,
}: VantaBirdsProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let vantaEffect: { destroy: () => void } | null = null;
    let isSubscribed = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    const initVanta = () => {
      if (window.VANTA && window.VANTA.BIRDS && vantaRef.current && isSubscribed) {
        try {
          vantaEffect = window.VANTA.BIRDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor,
            color1,
            color2,
            birdSize,
            wingSpan,
            speedLimit,
            quantity,
          });
          setIsLoaded(true);
        } catch (err) {
          console.error("Failed to initialize Vanta Birds background:", err);
        }
      }
    };

    const setup = async () => {
      try {
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        }
        if (!window.VANTA || !window.VANTA.BIRDS) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js");
        }
        initVanta();
      } catch (err) {
        console.error("Error loading Vanta scripts:", err);
      }
    };

    setup();

    return () => {
      isSubscribed = false;
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [backgroundColor, color1, color2, birdSize, wingSpan, speedLimit, quantity]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Vanta WebGL Birds Container */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-0 h-full w-full transition-opacity duration-700 pointer-events-none"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Subtle backdrop overlay for contrast & readability */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-background/20 backdrop-blur-[1px]" />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
