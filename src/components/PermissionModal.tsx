"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  /** Called from the button's click handler so it counts as a user gesture. */
  onEnable: () => void | Promise<void>;
  onSkip: () => void;
}

export default function PermissionModal({ open, onEnable, onSkip }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-sky-900/50 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="perm-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <div className="text-5xl">🐼</div>
            <h2 id="perm-title" className="font-bubbly mt-2 text-2xl font-extrabold text-sky-600">
              Ready to play?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Allow motion access so you can shake your phone to squeak the
              panda. This also turns the sound on.
            </p>
            <button
              onClick={onEnable}
              className="font-bubbly mt-5 w-full rounded-full bg-pink-500 py-3 text-lg font-bold text-white shadow-lg active:scale-95"
            >
              Enable Motion &amp; Sound
            </button>
            <button
              onClick={onSkip}
              className="mt-3 text-sm text-slate-500 underline"
            >
              Just let me tap instead
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
