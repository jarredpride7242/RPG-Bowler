import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Play, Trash2, User, Calendar, Target } from "lucide-react";
import { useGame } from "@/lib/gameContext";
import type { SaveSlot } from "@shared/schema";

interface SaveFileManagerProps {
  onStartNewGame: (slotId: number) => void;
}

export function SaveFileManager({ onStartNewGame }: SaveFileManagerProps) {
  const { gameState, loadGame, deleteGame } = useGame();
  const [deleteSlot, setDeleteSlot] = useState<number | null>(null);
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const handleSlotClick = (slot: SaveSlot) => {
    if (slot.isEmpty) {
      onStartNewGame(slot.slotId);
    } else {
      loadGame(slot.slotId);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteSlot !== null) {
      deleteGame(deleteSlot);
      setDeleteSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Strike Force</h1>
          <p className="text-muted-foreground mt-1">Bowling Career Simulator</p>
        </div>
        
        <div className="w-full max-w-md space-y-3">
          {gameState.saves.map((slot) => (
            <Card 
              key={slot.slotId}
              className={`
                relative overflow-visible transition-all duration-200
                ${slot.isEmpty 
                  ? "border-dashed border-2 hover-elevate" 
                  : "hover-elevate"
                }
              `}
            >
              {slot.isEmpty ? (
                <button
                  data-testid={`save-slot-empty-${slot.slotId}`}
                  onClick={() => handleSlotClick(slot)}
                  className="w-full p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-medium">New Career</span>
                  <span className="text-xs">Save Slot {slot.slotId}</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    data-testid={`save-slot-${slot.slotId}`}
                    onClick={() => handleSlotClick(slot)}
                    className="w-full text-left"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {slot.profile?.firstName} {slot.profile?.lastName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">
                              {slot.profile?.bowlingStyle} | {slot.profile?.handedness}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={slot.profile?.isProfessional ? "default" : "secondary"}
                        >
                          {slot.profile?.isProfessional ? "PRO" : "Amateur"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold tabular-nums">
                            {slot.profile?.bowlingAverage || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">avg</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs">
                            S{slot.profile?.currentSeason} W{slot.profile?.currentWeek}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Play className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs">
                            {slot.profile?.totalGamesPlayed} games
                          </span>
                        </div>
                      </div>
                      {slot.lastSaved && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last played: {formatDate(slot.lastSaved)}
                        </p>
                      )}
                    </CardContent>
                  </button>
                  
                  <Button
                    data-testid={`delete-save-${slot.slotId}`}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteSlot(slot.slotId);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      
      <AlertDialog open={deleteSlot !== null} onOpenChange={() => setDeleteSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Save File?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this career and all progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
