import { fetchData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "task_assigned" | "task_completed" | "workspace_invite" | "project_added" | string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export const useNotificationsQuery = () => {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async () => fetchData("/notifications"),
    staleTime: 15_000,
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      updateData(`/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateData("/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

