import { useGame } from "@/lib/gameContext";
import { ALLEY_ENVIRONMENT_ITEMS, type AlleyEnvironment } from "@shared/schema";

const LANE_GRADIENTS: Record<string, string> = {
  "lane-classic-wood": "from-amber-800/40 via-amber-700/30 to-amber-600/20",
  "lane-modern-synthetic": "from-slate-700/40 via-slate-600/30 to-slate-500/20",
  "lane-neon-glow": "from-purple-600/40 via-pink-500/30 to-cyan-400/20",
  "lane-retro-arcade": "from-fuchsia-600/40 via-violet-500/30 to-purple-400/20",
  "lane-luxury-marble": "from-gray-300/40 via-white/30 to-gray-200/20",
  "lane-cosmic-galaxy": "from-indigo-900/40 via-purple-800/30 to-blue-700/20",
};

const LIGHTING_OVERLAYS: Record<string, string> = {
  "light-standard": "",
  "light-dim-ambient": "bg-black/20",
  "light-cosmic-bowling": "bg-purple-900/30",
  "light-spotlight": "bg-gradient-radial from-transparent via-transparent to-black/30",
  "light-sunset-warm": "bg-orange-500/10",
  "light-ice-blue": "bg-blue-500/15",
};

const FLOOR_PATTERNS: Record<string, string> = {
  "floor-carpet-standard": "bg-gradient-to-b from-transparent to-violet-900/20",
  "floor-carpet-galaxy": "bg-gradient-to-b from-transparent via-indigo-900/20 to-purple-800/30",
  "floor-hardwood": "bg-gradient-to-b from-transparent to-amber-900/20",
  "floor-polished-concrete": "bg-gradient-to-b from-transparent to-gray-600/20",
  "floor-retro-checkered": "bg-gradient-to-b from-transparent to-fuchsia-900/20",
  "floor-luxury-tile": "bg-gradient-to-b from-transparent to-slate-400/20",
};

function getDefaultAlleyEnvironment(): AlleyEnvironment {
  return {
    laneStyle: "lane-classic-wood",
    lightingStyle: "light-standard",
    seatingStyle: "seat-basic-bench",
    decoration: "deco-none",
    floorStyle: "floor-carpet-standard",
    ambientEffect: "ambient-none",
    unlockedItems: [],
    alleyName: "My Bowling Alley",
  };
}

interface AlleyEnvironmentPreviewProps {
  compact?: boolean;
}

export function AlleyEnvironmentPreview({ compact = false }: AlleyEnvironmentPreviewProps) {
  const { currentProfile } = useGame();
  
  if (!currentProfile) return null;
  
  const alleyEnv = currentProfile.alleyEnvironment ?? getDefaultAlleyEnvironment();
  
  const laneGradient = LANE_GRADIENTS[alleyEnv.laneStyle] ?? LANE_GRADIENTS["lane-classic-wood"];
  const lightingOverlay = LIGHTING_OVERLAYS[alleyEnv.lightingStyle] ?? "";
  const floorPattern = FLOOR_PATTERNS[alleyEnv.floorStyle] ?? FLOOR_PATTERNS["floor-carpet-standard"];
  
  const laneName = ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.laneStyle)?.name ?? "Classic Wood";
  const lightingName = ALLEY_ENVIRONMENT_ITEMS.find(i => i.id === alleyEnv.lightingStyle)?.name ?? "Standard";
  
  if (compact) {
    return (
      <div 
        className={`relative rounded-md overflow-hidden p-2 bg-gradient-to-r ${laneGradient}`}
        data-testid="alley-environment-compact"
      >
        <div className={`absolute inset-0 ${lightingOverlay}`} />
        <div className={`absolute inset-0 ${floorPattern}`} />
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-medium truncate">{alleyEnv.alleyName}</span>
          <span className="text-xs text-muted-foreground">{laneName}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden p-4 bg-gradient-to-br ${laneGradient} border border-border`}
      data-testid="alley-environment-preview"
    >
      <div className={`absolute inset-0 ${lightingOverlay}`} />
      <div className={`absolute inset-0 ${floorPattern}`} />
      
      <div className="relative z-10 space-y-2">
        <h3 className="font-semibold text-sm">{alleyEnv.alleyName}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{laneName} Lanes</span>
          <span>|</span>
          <span>{lightingName} Lighting</span>
        </div>
        
        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pin) => (
            <div
              key={pin}
              className="w-2 h-3 bg-white/80 rounded-full shadow-sm"
              style={{
                transform: `translateY(${pin <= 4 ? 0 : pin <= 7 ? 2 : pin <= 9 ? 4 : 6}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AlleyEnvironmentBanner() {
  const { currentProfile } = useGame();
  
  if (!currentProfile) return null;
  
  const alleyEnv = currentProfile.alleyEnvironment ?? getDefaultAlleyEnvironment();
  
  const laneGradient = LANE_GRADIENTS[alleyEnv.laneStyle] ?? LANE_GRADIENTS["lane-classic-wood"];
  const lightingOverlay = LIGHTING_OVERLAYS[alleyEnv.lightingStyle] ?? "";
  
  return (
    <div 
      className={`relative w-full h-24 bg-gradient-to-r ${laneGradient} overflow-hidden`}
      data-testid="alley-environment-banner"
    >
      <div className={`absolute inset-0 ${lightingOverlay}`} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end gap-0.5 opacity-60">
          <div className="w-4 h-4 bg-white rounded-full" style={{ transform: "translateY(-24px)" }} />
          <div className="flex gap-0.5" style={{ transform: "translateY(-16px)" }}>
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <div className="flex gap-0.5" style={{ transform: "translateY(-8px)" }}>
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-3 z-10">
        <p className="text-sm font-semibold text-white drop-shadow-lg">{alleyEnv.alleyName}</p>
      </div>
    </div>
  );
}
