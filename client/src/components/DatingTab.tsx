import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/lib/gameContext";
import { 
  Heart, 
  X, 
  MessageCircle, 
  Coffee, 
  RefreshCw, 
  Sparkles,
  HeartHandshake,
  UserMinus,
  Zap,
  DollarSign
} from "lucide-react";
import { DATING_CHAT_TEMPLATES, GAME_CONSTANTS } from "@shared/schema";

export function DatingTab() {
  const { 
    getDatingState, 
    refreshMatches, 
    swipeMatch, 
    sendChatMessage,
    goOnDate,
    makeExclusive,
    breakUp,
    getCurrentPartner,
    getRelationshipPerks,
    currentProfile
  } = useGame();
  
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [lastDateResult, setLastDateResult] = useState<{ outcome: string; change: number } | null>(null);
  
  const datingState = getDatingState();
  const partner = getCurrentPartner();
  const perks = getRelationshipPerks();
  
  const selectedProfile = selectedProfileId 
    ? datingState.activeProfiles.find(p => p.matchId === selectedProfileId)
    : null;
  
  const currentChatTemplate = selectedProfile?.currentChatStep
    ? DATING_CHAT_TEMPLATES.find(t => t.id === selectedProfile.currentChatStep)
    : null;
  
  const handleSwipe = (matchId: string, liked: boolean) => {
    swipeMatch(matchId, liked);
  };
  
  const handleSendMessage = (choiceId: string) => {
    if (selectedProfileId) {
      sendChatMessage(selectedProfileId, choiceId);
    }
  };
  
  const handleGoOnDate = () => {
    if (selectedProfileId) {
      const result = goOnDate(selectedProfileId);
      if (result.success) {
        setLastDateResult({ outcome: result.outcome, change: result.relationshipChange });
        setTimeout(() => setLastDateResult(null), 3000);
      }
    }
  };
  
  const handleMakeExclusive = () => {
    if (selectedProfileId) {
      makeExclusive(selectedProfileId);
    }
  };
  
  const handleBreakUp = () => {
    if (selectedProfileId) {
      breakUp(selectedProfileId);
      setSelectedProfileId(null);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "talking": return "bg-blue-500/20 text-blue-400";
      case "dating": return "bg-pink-500/20 text-pink-400";
      case "exclusive": return "bg-purple-500/20 text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  const getDateCost = () => {
    if (!selectedProfile) return 0;
    return GAME_CONSTANTS.DATE_BASE_MONEY_COST + (selectedProfile.datesTaken * 25);
  };
  
  return (
    <div className="space-y-4">
      {partner && (
        <Card className="border-purple-500/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-400" />
                In a Relationship
              </CardTitle>
              <Badge variant="outline" className="text-purple-400">
                {partner.match.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={partner.relationshipLevel} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Relationship: {partner.relationshipLevel}%</span>
              <span>{partner.datesTaken} dates</span>
            </div>
            {(perks.mentalToughness > 0 || perks.energyRecovery > 0) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {perks.mentalToughness > 0 && (
                  <Badge variant="secondary">
                    +{perks.mentalToughness} Mental Toughness
                  </Badge>
                )}
                {perks.energyRecovery > 0 && (
                  <Badge variant="secondary">
                    +{perks.energyRecovery}% Energy Recovery
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover" data-testid="tab-discover">
            Discover
          </TabsTrigger>
          <TabsTrigger value="matches" data-testid="tab-matches">
            Matches ({datingState.activeProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="chat" data-testid="tab-chat" disabled={!selectedProfile}>
            Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Find Matches</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshMatches()}
              data-testid="button-refresh-matches"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {datingState.availableMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No matches available</p>
                <p className="text-sm text-muted-foreground">Refresh to find new people</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {datingState.availableMatches.map((match) => (
                <Card key={match.id} className="overflow-visible">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: `hsl(${match.name.charCodeAt(0) * 5}, 50%, 30%)` }}
                      >
                        {match.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{match.name}, {match.age}</h4>
                          <Badge variant="outline" className="text-pink-400">
                            {match.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-sm capitalize text-muted-foreground mb-2">{match.personality}</p>
                        <p className="text-sm">{match.bio}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.interests.map((interest, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        size="icon" 
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleSwipe(match.id, false)}
                        data-testid={`button-pass-${match.id}`}
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </Button>
                      <Button 
                        size="icon"
                        className="rounded-full bg-pink-500 hover:bg-pink-600"
                        onClick={() => handleSwipe(match.id, true)}
                        data-testid={`button-like-${match.id}`}
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="matches" className="space-y-4">
          {datingState.activeProfiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No matches yet</p>
                <p className="text-sm text-muted-foreground">Swipe right on someone you like</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {datingState.activeProfiles.map((profile) => (
                <Card 
                  key={profile.matchId}
                  className={`cursor-pointer hover-elevate ${selectedProfileId === profile.matchId ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedProfileId(profile.matchId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: `hsl(${profile.match.name.charCodeAt(0) * 5}, 50%, 30%)` }}
                      >
                        {profile.match.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium">{profile.match.name}</h4>
                          <Badge className={getStatusColor(profile.status)}>
                            {profile.status}
                          </Badge>
                        </div>
                        <Progress value={profile.relationshipLevel} className="h-1.5 mt-1" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{profile.relationshipLevel}% connection</span>
                          {profile.isCurrentPartner && (
                            <span className="text-purple-400">Your partner</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-4">
          {selectedProfile && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{selectedProfile.match.name}</CardTitle>
                    <Badge className={getStatusColor(selectedProfile.status)}>
                      {selectedProfile.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={selectedProfile.relationshipLevel} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Connection: {selectedProfile.relationshipLevel}%</span>
                    <span>{selectedProfile.datesTaken} dates</span>
                  </div>
                  
                  {lastDateResult && (
                    <div className={`text-center p-2 rounded ${lastDateResult.change > 0 ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}`}>
                      {lastDateResult.outcome === "great" && "Amazing date!"}
                      {lastDateResult.outcome === "good" && "Great time together!"}
                      {lastDateResult.outcome === "neutral" && "Nice date."}
                      {lastDateResult.outcome === "bad" && "Awkward..."}
                      {lastDateResult.outcome === "disaster" && "That went badly..."}
                      <span className="ml-2">({lastDateResult.change > 0 ? "+" : ""}{lastDateResult.change})</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleGoOnDate}
                      disabled={!currentProfile || currentProfile.energy < GAME_CONSTANTS.DATE_ENERGY_COST || currentProfile.money < getDateCost()}
                      data-testid="button-go-on-date"
                    >
                      <Coffee className="w-4 h-4 mr-1" />
                      Go on Date
                      <Badge variant="outline" className="ml-2 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {GAME_CONSTANTS.DATE_ENERGY_COST}
                      </Badge>
                      <Badge variant="outline" className="ml-1 text-xs">
                        <DollarSign className="w-3 h-3" />
                        {getDateCost()}
                      </Badge>
                    </Button>
                    
                    {selectedProfile.relationshipLevel >= 50 && !selectedProfile.isCurrentPartner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMakeExclusive}
                        className="text-purple-400"
                        data-testid="button-make-exclusive"
                      >
                        <HeartHandshake className="w-4 h-4 mr-1" />
                        Make Exclusive
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBreakUp}
                      className="text-destructive"
                      data-testid="button-break-up"
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      End It
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 mb-4">
                    <div className="space-y-3">
                      {selectedProfile.chatHistory.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender === "player" ? "justify-end" : "justify-start"}`}
                        >
                          <div 
                            className={`max-w-[80%] p-2 rounded-lg text-sm ${
                              msg.sender === "player" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {currentChatTemplate ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground italic mb-2">
                        {selectedProfile.match.name}: "{currentChatTemplate.matchMessage}"
                      </p>
                      <div className="space-y-2">
                        {currentChatTemplate.playerChoices.map((choice) => {
                          const canSend = !choice.requiresCharisma || 
                            (currentProfile?.stats.charisma ?? 0) >= choice.requiresCharisma;
                          
                          return (
                            <Button
                              key={choice.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left h-auto py-2"
                              disabled={!canSend}
                              onClick={() => handleSendMessage(choice.id)}
                              data-testid={`button-chat-${choice.id}`}
                            >
                              <span className="flex-1">{choice.text}</span>
                              {choice.requiresCharisma && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {choice.requiresCharisma} CHA
                                </Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Go on dates to strengthen your connection
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
