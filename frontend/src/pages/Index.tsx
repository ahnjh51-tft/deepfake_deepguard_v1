import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetectionTab from "@/components/detection/DetectionTab";
import HistoryTab from "@/components/detection/HistoryTab";
import { Scan, History, LogOut } from "lucide-react";
import deepguardLogo from "@/assets/deepguard-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const tabs = useMemo(
    () => [
      {
        value: "detection",
        label: "検出",
        icon: Scan,
        roles: ["admin", "user"],
        content: <DetectionTab />,
      },
      {
        value: "history",
        label: "履歴",
        icon: History,
        roles: ["admin"],
        content: <HistoryTab />,
      },
    ],
    []
  );

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(user?.role ?? "user"));
  const defaultTab = visibleTabs[0]?.value ?? "detection";
  const gridClass =
    visibleTabs.length >= 4
      ? "grid-cols-4"
      : visibleTabs.length === 3
      ? "grid-cols-3"
      : visibleTabs.length === 2
      ? "grid-cols-2"
      : "grid-cols-1";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white dark:bg-card shadow-medium">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={deepguardLogo} alt="DeepGuard" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a8a]">DEEPGUARD</h1>
              <p className="text-sm font-medium text-[#06b6d4]">AI TRUTH SCAN</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-intel-dark-blue">{user?.name}</p>
              <p className="text-xs text-foreground/60">
                役割: {isAdmin ? "管理者" : "利用者"}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-intel-medium-blue text-intel-medium-blue hover:bg-intel-pale-blue/20"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className={`grid w-full mb-8 h-auto p-2 bg-white dark:bg-card shadow-medium border border-border ${gridClass}`}>
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0071C5] data-[state=active]:to-[#06b6d4] data-[state=active]:text-white data-[state=active]:shadow-glow py-3"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {visibleTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
