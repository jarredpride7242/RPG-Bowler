import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Building2,
  DollarSign,
  Trophy,
  AlertTriangle,
  Check,
  X,
  Handshake,
  Target,
  Star,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { SponsorOffer, SponsorTier } from "@shared/schema";

const TIER_COLORS: Record<SponsorTier, string> = {
  local: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  regional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  national: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  elite: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const TIER_LABELS: Record<SponsorTier, string> = {
  local: "Local",
  regional: "Regional",
  national: "National",
  elite: "Elite",
};

export function SponsorNegotiationPanel() {
  const { 
    currentProfile,
    getAvailableSponsorOffers,
    getNegotiatedSponsor,
    acceptSponsorOffer,
    cancelSponsorContract,
  } = useGame();
  
  const [selectedOffer, setSelectedOffer] = useState<SponsorOffer | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<"success" | "fail" | null>(null);
  
  if (!currentProfile) return null;
  
  const activeSponsor = getNegotiatedSponsor();
  const availableOffers = getAvailableSponsorOffers();
  
  const handleAcceptSafe = (offer: SponsorOffer) => {
    acceptSponsorOffer(offer, false);
    setSelectedOffer(null);
  };
  
  const handleNegotiate = (offer: SponsorOffer) => {
    const success = acceptSponsorOffer(offer, true);
    setNegotiationResult(success ? "success" : "fail");
  };
  
  const closeNegotiationResult = () => {
    setNegotiationResult(null);
    setSelectedOffer(null);
  };
  
  if (!currentProfile.isProfessional) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Sponsorships Locked</h3>
          <p className="text-sm text-muted-foreground">
            Go professional to unlock sponsorship deals. Sponsors offer weekly stipends 
            and tournament bonuses in exchange for meeting performance requirements.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (activeSponsor) {
    const weeksProgress = ((52 - activeSponsor.weeksRemaining) / 52) * 100;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Active Sponsor
              </div>
              <Badge className={TIER_COLORS[activeSponsor.tier]}>
                {TIER_LABELS[activeSponsor.tier]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{activeSponsor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {activeSponsor.weeksRemaining} weeks remaining
              </p>
              <Progress value={weeksProgress} className="h-1.5 mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-muted rounded-md text-center">
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold">${activeSponsor.weeklyStipend}</p>
                <p className="text-xs text-muted-foreground">Weekly</p>
              </div>
              <div className="p-2 bg-muted rounded-md text-center">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">+{activeSponsor.tournamentBonus}%</p>
                <p className="text-xs text-muted-foreground">Tournament Bonus</p>
              </div>
            </div>
            
            <Card className={activeSponsor.requirementsMet ? "border-green-500/30" : "border-destructive/30"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {activeSponsor.requirementsMet ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span>Min Average</span>
                  </div>
                  <span className={
                    currentProfile.bowlingAverage >= activeSponsor.requirements.minAverage 
                      ? "text-green-500" : "text-destructive"
                  }>
                    {currentProfile.bowlingAverage}/{activeSponsor.requirements.minAverage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-muted-foreground" />
                    <span>Min Reputation</span>
                  </div>
                  <span className={
                    currentProfile.stats.reputation >= activeSponsor.requirements.minReputation 
                      ? "text-green-500" : "text-destructive"
                  }>
                    {currentProfile.stats.reputation}/{activeSponsor.requirements.minReputation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-muted-foreground" />
                    <span>Tournaments/Season</span>
                  </div>
                  <span className={
                    activeSponsor.tournamentsEntered >= activeSponsor.requirements.tournamentsPerSeason 
                      ? "text-green-500" : "text-muted-foreground"
                  }>
                    {activeSponsor.tournamentsEntered}/{activeSponsor.requirements.tournamentsPerSeason}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {activeSponsor.warningGiven && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Warning: Meet requirements or risk losing sponsor!
                </span>
              </div>
            )}
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={cancelSponsorContract}
              data-testid="button-cancel-sponsor"
            >
              Cancel Contract
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Sponsor Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sponsor offers available. Improve your average and reputation to attract sponsors.
              </p>
            ) : (
              <div className="space-y-3">
                {availableOffers.map(offer => (
                  <Card 
                    key={offer.sponsor.id} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedOffer(offer)}
                    data-testid={`sponsor-offer-${offer.sponsor.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{offer.sponsor.name}</span>
                            <Badge variant="outline" className={`text-xs ${TIER_COLORS[offer.sponsor.tier]}`}>
                              {TIER_LABELS[offer.sponsor.tier]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${offer.safeOffer.weeklyStipend}/week + {offer.safeOffer.tournamentBonus}% bonus
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={selectedOffer !== null && negotiationResult === null} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Sponsor Deal
            </DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium">{selectedOffer.sponsor.name}</h3>
                <Badge className={`mt-1 ${TIER_COLORS[selectedOffer.sponsor.tier]}`}>
                  {TIER_LABELS[selectedOffer.sponsor.tier]}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground">Safe Offer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><DollarSign className="w-3 h-3 inline" /> ${selectedOffer.safeOffer.weeklyStipend}/wk</p>
                    <p><Trophy className="w-3 h-3 inline" /> +{selectedOffer.safeOffer.tournamentBonus}%</p>
                    <p><Calendar className="w-3 h-3 inline" /> {selectedOffer.safeOffer.contractWeeks} wks</p>
                    <div className="pt-2 border-t border-border mt-2">
                      <p className="text-xs text-muted-foreground">Requirements:</p>
                      <p className="text-xs">Avg: {selectedOffer.safeOffer.requirements.minAverage}</p>
                      <p className="text-xs">Rep: {selectedOffer.safeOffer.requirements.minReputation}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/50">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-primary">Negotiate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><DollarSign className="w-3 h-3 inline" /> ${selectedOffer.negotiatedOffer.weeklyStipend}/wk</p>
                    <p><Trophy className="w-3 h-3 inline" /> +{selectedOffer.negotiatedOffer.tournamentBonus}%</p>
                    <p><Calendar className="w-3 h-3 inline" /> {selectedOffer.negotiatedOffer.contractWeeks} wks</p>
                    <div className="pt-2 border-t border-border mt-2">
                      <p className="text-xs text-muted-foreground">Requirements:</p>
                      <p className="text-xs">Avg: {selectedOffer.negotiatedOffer.requirements.minAverage}</p>
                      <p className="text-xs">Rep: {selectedOffer.negotiatedOffer.requirements.minReputation}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-md">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Negotiation success: {selectedOffer.negotiatedOffer.negotiationSuccessChance}%
                </span>
              </div>
              
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button 
                  className="w-full"
                  onClick={() => handleAcceptSafe(selectedOffer)}
                  data-testid="button-accept-safe"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Safe Offer
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-primary text-primary"
                  onClick={() => handleNegotiate(selectedOffer)}
                  data-testid="button-negotiate"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Negotiate Better Terms
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={negotiationResult !== null} onOpenChange={closeNegotiationResult}>
        <DialogContent className="max-w-xs text-center">
          {negotiationResult === "success" ? (
            <>
              <Check className="w-16 h-16 mx-auto text-green-500" />
              <DialogTitle>Negotiation Successful!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                You secured the better deal. Good luck meeting the requirements!
              </p>
            </>
          ) : (
            <>
              <X className="w-16 h-16 mx-auto text-destructive" />
              <DialogTitle>Negotiation Failed</DialogTitle>
              <p className="text-sm text-muted-foreground">
                The sponsor walked away. Try accepting a safe offer next time.
              </p>
            </>
          )}
          <Button onClick={closeNegotiationResult} className="w-full mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
