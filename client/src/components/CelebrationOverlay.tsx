import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CelebrationType = "spare" | "strike" | "double" | "turkey" | null;

interface CelebrationOverlayProps {
  type: CelebrationType;
  onComplete?: () => void;
  enabled?: boolean;
}

const CELEBRATION_CONFIG = {
  spare: {
    text: "SPARE!",
    color: "text-chart-2",
    bg: "bg-chart-2/20",
    duration: 1500,
    scale: 1.1,
  },
  strike: {
    text: "STRIKE!",
    color: "text-primary",
    bg: "bg-primary/20",
    duration: 1800,
    scale: 1.2,
  },
  double: {
    text: "DOUBLE!",
    color: "text-chart-3",
    bg: "bg-chart-3/20",
    duration: 2000,
    scale: 1.3,
  },
  turkey: {
    text: "TURKEY!",
    color: "text-destructive",
    bg: "bg-destructive/20",
    duration: 2500,
    scale: 1.4,
  },
};

export function CelebrationOverlay({ type, onComplete, enabled = true }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type && enabled) {
      setVisible(true);
      const config = CELEBRATION_CONFIG[type];
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, [type, enabled, onComplete]);

  if (!type || !enabled) return null;

  const config = CELEBRATION_CONFIG[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: config.scale }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className={`
            fixed inset-0 z-50 flex items-center justify-center pointer-events-none
            ${config.bg}
          `}
          data-testid={`celebration-${type}`}
        >
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 5, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-center"
          >
            <h1 className={`text-5xl font-black tracking-wider ${config.color}`}>
              {config.text}
            </h1>
            {type === "turkey" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-lg font-bold text-muted-foreground"
              >
                3 Strikes in a Row!
              </motion.div>
            )}
            {type === "double" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-lg font-bold text-muted-foreground"
              >
                2 Strikes in a Row!
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LaneAnimationProps {
  isAnimating: boolean;
  pinsKnocked: number;
  isStrike: boolean;
  onComplete?: () => void;
}

export function LaneAnimation({ isAnimating, pinsKnocked, isStrike, onComplete }: LaneAnimationProps) {
  const [showBall, setShowBall] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setShowBall(true);
      const timer = setTimeout(() => {
        setShowBall(false);
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, onComplete]);

  if (!isAnimating && !showBall) return null;

  return (
    <div className="relative w-full h-32 bg-gradient-to-b from-amber-900/30 to-amber-800/20 rounded-md overflow-hidden mb-4">
      <div className="absolute inset-x-0 bottom-0 h-8 flex items-end justify-center pb-1">
        <div className="w-16 h-6 bg-muted/50 rounded-t-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Pins</span>
        </div>
      </div>
      
      <div className="absolute left-1/2 top-0 w-px h-full bg-border/30" />
      <div className="absolute left-1/4 top-0 w-px h-full bg-border/20" />
      <div className="absolute right-1/4 top-0 w-px h-full bg-border/20" />
      
      <AnimatePresence>
        {showBall && (
          <motion.div
            initial={{ y: "100%", x: "-50%", scale: 1.2 }}
            animate={{ y: "10%", x: "-50%", scale: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute left-1/2 bottom-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showBall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-x-0 top-2 flex justify-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${isStrike ? "text-primary" : "text-foreground"}`}
            >
              {isStrike ? "X" : pinsKnocked}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
