"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MotionPermission = "unknown" | "granted" | "denied" | "unsupported";

type IOSDeviceMotionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

interface Options {
  /** Change in acceleration (m/s²) between samples that counts as a shake. */
  threshold?: number;
  /** Minimum ms between shake callbacks. */
  cooldownMs?: number;
  onShake: (force: number) => void;
}

export function useShakeDetection({
  threshold = 15,
  cooldownMs = 200,
  onShake,
}: Options) {
  const [permission, setPermission] = useState<MotionPermission>("unknown");
  const onShakeRef = useRef(onShake);
  const thresholdRef = useRef(threshold);
  const last = useRef({ x: 0, y: 0, z: 0, t: 0, init: false });

  useEffect(() => {
    onShakeRef.current = onShake;
    thresholdRef.current = threshold;
  }, [onShake, threshold]);

  // Detect support / whether permission is needed.
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setPermission("unsupported");
      return;
    }
    const ctor = DeviceMotionEvent as IOSDeviceMotionEvent;
    if (typeof ctor.requestPermission !== "function") {
      // Android Chrome / others: no explicit prompt required.
      setPermission("granted");
    }
  }, []);

  // Listen for motion once permission is granted.
  useEffect(() => {
    if (permission !== "granted") return;

    let lastShake = 0;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const prev = last.current;
      if (prev.init) {
        const force = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);
        const now = Date.now();
        if (force > thresholdRef.current && now - lastShake > cooldownMs) {
          lastShake = now;
          onShakeRef.current(force);
        }
      }
      last.current = { x: a.x, y: a.y, z: a.z, t: Date.now(), init: true };
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [permission, cooldownMs]);

  /** Must be called from a user gesture (required by iOS). */
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const ctor = DeviceMotionEvent as IOSDeviceMotionEvent;
    if (typeof ctor.requestPermission === "function") {
      try {
        const result = await ctor.requestPermission();
        setPermission(result);
        return result;
      } catch {
        setPermission("denied");
        return "denied" as const;
      }
    }
    setPermission("granted");
    return "granted" as const;
  }, []);

  return { permission, requestPermission };
}
