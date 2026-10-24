"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MotionPermission = "unknown" | "granted" | "denied" | "unsupported";

type IOSDeviceMotionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

interface Options {
  /** Deviation from gravity (m/s²) that counts as a shake. */
  threshold?: number;
  /** Minimum ms between shake callbacks. */
  cooldownMs?: number;
  onShake: (force: number) => void;
}

export function useShakeDetection({
  threshold = 10,
  cooldownMs = 200,
  onShake,
}: Options) {
  const [permission, setPermission] = useState<MotionPermission>("unknown");
  const onShakeRef = useRef(onShake);
  const thresholdRef = useRef(threshold);
  const stats = useRef({ events: 0, force: 0 });
  const [sensor, setSensor] = useState({ events: 0, force: 0 });

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
      // Deviation of total acceleration from gravity (~9.81 m/s²): ~0 at rest, 10-40 when shaken.
      const force = Math.abs(Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) - 9.81);
      stats.current.events += 1;
      stats.current.force = force;
      const now = Date.now();
      if (force > thresholdRef.current && now - lastShake > cooldownMs) {
        lastShake = now;
        onShakeRef.current(force);
      }
    };

    window.addEventListener("devicemotion", handler);
    // Surface live sensor stats (~7 Hz) for the on-screen diagnostic.
    const timer = setInterval(() => setSensor({ ...stats.current }), 150);
    return () => {
      window.removeEventListener("devicemotion", handler);
      clearInterval(timer);
    };
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

  return { permission, requestPermission, sensor };
}
