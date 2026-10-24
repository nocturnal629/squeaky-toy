"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

export type Animal = "panda" | "owl" | "bunny" | "cat";

export const ANIMALS: { id: Animal; emoji: string; label: string }[] = [
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "owl", emoji: "🦉", label: "Owl" },
  { id: "bunny", emoji: "🐰", label: "Bunny" },
  { id: "cat", emoji: "🐱", label: "Cat" },
];

interface Props {
  animal: Animal;
  /** Increment to trigger a squash-and-stretch hit. */
  hitCount: number;
  onTap: () => void;
}

const HANDLE: Record<Animal, { dark: string; light: string }> = {
  panda: { dark: "#3b4038", light: "#586056" },
  owl: { dark: "#7c4a2d", light: "#a86a43" },
  bunny: { dark: "#f9a8d4", light: "#fbcfe8" },
  cat: { dark: "#c2672a", light: "#e08a4c" },
};

function Handle({ animal }: { animal: Animal }) {
  const c = HANDLE[animal];
  return (
    <>
      <path d="M122 150 H178 Q184 215 196 255 Q205 305 150 308 Q95 305 104 255 Q116 215 122 150Z" fill={c.dark} />
      <ellipse cx="150" cy="262" rx="38" ry="36" fill={c.light} />
      <ellipse cx="138" cy="250" rx="12" ry="9" fill="#fff" opacity="0.35" />
    </>
  );
}

/** Rounded-rect head shared by all animals. */
function Head({ fill, stroke = "#e5e7eb" }: { fill: string; stroke?: string }) {
  return <rect x="30" y="38" width="240" height="124" rx="46" fill={fill} stroke={stroke} strokeWidth="3" />;
}

function Eyes({ patch, r = 15 }: { patch?: string; r?: number }) {
  return (
    <>
      {patch && (
        <>
          <ellipse cx="94" cy="96" rx="34" ry="32" fill={patch} />
          <ellipse cx="206" cy="96" rx="34" ry="32" fill={patch} />
        </>
      )}
      <circle cx="96" cy="96" r={r} fill="#1c1f26" />
      <circle cx="204" cy="96" r={r} fill="#1c1f26" />
      <circle cx="101" cy="90" r="5" fill="#fff" />
      <circle cx="209" cy="90" r="5" fill="#fff" />
    </>
  );
}

function Cheeks() {
  return (
    <>
      <ellipse cx="64" cy="124" rx="17" ry="12" fill="#f472b6" opacity="0.85" />
      <ellipse cx="236" cy="124" rx="17" ry="12" fill="#f472b6" opacity="0.85" />
    </>
  );
}

