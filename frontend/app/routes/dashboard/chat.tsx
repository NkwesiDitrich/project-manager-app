import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/loader";
import {
  useDeleteWorkspaceMessageMutation,
  useEditWorkspaceMessageMutation,
  useSendWorkspaceMessageMutation,
  useWorkspaceMessagesQuery,
} from "@/hooks/use-chat";
import { useAuth } from "@/provider/auth-context";
import { ImageIcon, MoreVertical, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

const getImageUrl = (imageUrl: string): string => {
  // If already a full URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Get the API base URL from environment or default
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api-v1";
  
  // Extract server base URL (protocol + host + port, without /api-v1)
  let serverBase: string;
  try {
    if (apiUrl.includes("/api-v1")) {
      // Remove /api-v1 and everything after it
      serverBase = apiUrl.replace(/\/api-v1.*$/, "");
    } else {
      // Remove trailing slash if present
      serverBase = apiUrl.replace(/\/$/, "");
    }
    
    // Fallback to default if empty
    if (!serverBase) {
      serverBase = "http://localhost:3001";
    }
  } catch {
    serverBase = "http://localhost:3001";
  }
  
  // If imageUrl already starts with /api-v1, prepend server base to make full URL
  if (imageUrl.startsWith("/api-v1")) {
    return `${serverBase}${imageUrl}`;
  }
  
  // Otherwise, construct full path using API URL
  return `${apiUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: messages, isLoading } = useWorkspaceMessagesQuery(
    workspaceId
  );
  const { mutate: sendMessage, isPending } =
    useSendWorkspaceMessageMutation(workspaceId);
  const { mutate: editMessage, isPending: isEditing } =
    useEditWorkspaceMessageMutation(workspaceId);
  const { mutate: deleteMessage, isPending: isDeleting } =
    useDeleteWorkspaceMessageMutation(workspaceId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!workspaceId || workspaceId === "null") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Workspace Chat</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Select a workspace from the header to chat with your team.
        </p>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim() && !imageFile) return;

    sendMessage(
      { text: message.trim() || undefined, image: imageFile },
      {
        onSuccess: () => {
          setMessage("");
          setImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  };

  const handleEdit = () => {
    if (!editingMessage?.text.trim()) return;
    editMessage(
      { messageId: editingMessage.id, text: editingMessage.text.trim() },
      {
        onSuccess: () => {
          setEditingMessage(null);
          toast.success("Message updated");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to edit message");
        },
      }
    );
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId, {
      onSuccess: () => toast.success("Message deleted"),
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete message");
      },
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] min-w-0 w-full">
      <div className="mb-4 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold">Workspace Chat</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chat in real-time with members of the selected workspace. Share updates,
          ideas, and files in one place.
        </p>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle className="text-base">Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => {
                const isOwnMessage =
                  user?._id && msg.sender?._id
                    ? String(user._id) === String(msg.sender._id)
                    : false;
                return (
                  <div key={msg._id} className="flex items-start gap-3 group">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.sender.profilePicture} />
                      <AvatarFallback>
                        {msg.sender.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {msg.sender.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwnMessage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditingMessage({
                                    id: msg._id,
                                    text: msg.text || "",
                                  })
                                }
                                disabled={!!msg.imageUrl && !msg.text}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(msg._id)}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {msg.text && (
                        <p className="text-sm mt-1 whitespace-pre-line">
                          {msg.text}
                        </p>
                      )}
                      {msg.imageUrl && (
                        <div className="mt-2 max-w-xs">
                          <a
                            href={getImageUrl(msg.imageUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={getImageUrl(msg.imageUrl)}
                              alt="Chat attachment"
                              className="rounded-lg border object-cover max-h-64 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Dialog
            open={!!editingMessage}
            onOpenChange={(open) => !open && setEditingMessage(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit message</DialogTitle>
              </DialogHeader>
              <Textarea
                value={editingMessage?.text ?? ""}
                onChange={(e) =>
                  setEditingMessage((prev) =>
                    prev ? { ...prev, text: e.target.value } : null
                  )
                }
                rows={3}
                placeholder="Edit your message..."
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingMessage(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={isEditing || !editingMessage?.text.trim()}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-4 border-t pt-4 space-y-3 min-w-0">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="min-w-0"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                {imageFile && (
                  <span className="text-xs text-muted-foreground max-w-[160px] truncate">
                    {imageFile.name}
                  </span>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSend}
                disabled={isPending || (!message.trim() && !imageFile)}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;

