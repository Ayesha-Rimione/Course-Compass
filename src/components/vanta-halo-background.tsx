import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    THREE?: any;
    VANTA?: {
      HALO?: (options: Record<string, any>) => { destroy: () => void };
    };
  }
}

interface VantaHaloProps {
  className?: string;
  baseColor?: number;
  backgroundColor?: number;
  size?: number;
  amplitudeFactor?: number;
  xOffset?: number;
  yOffset?: number;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function VantaHaloBackground({
  className = "",
  baseColor = 0x553202,
  backgroundColor = 0x154808,
  size = 1.10,
  amplitudeFactor = 1.0,
  xOffset = 0,
  yOffset = 0,
  overlayOpacity = 0.45,
  children,
}: VantaHaloProps) {
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
      if (window.VANTA && window.VANTA.HALO && vantaRef.current && isSubscribed) {
        try {
          vantaEffect = window.VANTA.HALO({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            baseColor: baseColor,
            backgroundColor: backgroundColor,
            size: size,
            amplitudeFactor: amplitudeFactor,
            xOffset: xOffset,
            yOffset: yOffset,
          });
          setIsLoaded(true);
        } catch (err) {
          console.error("Failed to initialize Vanta Halo background:", err);
        }
      }
    };

    const setup = async () => {
      try {
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js");
        }
        if (!window.VANTA || !window.VANTA.HALO) {
          await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js");
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
  }, [baseColor, backgroundColor, size, amplitudeFactor, xOffset, yOffset]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Vanta WebGL Container */}
      <div
        ref={vantaRef}
        id="vanta-bg"
        className="absolute inset-0 z-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Classy Gradient Overlay for Text Legibility & Smooth Blend */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/30 via-background/60 to-background"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
