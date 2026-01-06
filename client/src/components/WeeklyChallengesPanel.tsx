import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/lib/gameContext";
import { Target, Gift, Check, DollarSign, Star, Zap, Sparkles } from "lucide-react";

export function WeeklyChallengesPanel() {
  const { currentProfile, getWeeklyChallenges, claimChallengeReward } = useGame();
  
  if (!currentProfile) return null;
  
  const challenges = getWeeklyChallenges();
  
  const handleClaim = (challengeId: string) => {
    claimChallengeReward(challengeId);
  };
  
  const formatReward = (reward: { cash?: number; reputation?: number; energy?: number; cosmeticToken?: number }) => {
    const parts: string[] = [];
    if (reward.cash) parts.push(`$${reward.cash}`);
    if (reward.reputation) parts.push(`+${reward.reputation} rep`);
    if (reward.energy) parts.push(`+${reward.energy} energy`);
    if (reward.cosmeticToken) parts.push(`+${reward.cosmeticToken} token`);
    return parts.join(", ");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Weekly Challenges</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Week {currentProfile.currentWeek}
        </Badge>
      </div>
      
      {challenges.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Loading challenges...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {challenges.map(challenge => {
            const isComplete = challenge.progress >= challenge.target;
            const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100);
            
            return (
              <Card 
                key={challenge.id} 
                className={challenge.claimed ? "opacity-60" : isComplete ? "border-green-500/50" : ""}
                data-testid={`card-challenge-${challenge.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{challenge.name}</h4>
                        {challenge.claimed && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Claimed
                          </Badge>
                        )}
                        {isComplete && !challenge.claimed && (
                          <Badge className="text-xs bg-green-500">
                            <Gift className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{challenge.progress} / {challenge.target}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Reward:</span>
                        <Badge variant="outline" className="text-xs">
                          {formatReward(challenge.reward)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {isComplete && !challenge.claimed && (
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handleClaim(challenge.id)}
                      data-testid={`button-claim-${challenge.id}`}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Reward
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {currentProfile.cosmeticTokens !== undefined && currentProfile.cosmeticTokens > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium text-sm">Cosmetic Tokens: {currentProfile.cosmeticTokens}</p>
              <p className="text-xs text-muted-foreground">Earn tokens to unlock special items</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
