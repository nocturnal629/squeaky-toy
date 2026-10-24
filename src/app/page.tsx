"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Toy, { ANIMALS, type Animal } from "@/components/Toy";
import PermissionModal from "@/components/PermissionModal";
import { useShakeDetection } from "@/hooks/useShakeDetection";

const DEBOUNCE_MS = 200;

export default function Home() {
  const [hitCount, setHitCount] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [animal, setAnimal] = useState<Animal>("panda");

  useEffect(() => {
    const saved = localStorage.getItem("animal");
    if (ANIMALS.some((a) => a.id === saved)) setAnimal(saved as Animal);
  }, []);

  const chooseAnimal = (a: Animal) => {
    setAnimal(a);
    localStorage.setItem("animal", a);
  };
  const [showModal, setShowModal] = useState(true); // always shown first: needed to unlock audio (and iOS motion)
  const [showSettings, setShowSettings] = useState(false);
  const [bubbles, setBubbles] = useState<
    { id: number; left: number; size: number; dur: number; delay: number; drift: number }[]
  >([]);

  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const lastPlay = useRef(0);

  // Random bubbles generated client-side only (avoids hydration mismatch).
  useEffect(() => {
    setBubbles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 30,
        dur: 7 + Math.random() * 8,
        delay: Math.random() * -12,
        drift: (Math.random() - 0.5) * 80,
      }))
    );
  }, []);

  /** Create/resume the AudioContext and load the sound. Call from a user gesture. */
  const unlockAudio = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") await ctx.resume();
    if (!bufferRef.current) {
      try {
        const res = await fetch("/squeak.mp3");
        bufferRef.current = await ctx.decodeAudioData(await res.arrayBuffer());
      } catch (err) {
        console.error("Could not load /squeak.mp3", err);
      }
    }
  }, []);

  const squeak = useCallback(() => {
    const now = performance.now();
    if (now - lastPlay.current < DEBOUNCE_MS) return;
    lastPlay.current = now;

    setHitCount((c) => c + 1);
    if (navigator.vibrate) navigator.vibrate(40);

    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer || ctx.state !== "running") return;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = 0.9 + Math.random() * 0.25; // slight pitch variation
    src.connect(ctx.destination);
    src.start();
  }, []);

  const { permission, requestPermission } = useShakeDetection({
    threshold,
    cooldownMs: DEBOUNCE_MS,
    onShake: squeak,
  });

  const handleEnable = async () => {
    // iOS only allows the motion prompt directly inside the tap, so fire it
    // first (no awaits before it); audio unlock runs alongside.
    const motion = requestPermission();
    const audio = unlockAudio();
    await Promise.all([motion, audio]);
    setShowModal(false);
  };

  const handleTap = () => {
    // Taps are also a gesture, so they can unlock audio on first use.
    void unlockAudio().then(squeak);
  };

  const motionStatus = useMemo(() => {
    if (permission === "granted") return "Shake detection on 📳";
    if (permission === "denied") return "Motion blocked — tap instead";
    if (permission === "unsupported") return "No motion sensor — tap instead";
    return "";
  }, [permission]);

  return (
    <main className="bg-scene relative app-h flex w-full flex-col items-center justify-between overflow-hidden">
      {/* water ripples */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ripple"
            style={{
              left: `${20 + i * 25}%`,
              top: `${20 + (i % 2) * 30}%`,
              width: 140,
              height: 50,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}
        <svg className="wave absolute bottom-0 h-16 w-[200%]" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 30 Q 75 0 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30 V60 H0Z" fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>

      {/* bubbles */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            ["--drift" as string]: `${b.drift}px`,
          }}
        />
      ))}

      {/* title */}
      <motion.h1
        className="font-bubbly z-10 mt-4 text-4xl font-extrabold text-white"
        style={{ textShadow: "0 4px 0 #0ea5e9, 0 8px 12px rgba(2,132,199,.4)" }}
        animate={{ scale: [1, 1.06, 1], rotate: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        SHAKE ME!
      </motion.h1>

      {/* toy */}
      <div className="z-10 flex flex-1 items-center justify-center">
        <Toy animal={animal} hitCount={hitCount} onTap={handleTap} />
      </div>

      {/* animal picker */}
      <div className="z-10 mb-2 flex gap-2 rounded-full bg-white/30 p-1.5 backdrop-blur" role="radiogroup" aria-label="Choose your toy">
        {ANIMALS.map((a) => (
          <button
            key={a.id}
            role="radio"
            aria-checked={animal === a.id}
            aria-label={a.label}
            onClick={() => chooseAnimal(a.id)}
            className={`h-11 w-11 rounded-full text-2xl transition ${
              animal === a.id ? "bg-white shadow-md scale-110" : "opacity-80"
            }`}
          >
            {a.emoji}
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="z-10 flex flex-col items-center gap-2 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <p className="font-bubbly text-lg font-bold text-white" style={{ textShadow: "0 2px 4px rgba(2,132,199,.6)" }}>
          Tap or Shake Your Phone!
        </p>
        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.9 }}
          className="font-bubbly rounded-full bg-pink-500 px-8 py-3 text-xl font-extrabold text-white shadow-lg"
        >
          Shake!
        </motion.button>
        <div className="flex items-center gap-3 text-xs text-white/90">
          <span>{motionStatus}</span>
          {permission === "denied" || permission === "unknown" ? (
            <button className="underline" onClick={() => setShowModal(true)}>
              Enable
            </button>
          ) : null}
          <button className="underline" onClick={() => setShowSettings((s) => !s)}>
            Sensitivity
          </button>
        </div>
        {showSettings && (
          <label className="flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-xs text-white backdrop-blur">
            Hard
            <input
              type="range"
              min={3}
              max={30}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              aria-label="Shake force threshold"
            />
            Gentle
            <span className="w-6 text-right">{threshold}</span>
          </label>
        )}
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-[10px] text-white/70"
        >
          Powered by ▲ Vercel
        </a>
      </div>

      <PermissionModal
        open={showModal}
        onEnable={handleEnable}
        onSkip={() => setShowModal(false)}
      />
    </main>
  );
}