function Face({ animal }: { animal: Animal }) {
  switch (animal) {
    case "panda":
      return (
        <>
          <circle cx="78" cy="38" r="28" fill="#4b5247" />
          <circle cx="222" cy="38" r="28" fill="#4b5247" />
          <rect x="8" y="62" width="40" height="86" rx="20" fill="#3b4038" />
          <rect x="252" y="62" width="40" height="86" rx="20" fill="#3b4038" />
          <Head fill="#fafafa" />
          <Eyes patch="#5f685b" />
          <ellipse cx="150" cy="118" rx="22" ry="16" fill="#f1ece8" />
          <ellipse cx="150" cy="112" rx="8" ry="6" fill="#3b4038" />
          <Cheeks />
        </>
      );
    case "owl":
      return (
        <>
          {/* ear tufts */}
          <path d="M52 56 L62 4 L106 42Z" fill="#7c4a2d" />
          <path d="M248 56 L238 4 L194 42Z" fill="#7c4a2d" />
          {/* wing pieces */}
          <rect x="8" y="62" width="40" height="86" rx="20" fill="#6b3f25" />
          <rect x="252" y="62" width="40" height="86" rx="20" fill="#6b3f25" />
          <Head fill="#a86a43" stroke="#7c4a2d" />
          {/* face discs */}
          <ellipse cx="94" cy="96" rx="40" ry="38" fill="#f5e6d0" />
          <ellipse cx="206" cy="96" rx="40" ry="38" fill="#f5e6d0" />
          <circle cx="94" cy="96" r="24" fill="#fde68a" />
          <circle cx="206" cy="96" r="24" fill="#fde68a" />
          <circle cx="94" cy="96" r="14" fill="#1c1f26" />
          <circle cx="206" cy="96" r="14" fill="#1c1f26" />
          <circle cx="99" cy="90" r="5" fill="#fff" />
          <circle cx="211" cy="90" r="5" fill="#fff" />
          {/* beak */}
          <path d="M138 104 L162 104 L150 132Z" fill="#f59e0b" />
          <ellipse cx="60" cy="130" rx="14" ry="9" fill="#f472b6" opacity="0.6" />
          <ellipse cx="240" cy="130" rx="14" ry="9" fill="#f472b6" opacity="0.6" />
        </>
      );
    case "bunny":
      return (
        <>
          <ellipse cx="92" cy="-6" rx="22" ry="52" fill="#fafafa" stroke="#e5e7eb" strokeWidth="3" />
          <ellipse cx="208" cy="-6" rx="22" ry="52" fill="#fafafa" stroke="#e5e7eb" strokeWidth="3" />
          <ellipse cx="92" cy="-2" rx="10" ry="36" fill="#fbcfe8" />
          <ellipse cx="208" cy="-2" rx="10" ry="36" fill="#fbcfe8" />
          <rect x="8" y="62" width="40" height="86" rx="20" fill="#f9a8d4" />
          <rect x="252" y="62" width="40" height="86" rx="20" fill="#f9a8d4" />
          <Head fill="#fafafa" />
          <Eyes />
          <path d="M142 108 Q150 100 158 108 Q150 118 142 108Z" fill="#f472b6" />
          <path d="M150 114 V124 M150 124 Q140 134 132 126 M150 124 Q160 134 168 126" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
          <Cheeks />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M40 60 L52 4 L102 40Z" fill="#e08a4c" />
          <path d="M260 60 L248 4 L198 40Z" fill="#e08a4c" />
          <path d="M54 46 L58 20 L82 40Z" fill="#fbcfe8" />
          <path d="M246 46 L242 20 L218 40Z" fill="#fbcfe8" />
          <rect x="8" y="62" width="40" height="86" rx="20" fill="#c2672a" />
          <rect x="252" y="62" width="40" height="86" rx="20" fill="#c2672a" />
          <Head fill="#fb9f5e" stroke="#c2672a" />
          {/* stripes */}
          <path d="M130 40 V62 M150 38 V64 M170 40 V62" stroke="#c2672a" strokeWidth="6" strokeLinecap="round" />
          <Eyes patch="#fde68a" />
          <path d="M142 108 L158 108 L150 118Z" fill="#f472b6" />
          <path d="M150 118 Q140 130 130 124 M150 118 Q160 130 170 124" fill="none" stroke="#7c3a12" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 118 H30 M70 128 L34 140 M230 118 H270 M230 128 L266 140" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
  }
}

/**
 * Hammer-rattle toy drawn as inline SVG. Idle: gentle float + pulse.
 * On hit: squash & stretch + wobble.
 */
export default function Toy({ animal, hitCount, onTap }: Props) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (hitCount === 0) return;
    controls.start({
      scaleX: [1, 1.3, 0.85, 1.1, 0.97, 1],
      scaleY: [1, 0.7, 1.2, 0.92, 1.03, 1],
      rotate: [0, -14, 12, -8, 4, 0],
      rotateY: [0, 25, -25, 12, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    });
  }, [hitCount, controls]);

  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 600 }}
    >
      <motion.div
        className="absolute -bottom-4 left-1/2 h-4 w-40 -translate-x-1/2 rounded-full bg-sky-900/20 blur-md"
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.button
        type="button"
        aria-label={`Squeak the ${animal}`}
        onPointerDown={onTap}
        whileTap={{ scale: 0.94 }}
        animate={controls}
        style={{ originY: 0.85, transformStyle: "preserve-3d" }}
        className="block cursor-pointer focus:outline-none"
      >
        <motion.svg
          viewBox="-10 -60 320 400"
          className="h-[46vh] max-h-[420px] w-auto overflow-visible drop-shadow-xl"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Handle animal={animal} />
          <Face animal={animal} />
        </motion.svg>
      </motion.button>
    </motion.div>
  );
}
