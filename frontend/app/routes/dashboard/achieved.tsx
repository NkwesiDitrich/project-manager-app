import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, Target, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useGetAchievementsQuery } from "@/hooks/use-workspace";
import { Loader } from "@/components/loader";

const MotionDiv = motion.div as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;

const AchievementIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const icons: Record<string, any> = {
    Trophy,
    Medal,
    Star,
    Target,
    Zap,
  };
  const Icon = icons[name] || Star;
  return <Icon className={className} />;
};

export default function AchievementsPage() {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  // If no workspace is selected, show the same welcome message as Dashboard/My Tasks
  if (!workspaceId || workspaceId === "null") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Tasco!</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            It looks like you haven't selected a workspace yet. Please{" "}
            <strong>create a new workspace</strong> or select an existing one from
            the header to view your achievements and leaderboard for that workspace.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data using the dynamic React Query hook (now only when a real workspaceId exists)
  const { data, isLoading } = useGetAchievementsQuery(workspaceId);

  if (isLoading) {
    return <Loader />;
  }

  // Fallback to empty objects if data is not yet available
  const {
    userStats = { xp: 0, level: 1, streak: 0, badges: [] },
    leaderboard = [],
    allBadges = [],
  } = (data as any) || {};

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasco Achievements</h1>
          <p className="text-muted-foreground">Track your progress, earn badges, and climb the leaderboard.</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
          <div className="text-center">
            <p className="text-xs font-medium uppercase text-primary">Level</p>
            <p className="text-2xl font-bold">{userStats.level}</p>
          </div>
          <div className="h-10 w-px bg-primary/20" />
          <div className="text-center">
            <p className="text-xs font-medium uppercase text-primary">XP</p>
            <p className="text-2xl font-bold">{userStats.xp}</p>
          </div>
        </div>
      </div>

      {/* Progress & Streak Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress to Level {userStats.level + 1}</span>
              <span>{userStats.xp % 100}%</span>
            </div>
            <Progress value={userStats.xp % 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Earn {100 - (userStats.xp % 100)} more XP to reach the next level!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-yellow-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userStats.streak} Days</div>
            <p className="text-sm text-muted-foreground mt-2">Keep it up! Complete a task daily to grow your streak.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Badges Grid */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allBadges.map((badge: any) => {
              const isUnlocked = userStats.badges.some((ub: any) => ub.badge._id === badge._id);
              return (
                <MotionDiv
                  key={badge._id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group rounded-xl border p-6 transition-all ${
                    isUnlocked ? "bg-card border-primary/20 shadow-sm" : "bg-muted/50 grayscale opacity-60"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${
                      isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <AchievementIcon name={badge.icon} className="size-8" />
                    </div>
                    <div>
                      <h3 className="font-bold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                    <BadgeUI variant={isUnlocked ? "default" : "secondary"}>
                      {badge.tier}
                    </BadgeUI>
                  </div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-bold bg-background px-3 py-1 rounded-full border shadow-sm">
                        Locked
                      </p>
                    </div>
                  )}
                </MotionDiv>
              );
            })}
          </div>
        </TabsContent>

        {/* Leaderboard List */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Workspace Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry: any, index: number) => (
                    <div key={entry._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 text-center font-bold ${
                          index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-600" : ""
                        }`}>
                          {index + 1}
                        </span>
                        <Avatar>
                          <AvatarImage src={entry.profilePicture} />
                          <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.xp} XP</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No leaderboard data available for this workspace.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}