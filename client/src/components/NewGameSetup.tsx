import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Target, Hand, Zap } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { BowlingStyle, Handedness, BowlingTrait } from "@shared/schema";
import { TRAIT_DESCRIPTIONS } from "@shared/schema";

interface NewGameSetupProps {
  slotId: number;
  onBack: () => void;
}

type SetupStep = "name" | "style" | "handedness" | "trait";

const TRAITS_LIST: BowlingTrait[] = [
  "tweener",
  "power-cranker", 
  "smooth-stroker",
  "clutch-finisher",
  "spare-specialist",
];

export function NewGameSetup({ slotId, onBack }: NewGameSetupProps) {
  const { createNewGame } = useGame();
  const [step, setStep] = useState<SetupStep>("name");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle>("one-handed");
  const [handedness, setHandedness] = useState<Handedness>("right");
  const [trait, setTrait] = useState<BowlingTrait>("tweener");
  
  const canProceed = () => {
    if (step === "name") {
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    return true;
  };
  
  const handleNext = () => {
    if (step === "name") {
      setStep("style");
    } else if (step === "style") {
      setStep("handedness");
    } else if (step === "handedness") {
      setStep("trait");
    } else {
      createNewGame(slotId, firstName.trim(), lastName.trim(), bowlingStyle, handedness, trait);
    }
  };
  
  const handleBack = () => {
    if (step === "name") {
      onBack();
    } else if (step === "style") {
      setStep("name");
    } else if (step === "handedness") {
      setStep("style");
    } else {
      setStep("handedness");
    }
  };
  
  const getStepNumber = () => {
    switch (step) {
      case "name": return 1;
      case "style": return 2;
      case "handedness": return 3;
      case "trait": return 4;
    }
  };
  
  const getHandednessOptions = () => {
    if (bowlingStyle === "one-handed") {
      return [
        { value: "left", label: "Left-Handed", description: "Release with your left hand" },
        { value: "right", label: "Right-Handed", description: "Release with your right hand" },
      ];
    }
    return [
      { value: "left-dominant", label: "Left Dominant", description: "Left hand guides the ball" },
      { value: "right-dominant", label: "Right Dominant", description: "Right hand guides the ball" },
    ];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Step {getStepNumber()} of 4
            </p>
            <div className="flex justify-center gap-2 mt-2">
              {["name", "style", "handedness", "trait"].map((s, idx) => (
                <div 
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    s === step ? "bg-primary" : 
                    idx < getStepNumber()! - 1 ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {step === "name" && (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Bowler</CardTitle>
                <CardDescription>What's your name, future champion?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    data-testid="input-first-name"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    data-testid="input-last-name"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {step === "style" && (
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Bowling Style</CardTitle>
                <CardDescription>How do you throw the ball?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={bowlingStyle} 
                  onValueChange={(v) => {
                    setBowlingStyle(v as BowlingStyle);
                    setHandedness(v === "one-handed" ? "right" : "right-dominant");
                  }}
                  className="space-y-3"
                >
                  <label 
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border cursor-pointer
                      transition-all hover-elevate
                      ${bowlingStyle === "one-handed" ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <RadioGroupItem value="one-handed" id="one-handed" data-testid="radio-one-handed" />
                    <div className="flex-1">
                      <p className="font-medium">One-Handed</p>
                      <p className="text-sm text-muted-foreground">
                        Traditional style with one hand supporting the ball
                      </p>
                    </div>
                  </label>
                  
                  <label 
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border cursor-pointer
                      transition-all hover-elevate
                      ${bowlingStyle === "two-handed" ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <RadioGroupItem value="two-handed" id="two-handed" data-testid="radio-two-handed" />
                    <div className="flex-1">
                      <p className="font-medium">Two-Handed</p>
                      <p className="text-sm text-muted-foreground">
                        Modern power style using both hands for extra revs
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>
          )}
          
          {step === "handedness" && (
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Hand className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Dominant Hand</CardTitle>
                <CardDescription>Which hand controls your throw?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={handedness} 
                  onValueChange={(v) => setHandedness(v as Handedness)}
                  className="space-y-3"
                >
                  {getHandednessOptions().map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        flex items-center gap-4 p-4 rounded-lg border cursor-pointer
                        transition-all hover-elevate
                        ${handedness === option.value ? "border-primary bg-primary/5" : "border-border"}
                      `}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={option.value} 
                        data-testid={`radio-${option.value}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}
          
          {step === "trait" && (
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Bowling Trait</CardTitle>
                <CardDescription>Choose your signature style - this affects your gameplay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={trait} 
                  onValueChange={(v) => setTrait(v as BowlingTrait)}
                  className="space-y-3"
                >
                  {TRAITS_LIST.map((t) => {
                    const info = TRAIT_DESCRIPTIONS[t];
                    return (
                      <label 
                        key={t}
                        className={`
                          flex items-start gap-4 p-4 rounded-lg border cursor-pointer
                          transition-all hover-elevate
                          ${trait === t ? "border-primary bg-primary/5" : "border-border"}
                        `}
                      >
                        <RadioGroupItem 
                          value={t} 
                          id={t} 
                          data-testid={`radio-trait-${t}`}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{info.name}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {info.effects}
                          </Badge>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          )}
          
          <Button
            data-testid="button-next"
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full mt-6"
            size="lg"
          >
            {step === "trait" ? "Start Career" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
