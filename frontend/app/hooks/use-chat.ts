import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ChatMessage {
  _id: string;
  workspace: Workspace["_id"];
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  text?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export const useWorkspaceMessagesQuery = (workspaceId: string | null) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat", "workspace", workspaceId],
    queryFn: async () =>
      fetchData(
        `/chat/workspaces/${workspaceId}/messages?limit=100`
      ),
    enabled: !!workspaceId && workspaceId !== "null",
    refetchInterval: 3000, // simple polling to keep chat fresh
  });
};

export const useSendWorkspaceMessageMutation = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text?: string; image?: File | null }) => {
      const formData = new FormData();
      if (data.text) formData.append("text", data.text);
      if (data.image) formData.append("image", data.image);

      const response = await postData(
        `/chat/workspaces/${workspaceId}/messages`,
        formData,
        true
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "workspace", workspaceId],
      });
    },
  });
};

export const useEditWorkspaceMessageMutation = (workspaceId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messageId: string; text: string }) =>
      updateData(
        `/chat/workspaces/${workspaceId}/messages/${data.messageId}`,
        { text: data.text }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "workspace", workspaceId],
      });
    },
  });
};

export const useDeleteWorkspaceMessageMutation = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      deleteData(`/chat/workspaces/${workspaceId}/messages/${messageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "workspace", workspaceId],
      });
    },
  });
};
