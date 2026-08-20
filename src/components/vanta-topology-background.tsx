import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    p5?: any;
    VANTA?: {
      TOPOLOGY?: (options: Record<string, any>) => { destroy: () => void };
    };
  }
}

interface VantaTopologyProps {
  className?: string;
  color?: number;
  backgroundColor?: number;
  scale?: number;
  scaleMobile?: number;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function VantaTopologyBackground({
  className = "",
  color = 0x89964e,
  backgroundColor = 0x0e1726,
  scale = 1.0,
  scaleMobile = 1.0,
  overlayOpacity = 0.55,
  children,
}: VantaTopologyProps) {
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
      if (window.VANTA && window.VANTA.TOPOLOGY && vantaRef.current && isSubscribed) {
        try {
          vantaEffect = window.VANTA.TOPOLOGY({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: scale,
            scaleMobile: scaleMobile,
            color: color,
            backgroundColor: backgroundColor,
          });
          setIsLoaded(true);
        } catch (err) {
          console.error("Failed to initialize Vanta Topology background:", err);
        }
      }
    };

    const setup = async () => {
      try {
        if (!window.p5) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js");
        }
        if (!window.VANTA || !window.VANTA.TOPOLOGY) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js");
        }
        initVanta();
      } catch (err) {
        console.error("Error loading Vanta Topology scripts:", err);
      }
    };

    setup();

    return () => {
      isSubscribed = false;
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [color, backgroundColor, scale, scaleMobile]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Vanta WebGL Container */}
      <div
        ref={vantaRef}
        id="vanta-topology-bg"
        className="absolute inset-0 z-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Classy Overlay Gradient for Chat Readability */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
