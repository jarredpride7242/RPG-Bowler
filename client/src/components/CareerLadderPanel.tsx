import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Lock, 
  CheckCircle, 
  ChevronRight,
  Star,
  Shield,
  Target,
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import { CAREER_TIERS, CAREER_TIER_ORDER, type CareerTier } from "@shared/schema";

const TIER_ICONS: Record<string, typeof Trophy> = {
  "amateur": Target,
  "league-regular": Star,
  "regional-contender": Shield,
  "state-champion": Trophy,
  "national-circuit": Trophy,
  "pro-applicant": Star,
  "professional": Trophy,
  "elite-tour": Trophy,
};

const TIER_COLORS: Record<string, string> = {
  "amateur": "text-muted-foreground",
  "league-regular": "text-blue-400",
  "regional-contender": "text-green-400",
  "state-champion": "text-yellow-400",
  "national-circuit": "text-orange-400",
  "pro-applicant": "text-purple-400",
  "professional": "text-chart-3",
  "elite-tour": "text-amber-400",
};

export function CareerLadderPanel() {
  const { currentProfile, getCareerLadder, getCareerTier } = useGame();
  
  if (!currentProfile) return null;
  
  const ladder = getCareerLadder();
  const currentTier = getCareerTier();
  const currentTierIndex = CAREER_TIER_ORDER.indexOf(currentTier);
  const careerStats = currentProfile.careerStats;

  const getRequirementProgress = (tierDef: typeof CAREER_TIERS[0]) => {
    const reqs = tierDef.requirements;
    const checks = [
      { label: `Average ${reqs.minAverage}+`, met: currentProfile.bowlingAverage >= reqs.minAverage, current: currentProfile.bowlingAverage, target: reqs.minAverage },
      { label: `${reqs.leagueWeeksCompleted} league weeks`, met: ladder.leagueWeeksCompleted >= reqs.leagueWeeksCompleted, current: ladder.leagueWeeksCompleted, target: reqs.leagueWeeksCompleted },
      { label: `${reqs.tournamentsEntered} tournaments entered`, met: ladder.tournamentsEntered >= reqs.tournamentsEntered, current: ladder.tournamentsEntered, target: reqs.tournamentsEntered },
      { label: `${reqs.tournamentsWon} tournaments won`, met: (careerStats?.tournamentWins ?? 0) >= reqs.tournamentsWon, current: careerStats?.tournamentWins ?? 0, target: reqs.tournamentsWon },
    ];
    if (reqs.requiresPro) {
      checks.push({ label: "Professional status", met: currentProfile.isProfessional, current: currentProfile.isProfessional ? 1 : 0, target: 1 });
    }
    return checks;
  };

  const getNextTier = () => {
    if (currentTierIndex >= CAREER_TIER_ORDER.length - 1) return null;
    return CAREER_TIERS[currentTierIndex + 1];
  };

  const nextTier = getNextTier();
  const nextTierChecks = nextTier ? getRequirementProgress(nextTier) : [];
  const metCount = nextTierChecks.filter(c => c.met).length;
  const progressPercent = nextTierChecks.length > 0 ? (metCount / nextTierChecks.length) * 100 : 100;

  const currentTierDef = CAREER_TIERS[currentTierIndex];

  return (
    <div className="space-y-4" data-testid="career-ladder-panel">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              {(() => {
                const Icon = TIER_ICONS[currentTier] || Trophy;
                return <Icon className={`w-6 h-6 ${TIER_COLORS[currentTier]}`} />;
              })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{currentTierDef?.name ?? "Amateur"}</p>
                <Badge variant="outline" className="text-xs">{currentTierDef?.badge ?? "Rookie"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentTierDef?.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {nextTier && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Next: {nextTier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">{metCount}/{nextTierChecks.length} requirements met</p>
            <div className="space-y-2">
              {nextTierChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {check.met ? (
                    <CheckCircle className="w-4 h-4 text-chart-3 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={check.met ? "text-chart-3" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                  {!check.met && typeof check.current === "number" && typeof check.target === "number" && check.target > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                      {check.current}/{check.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Unlocks:</p>
              <div className="flex flex-wrap gap-1">
                {nextTier.unlocks.map((unlock, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{unlock}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">All Tiers</p>
        {CAREER_TIERS.map((tier, index) => {
          const isCurrentOrLower = index <= currentTierIndex;
          const isCurrent = index === currentTierIndex;
          const Icon = TIER_ICONS[tier.id] || Trophy;

          return (
            <div
              key={tier.id}
              data-testid={`tier-${tier.id}`}
              className={`flex items-center gap-3 p-3 rounded-md ${
                isCurrent ? "bg-primary/10 border border-primary/30" : isCurrentOrLower ? "bg-muted/50" : "opacity-60"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCurrentOrLower ? "bg-primary/20" : "bg-muted"
              }`}>
                {isCurrentOrLower ? (
                  <Icon className={`w-4 h-4 ${TIER_COLORS[tier.id]}`} />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isCurrent ? "" : "text-muted-foreground"}`}>{tier.name}</p>
                <p className="text-xs text-muted-foreground truncate">{tier.description}</p>
              </div>
              {isCurrent && <Badge variant="default" className="text-xs shrink-0">Current</Badge>}
              {isCurrentOrLower && !isCurrent && <CheckCircle className="w-4 h-4 text-chart-3 shrink-0" />}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Career Progress</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{ladder.leagueWeeksCompleted}</p>
              <p className="text-xs text-muted-foreground">League Weeks</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{ladder.tournamentsEntered}</p>
              <p className="text-xs text-muted-foreground">Tournaments</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{ladder.peakAverage}</p>
              <p className="text-xs text-muted-foreground">Peak Average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}