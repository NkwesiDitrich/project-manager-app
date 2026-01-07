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

const MotionDiv = motion.div as any;

const AchievementIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, any> = { Trophy, Medal, Star, Target, Zap };
  const Icon = icons[name] || Star;
  return <Icon className={className} />;
};

export default function AchievementsPage() {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  
  const { data, isLoading } = useGetAchievementsQuery(workspaceId);

  if (isLoading) return <Loader />;

  const { userStats, leaderboard, allBadges } = data as any;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasco Achievements</h1>
          <p className="text-muted-foreground">Track your progress and earn badges.</p>
        </div>
        <div className="flex gap-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
          <div className="text-center"><p className="text-xs text-primary">LEVEL</p><p className="text-2xl font-bold">{userStats.level}</p></div>
          <div className="text-center"><p className="text-xs text-primary">XP</p><p className="text-2xl font-bold">{userStats.xp}</p></div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Level Progress</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Progress value={userStats.xp % 100} className="h-3" />
          <p className="text-xs text-muted-foreground">{100 - (userStats.xp % 100)} XP to next level</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {allBadges.map((badge: any) => {
              const isUnlocked = userStats.badges.some((ub: any) => ub.badge._id === badge._id);
              return (
                <MotionDiv key={badge._id} whileHover={{ scale: 1.02 }}
                  className={`relative rounded-xl border p-6 text-center ${isUnlocked ? "bg-card border-primary/20 shadow-sm" : "bg-muted/50 grayscale opacity-60"}`}>
                  <div className="mb-4 flex justify-center text-primary"><AchievementIcon name={badge.icon} className="size-8" /></div>
                  <h3 className="font-bold">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                  <BadgeUI variant={isUnlocked ? "default" : "secondary"} className="mt-4">{badge.tier}</BadgeUI>
                </MotionDiv>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {leaderboard.map((entry: any, index: number) => (
                <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className="font-bold w-4">{index + 1}</span>
                    <Avatar><AvatarImage src={entry.profilePicture} /><AvatarFallback>{entry.name[0]}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{entry.name}</p><p className="text-xs text-muted-foreground">Level {entry.level}</p></div>
                  </div>
                  <p className="font-bold">{entry.xp} XP</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}