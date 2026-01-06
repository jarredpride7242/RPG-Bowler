import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ShoppingBag,
  Check,
  Coins,
  CircleDot,
  Briefcase,
  Zap,
  Home,
  Heart
} from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { BowlingBall, Job, Property, Relationship } from "@shared/schema";

const BALL_PREFIXES = ["Thunder", "Storm", "Cyclone", "Vortex", "Blaze", "Shadow", "Phantom", "Titan", "Apex", "Quantum"];
const BALL_SUFFIXES = ["Strike", "Fury", "Force", "Rush", "Wave", "Core", "Pro", "Elite", "Master", "X"];

function generateBallName(): string {
  const prefix = BALL_PREFIXES[Math.floor(Math.random() * BALL_PREFIXES.length)];
  const suffix = BALL_SUFFIXES[Math.floor(Math.random() * BALL_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

const SHOP_BALLS: BowlingBall[] = [
  {
    id: "plastic-basic",
    name: "Spare Master",
    type: "plastic",
    coreType: "symmetric",
    hookPotential: 1,
    control: 9,
    backendReaction: 1,
    oilHandling: 2,
    forgiveness: 9,
    price: 80,
  },
  {
    id: "urethane-entry",
    name: generateBallName(),
    type: "urethane",
    coreType: "symmetric",
    hookPotential: 4,
    control: 7,
    backendReaction: 4,
    oilHandling: 5,
    forgiveness: 7,
    price: 150,
  },
  {
    id: "reactive-solid-1",
    name: generateBallName(),
    type: "reactive-solid",
    coreType: "symmetric",
    hookPotential: 6,
    control: 6,
    backendReaction: 6,
    oilHandling: 7,
    forgiveness: 5,
    price: 220,
  },
  {
    id: "reactive-pearl-1",
    name: generateBallName(),
    type: "reactive-pearl",
    coreType: "symmetric",
    hookPotential: 7,
    control: 5,
    backendReaction: 8,
    oilHandling: 5,
    forgiveness: 4,
    price: 250,
  },
  {
    id: "reactive-hybrid-1",
    name: generateBallName(),
    type: "reactive-hybrid",
    coreType: "asymmetric",
    hookPotential: 8,
    control: 5,
    backendReaction: 7,
    oilHandling: 6,
    forgiveness: 4,
    price: 300,
  },
  {
    id: "pro-asym",
    name: generateBallName(),
    type: "reactive-solid",
    coreType: "asymmetric",
    hookPotential: 9,
    control: 4,
    backendReaction: 9,
    oilHandling: 8,
    forgiveness: 3,
    price: 400,
  },
];

const AVAILABLE_JOBS: Job[] = [
  {
    id: "dog-sitting",
    title: "Dog Sitting",
    weeklyPay: 330,
    energyCost: 13,
    contractWeeks: 4,
  },
  {
    id: "retail",
    title: "Retail Associate",
    weeklyPay: 450,
    energyCost: 20,
    contractWeeks: 8,
  },
  {
    id: "bowling-alley",
    title: "Bowling Alley Staff",
    weeklyPay: 400,
    energyCost: 15,
    contractWeeks: 12,
    requirements: { consistency: 40 },
  },
  {
    id: "pro-shop",
    title: "Pro Shop Assistant",
    weeklyPay: 550,
    energyCost: 18,
    contractWeeks: 16,
    requirements: { reputation: 20, charisma: 35 },
  },
  {
    id: "coaching",
    title: "Youth Bowling Coach",
    weeklyPay: 700,
    energyCost: 22,
    contractWeeks: 20,
    requirements: { reputation: 40, charisma: 45, consistency: 55 },
  },
];

const AVAILABLE_PROPERTIES: Property[] = [
  {
    id: "basic-apt",
    name: "Studio Apartment",
    type: "rent",
    monthlyCost: 800,
    energyBonus: 5,
    trainingBonus: 0,
  },
  {
    id: "one-bed",
    name: "1-Bedroom Apartment",
    type: "rent",
    monthlyCost: 1200,
    energyBonus: 10,
    trainingBonus: 5,
  },
  {
    id: "two-bed",
    name: "2-Bedroom Condo",
    type: "rent",
    monthlyCost: 1800,
    energyBonus: 15,
    trainingBonus: 10,
  },
  {
    id: "house",
    name: "Suburban House",
    type: "own",
    monthlyCost: 2500,
    energyBonus: 20,
    trainingBonus: 15,
  },
];

const DATING_PROFILES: Relationship[] = [
  { id: "alex", name: "Alex", level: 0, buffs: { mentalToughness: 3, energyRecovery: 2 } },
  { id: "jordan", name: "Jordan", level: 0, buffs: { mentalToughness: 5 } },
  { id: "taylor", name: "Taylor", level: 0, buffs: { energyRecovery: 5 } },
  { id: "morgan", name: "Morgan", level: 0, buffs: { mentalToughness: 2, energyRecovery: 3 } },
];

export function ShopScreen() {
  const { currentProfile, addBowlingBall, setActiveBall, spendMoney, useEnergy, setCurrentJob, updateProfile } = useGame();
  const [selectedBall, setSelectedBall] = useState<BowlingBall | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  if (!currentProfile) return null;
  
  const ownedBallIds = currentProfile.ownedBalls.map(b => b.id);
  
  const handleBuyBall = () => {
    if (!selectedBall) return;
    if (!spendMoney(selectedBall.price)) return;
    addBowlingBall(selectedBall);
    setSelectedBall(null);
  };
  
  const meetsJobRequirements = (job: Job) => {
    if (!job.requirements) return true;
    const { reputation, charisma, consistency } = job.requirements;
    if (reputation && currentProfile.stats.reputation < reputation) return false;
    if (charisma && currentProfile.stats.charisma < charisma) return false;
    if (consistency && currentProfile.stats.consistency < consistency) return false;
    return true;
  };
  
  const handleApplyJob = () => {
    if (!selectedJob) return;
    if (!useEnergy(5)) return;
    setCurrentJob({ ...selectedJob, weeksRemaining: selectedJob.contractWeeks });
    setSelectedJob(null);
  };
  
  const handleRentProperty = () => {
    if (!selectedProperty) return;
    if (!spendMoney(selectedProperty.monthlyCost)) return;
    updateProfile({ currentProperty: selectedProperty });
    setSelectedProperty(null);
  };
  
  const handleDate = (profile: Relationship) => {
    if (!spendMoney(50)) return;
    if (!useEnergy(10)) return;
    
    const existingRel = currentProfile.relationships.find(r => r.id === profile.id);
    if (existingRel) {
      const newLevel = Math.min(100, existingRel.level + 5 + Math.floor(Math.random() * 5));
      updateProfile({
        relationships: currentProfile.relationships.map(r => 
          r.id === profile.id ? { ...r, level: newLevel } : r
        ),
      });
    } else {
      updateProfile({
        relationships: [...currentProfile.relationships, { ...profile, level: 10 }],
      });
    }
  };
  
  const renderStatBar = (label: string, value: number) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <Progress value={value * 10} className="h-1.5 flex-1" />
      <span className="text-xs font-medium w-4 text-right">{value}</span>
    </div>
  );
  
  const getBallTypeColor = (type: BowlingBall["type"]) => {
    switch (type) {
      case "plastic": return "bg-slate-500";
      case "urethane": return "bg-amber-500";
      case "reactive-solid": return "bg-red-500";
      case "reactive-pearl": return "bg-blue-500";
      case "reactive-hybrid": return "bg-purple-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Shop</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          <Coins className="w-3.5 h-3.5" />
          ${currentProfile.money.toLocaleString()}
        </Badge>
      </div>
      
      <Tabs defaultValue="balls" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="balls" className="text-xs">
            <CircleDot className="w-3.5 h-3.5 mr-1" />
            Balls
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs">
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="property" className="text-xs">
            <Home className="w-3.5 h-3.5 mr-1" />
            Home
          </TabsTrigger>
          <TabsTrigger value="dating" className="text-xs">
            <Heart className="w-3.5 h-3.5 mr-1" />
            Dating
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="balls" className="space-y-4 mt-4">
          {currentProfile.ownedBalls.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Balls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentProfile.ownedBalls.map((ball) => (
                  <div 
                    key={ball.id}
                    className={`
                      flex items-center justify-between p-3 rounded-md border
                      ${ball.id === currentProfile.activeBallId ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getBallTypeColor(ball.type)}`} />
                      <div>
                        <p className="font-medium text-sm">{ball.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {ball.type.replace("-", " ")} | {ball.coreType}
                        </p>
                      </div>
                    </div>
                    {ball.id === currentProfile.activeBallId ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveBall(ball.id)}
                        data-testid={`button-equip-${ball.id}`}
                      >
                        Equip
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-sm font-medium text-muted-foreground">Pro Shop</h2>
          {SHOP_BALLS.map((ball) => {
            const isOwned = ownedBallIds.includes(ball.id);
            const canAfford = currentProfile.money >= ball.price;
            
            return (
              <Card key={ball.id} className={isOwned ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full shrink-0 ${getBallTypeColor(ball.type)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium truncate">{ball.name}</span>
                        {isOwned ? (
                          <Badge variant="secondary">
                            <Check className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        ) : (
                          <span className="font-semibold text-primary">${ball.price}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {ball.type.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {ball.coreType}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {renderStatBar("Hook", ball.hookPotential)}
                        {renderStatBar("Control", ball.control)}
                        {renderStatBar("Backend", ball.backendReaction)}
                        {renderStatBar("Oil", ball.oilHandling)}
                        {renderStatBar("Forgive", ball.forgiveness)}
                      </div>
                    </div>
                  </div>
                  
                  {!isOwned && (
                    <Button 
                      className="w-full mt-3"
                      disabled={!canAfford}
                      onClick={() => setSelectedBall(ball)}
                      data-testid={`button-buy-${ball.id}`}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Purchase
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4 mt-4">
          {currentProfile.currentJob && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Current Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentProfile.currentJob.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${currentProfile.currentJob.weeklyPay}/week • -{currentProfile.currentJob.energyCost} energy
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge>{currentProfile.currentJob.weeksRemaining} weeks left</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 text-destructive"
                  onClick={() => setCurrentJob(null)}
                  data-testid="button-quit-job"
                >
                  Quit Job
                </Button>
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-sm font-medium text-muted-foreground">Available Jobs</h2>
          {AVAILABLE_JOBS.map((job) => {
            const meetsReqs = meetsJobRequirements(job);
            const hasJob = currentProfile.currentJob !== null;
            
            return (
              <Card key={job.id} className={hasJob || !meetsReqs ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-chart-3 font-semibold">${job.weeklyPay}/week</p>
                      <p className="text-xs text-muted-foreground">
                        {job.contractWeeks} week contract
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      -{job.energyCost}/week
                    </Badge>
                  </div>
                  
                  {job.requirements && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.reputation && (
                          <Badge variant={currentProfile.stats.reputation >= job.requirements.reputation ? "secondary" : "outline"} className="text-xs">
                            Rep {job.requirements.reputation}+
                          </Badge>
                        )}
                        {job.requirements.charisma && (
                          <Badge variant={currentProfile.stats.charisma >= job.requirements.charisma ? "secondary" : "outline"} className="text-xs">
                            Cha {job.requirements.charisma}+
                          </Badge>
                        )}
                        {job.requirements.consistency && (
                          <Badge variant={currentProfile.stats.consistency >= job.requirements.consistency ? "secondary" : "outline"} className="text-xs">
                            Con {job.requirements.consistency}+
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-3"
                    disabled={hasJob || !meetsReqs}
                    onClick={() => setSelectedJob(job)}
                    data-testid={`button-apply-${job.id}`}
                  >
                    Apply (5 Energy)
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="property" className="space-y-4 mt-4">
          {currentProfile.currentProperty && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Current Home
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{currentProfile.currentProperty.name}</p>
                <p className="text-sm text-muted-foreground">
                  +{currentProfile.currentProperty.energyBonus} energy recovery
                  {currentProfile.currentProperty.trainingBonus > 0 && ` • +${currentProfile.currentProperty.trainingBonus}% training`}
                </p>
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-sm font-medium text-muted-foreground">Available Properties</h2>
          {AVAILABLE_PROPERTIES.map((property) => {
            const isCurrentHome = currentProfile.currentProperty?.id === property.id;
            const canAfford = currentProfile.money >= property.monthlyCost;
            
            return (
              <Card key={property.id} className={isCurrentHome ? "border-primary/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-chart-3 font-semibold">
                        ${property.monthlyCost}/month
                      </p>
                    </div>
                    <Badge variant={property.type === "own" ? "default" : "outline"} className="capitalize">
                      {property.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      +{property.energyBonus} energy
                    </span>
                    {property.trainingBonus > 0 && (
                      <span>+{property.trainingBonus}% training</span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-3"
                    disabled={isCurrentHome || !canAfford}
                    variant={isCurrentHome ? "secondary" : "default"}
                    onClick={() => setSelectedProperty(property)}
                    data-testid={`button-rent-${property.id}`}
                  >
                    {isCurrentHome ? "Current Home" : `Move In`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="dating" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Build relationships to gain permanent buffs
          </p>
          
          {DATING_PROFILES.map((profile) => {
            const existingRel = currentProfile.relationships.find(r => r.id === profile.id);
            const level = existingRel?.level ?? 0;
            
            return (
              <Card key={profile.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Heart className={`w-5 h-5 ${level > 0 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{profile.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={level} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{level}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <span>Buffs:</span>
                    {profile.buffs?.mentalToughness && (
                      <Badge variant="secondary" className="text-xs">
                        +{profile.buffs.mentalToughness} Mental
                      </Badge>
                    )}
                    {profile.buffs?.energyRecovery && (
                      <Badge variant="secondary" className="text-xs">
                        +{profile.buffs.energyRecovery} Energy
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled={currentProfile.money < 50 || currentProfile.energy < 10}
                    onClick={() => handleDate(profile)}
                    data-testid={`button-date-${profile.id}`}
                  >
                    Go on Date ($50 + 10 Energy)
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={selectedBall !== null} onOpenChange={() => setSelectedBall(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purchase {selectedBall?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost ${selectedBall?.price}. You currently have ${currentProfile.money}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBuyBall}>
              Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={selectedJob !== null} onOpenChange={() => setSelectedJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply for {selectedJob?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This {selectedJob?.contractWeeks}-week contract pays ${selectedJob?.weeklyPay}/week 
              but costs {selectedJob?.energyCost} energy per week.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyJob}>
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={selectedProperty !== null} onOpenChange={() => setSelectedProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to {selectedProperty?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost ${selectedProperty?.monthlyCost} now for the first month.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRentProperty}>
              Move In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
