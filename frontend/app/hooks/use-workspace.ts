import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { deleteData, fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
    staleTime: 30_000,
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId && workspaceId !== "null",
    staleTime: 20_000,
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
    onSuccess: (_data, _variables) => {
      // Refresh workspace lists and details after accepting invite
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
};

export const useAcceptGenerateInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "details"],
      });
    },
  });
};

export const useRemoveMemberMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      deleteData(`/workspaces/${workspaceId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
};

export const useGetAchievementsQuery = (workspaceId: string | null) => {
  const resolvedWorkspaceId =
    workspaceId && workspaceId !== "null" ? workspaceId : null;

  return useQuery({
    queryKey: ["achievements", resolvedWorkspaceId ?? "none"],
    queryFn: async () =>
      fetchData(
        `achievements${
          resolvedWorkspaceId ? `?workspaceId=${resolvedWorkspaceId}` : ""
        }`
      ),
    // Only fetch when we have a real workspace selected
    enabled: !!resolvedWorkspaceId,
  });
};

