import type { BowlingBall, BallRarity } from "@shared/schema";

interface BallVisualProps {
  ball: BowlingBall;
  size?: "sm" | "md" | "lg";
  showRarity?: boolean;
  className?: string;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

const COLORS = [
  "#1e3a5f", "#2d5a87", "#4a7c9b", "#6b9dc4",
  "#8b1538", "#b01c48", "#d4296a", "#e84393",
  "#1a472a", "#2d6a4f", "#40916c", "#52b788",
  "#7c2d12", "#9a3412", "#c2410c", "#ea580c",
  "#3730a3", "#4338ca", "#6366f1", "#818cf8",
  "#4a044e", "#6b21a8", "#9333ea", "#a855f7",
  "#134e4a", "#115e59", "#0d9488", "#14b8a6",
  "#1f2937", "#374151", "#4b5563", "#6b7280",
];

const PATTERN_TYPES = ["solid", "swirl", "split", "stripe", "speckled", "marble"];

function generateBallColors(seed: number): { primary: string; secondary: string; accent: string; pattern: string } {
  const rand = seededRandom(seed);
  const primaryIdx = Math.floor(rand() * COLORS.length);
  let secondaryIdx = Math.floor(rand() * COLORS.length);
  
  while (secondaryIdx === primaryIdx) {
    secondaryIdx = (secondaryIdx + 1) % COLORS.length;
  }
  
  const accentIdx = Math.floor(rand() * COLORS.length);
  const pattern = PATTERN_TYPES[Math.floor(rand() * PATTERN_TYPES.length)];
  
  return {
    primary: COLORS[primaryIdx],
    secondary: COLORS[secondaryIdx],
    accent: COLORS[accentIdx],
    pattern,
  };
}

const RARITY_COLORS: Record<BallRarity, { bg: string; border: string; text: string }> = {
  common: { bg: "bg-zinc-600", border: "border-zinc-500", text: "text-zinc-100" },
  rare: { bg: "bg-blue-600", border: "border-blue-400", text: "text-blue-100" },
  epic: { bg: "bg-purple-600", border: "border-purple-400", text: "text-purple-100" },
  legendary: { bg: "bg-amber-500", border: "border-amber-300", text: "text-amber-100" },
};

const RARITY_LABELS: Record<BallRarity, string> = {
  common: "C",
  rare: "R",
  epic: "E",
  legendary: "L",
};

export function BallVisual({ ball, size = "md", showRarity = true, className = "" }: BallVisualProps) {
  const seed = ball.visualSeed || ball.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const { primary, secondary, accent, pattern } = generateBallColors(seed);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  const holeSizes = {
    sm: { main: 2.5, spacing: 4 },
    md: { main: 3.5, spacing: 6 },
    lg: { main: 5, spacing: 8 },
  };
  
  const getGradient = () => {
    switch (pattern) {
      case "swirl":
        return `conic-gradient(from 0deg, ${primary}, ${secondary}, ${primary})`;
      case "split":
        return `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)`;
      case "stripe":
        return `repeating-linear-gradient(45deg, ${primary}, ${primary} 8px, ${secondary} 8px, ${secondary} 16px)`;
      case "speckled":
        return `radial-gradient(circle at 20% 30%, ${accent} 2px, transparent 2px),
                radial-gradient(circle at 60% 20%, ${accent} 2px, transparent 2px),
                radial-gradient(circle at 80% 60%, ${accent} 2px, transparent 2px),
                radial-gradient(circle at 40% 80%, ${accent} 2px, transparent 2px),
                linear-gradient(135deg, ${primary}, ${secondary})`;
      case "marble":
        return `linear-gradient(160deg, ${primary} 0%, ${secondary} 30%, ${primary} 50%, ${secondary} 70%, ${primary} 100%)`;
      default:
        return `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`;
    }
  };
  
  const rarity = ball.rarity || "common";
  const rarityStyle = RARITY_COLORS[rarity];
  const { main: holeSize, spacing } = holeSizes[size];
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div
        className="w-full h-full rounded-full shadow-md relative overflow-hidden"
        style={{
          background: getGradient(),
          boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.2)`,
        }}
      >
        <div
          className="absolute rounded-full bg-black/70"
          style={{
            width: holeSize,
            height: holeSize,
            top: `calc(50% - ${spacing}px)`,
            left: `calc(50% - ${holeSize/2}px)`,
          }}
        />
        <div
          className="absolute rounded-full bg-black/70"
          style={{
            width: holeSize,
            height: holeSize,
            top: `calc(50% + ${spacing/3}px)`,
            left: `calc(50% - ${spacing}px)`,
          }}
        />
        <div
          className="absolute rounded-full bg-black/70"
          style={{
            width: holeSize,
            height: holeSize,
            top: `calc(50% + ${spacing/3}px)`,
            left: `calc(50% + ${spacing - holeSize}px)`,
          }}
        />
        
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)",
          }}
        />
      </div>
      
      {showRarity && (
        <div
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.text}`}
          data-testid={`badge-rarity-${ball.id}`}
        >
          {RARITY_LABELS[rarity]}
        </div>
      )}
    </div>
  );
}

export function getBallTypeColor(type: string): string {
  switch (type) {
    case "plastic":
      return "bg-gradient-to-br from-gray-300 to-gray-500";
    case "urethane":
      return "bg-gradient-to-br from-amber-400 to-amber-600";
    case "reactive-solid":
      return "bg-gradient-to-br from-blue-500 to-blue-700";
    case "reactive-pearl":
      return "bg-gradient-to-br from-purple-400 to-pink-500";
    case "reactive-hybrid":
      return "bg-gradient-to-br from-emerald-500 to-teal-600";
    default:
      return "bg-gradient-to-br from-gray-400 to-gray-600";
  }
}
