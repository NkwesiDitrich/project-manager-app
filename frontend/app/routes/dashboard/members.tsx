import {
  useGetWorkspaceDetailsQuery,
  useRemoveMemberMutation,
} from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { MoreVertical, Search, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/loader";

const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMemberMutation(workspaceId ?? "");

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.search = search;
    setSearchParams(params, { replace: true });
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data || !workspaceId) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No workspace selected or not found.
      </div>
    );
  }

  const currentUserMember = data.members.find(
    (m) => user?._id && String(m.user._id) === String(user._id)
  );
  const isOwner = currentUserMember?.role === "owner";

  const filteredMembers = data.members.filter(
    (member) =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who has access to this workspace
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team</CardTitle>
              <CardDescription>
                {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} in this workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-lg border border-border">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback className="rounded-lg bg-muted text-sm font-medium">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-0">
                      <Badge
                        variant={
                          ["admin", "owner"].includes(member.role)
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>
                      <Badge variant="outline" className="font-normal">
                        {data.name}
                      </Badge>
                      {isOwner && member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg"
                              aria-label="Actions"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() =>
                                setMemberToRemove({
                                  id: member.user._id,
                                  name: member.user.name,
                                })
                              }
                            >
                              <UserMinus className="size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <Card
                key={member.user._id}
                className="relative overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col items-center pt-6 pb-6 text-center">
                  {isOwner && member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 size-8 rounded-lg"
                          aria-label="Actions"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() =>
                            setMemberToRemove({
                              id: member.user._id,
                              name: member.user.name,
                            })
                          }
                        >
                          <UserMinus className="size-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Avatar className="size-16 rounded-xl border border-border">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback className="rounded-xl bg-muted text-lg font-medium">
                      {member.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 font-semibold text-foreground">
                    {member.user.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                  <Badge
                    variant={
                      ["admin", "owner"].includes(member.role)
                        ? "default"
                        : "secondary"
                    }
                    className="mt-2 capitalize"
                  >
                    {member.role}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Remove <strong>{memberToRemove?.name}</strong> from this workspace?
              They will lose access to all projects and tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isRemoving}
              onClick={() => {
                if (memberToRemove) {
                  removeMember(memberToRemove.id, {
                    onSuccess: () => {
                      setMemberToRemove(null);
                      toast.success("Member removed");
                    },
                    onError: (err: unknown) => {
                      const e = err as { response?: { data?: { message?: string } } };
                      toast.error(e?.response?.data?.message ?? "Failed to remove");
                    },
                  });
                }
              }}
            >
              {isRemoving ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
