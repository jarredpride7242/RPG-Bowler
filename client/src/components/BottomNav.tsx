import { Home, Target, Trophy, ShoppingBag, User } from "lucide-react";

type TabId = "home" | "bowl" | "career" | "shop" | "profile";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "bowl", label: "Bowl", icon: Target },
  { id: "career", label: "Career", icon: Trophy },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1
                transition-colors duration-200
                ${isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
                }
              `}
            >
              <div className={`
                relative p-1.5 rounded-lg transition-all duration-200
                ${isActive ? "bg-primary/10" : ""}
              `}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { TabId };
