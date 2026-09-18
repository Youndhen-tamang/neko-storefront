"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a Spline scene into a canvas when a public scene URL is configured.
 * Returns null otherwise so the caller can show its own fallback.
 * The runtime is loaded lazily on the client, so it never enters the server bundle.
 */
export function SplineSlot({ scene, className }: { scene?: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!scene || !canvas.current) return;
    let disposed = false;
    let app: { dispose: () => void } | null = null;

    import("@splinetool/runtime").then(({ Application }) => {
      if (disposed || !canvas.current) return;
      const instance = new Application(canvas.current);
      app = instance;
      instance.load(scene).catch(() => {
        // A scene that fails to load leaves the panel's own ground visible.
      });
    });

    return () => {
      disposed = true;
      app?.dispose();
    };
  }, [scene]);

  if (!scene) return null;
  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvas} className="h-full w-full" />
    </div>
  );
}
