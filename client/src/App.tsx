import { useState, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider, useGame } from "@/lib/gameContext";
import { ThemeProvider } from "@/lib/themeContext";
import { SaveFileManager } from "@/components/SaveFileManager";
import { NewGameSetup } from "@/components/NewGameSetup";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { StatusBar } from "@/components/StatusBar";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { BowlScreen } from "@/components/screens/BowlScreen";
import { CareerScreen } from "@/components/screens/CareerScreen";
import { ShopScreen } from "@/components/screens/ShopScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { setBackButtonHandler } from "@/lib/capacitor";

function GameContent() {
  const { isPlaying, currentSlot } = useGame();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [newGameSlot, setNewGameSlot] = useState<number | null>(null);
  
  useEffect(() => {
    if (isPlaying && newGameSlot !== null) {
      setNewGameSlot(null);
    }
  }, [isPlaying, newGameSlot]);

  const handleBackButton = useCallback(() => {
    if (newGameSlot !== null && !isPlaying) {
      setNewGameSlot(null);
      return true;
    }
    if (isPlaying && activeTab !== "home") {
      setActiveTab("home");
      return true;
    }
    return false;
  }, [newGameSlot, isPlaying, activeTab]);

  useEffect(() => {
    setBackButtonHandler(handleBackButton);
    return () => setBackButtonHandler(null);
  }, [handleBackButton]);
  
  if (newGameSlot !== null && !isPlaying) {
    return (
      <NewGameSetup 
        slotId={newGameSlot} 
        onBack={() => setNewGameSlot(null)} 
      />
    );
  }
  
  if (!isPlaying) {
    return (
      <SaveFileManager 
        onStartNewGame={(slotId) => setNewGameSlot(slotId)} 
      />
    );
  }
  
  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigate={setActiveTab} />;
      case "bowl":
        return <BowlScreen />;
      case "career":
        return <CareerScreen />;
      case "shop":
        return <ShopScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigate={setActiveTab} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background safe-area-container">
      <StatusBar />
      <main className="max-w-2xl mx-auto pb-20">
        {renderScreen()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <GameProvider>
            <GameContent />
            <Toaster />
          </GameProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
