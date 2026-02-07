import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import type { Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Link } from "react-router";

const COLUMN_IDS = ["To Do", "In Progress", "Done"] as const;

const statusToColumn = (s: TaskStatus): (typeof COLUMN_IDS)[number] => {
  if (s === "To Do") return "To Do";
  if (s === "In Progress") return "In Progress";
  return "Done";
};

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const workspaceId =
    typeof task.project?.workspace === "string"
      ? task.project.workspace
      : (task.project?.workspace as { _id?: string })?._id;
  const projectId = task.project?._id;

  return (
    <Card
      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? "opacity-90 shadow-xl ring-2 ring-primary" : ""
      }`}
    >
      <Link
        to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`}
        className="block p-3"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{task.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {task.description || "No description"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant={
                  task.priority === "High" ? "destructive" : "secondary"
                }
              >
                {task.priority}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

interface DraggableTaskCardProps {
  task: Task;
}

const DraggableTaskCard = ({ task }: DraggableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-3"
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
};

interface TasksBoardViewProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

export const TasksBoardView = ({
  todoTasks,
  inProgressTasks,
  doneTasks,
}: TasksBoardViewProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateStatus = useUpdateTaskStatusMutation();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over?.id || active.id === over.id) return;

      const task = active.data.current?.task as Task | undefined;
      const newStatus = over.data?.current?.status as TaskStatus | undefined;
      if (!task || !newStatus || statusToColumn(task.status) === newStatus) return;

      const validStatuses: TaskStatus[] = ["To Do", "In Progress", "Done"];
      if (!validStatuses.includes(newStatus)) return;

      updateStatus.mutate({ taskId: task._id, status: newStatus });
    },
    [updateStatus]
  );

  const columns = [
    { id: "To Do" as const, tasks: todoTasks },
    { id: "In Progress" as const, tasks: inProgressTasks },
    { id: "Done" as const, tasks: doneTasks },
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ id, tasks }) => (
          <DroppableColumnWithOver
            key={id}
            id={id}
            title={id}
            tasks={tasks}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-2 scale-105 opacity-95">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const DroppableColumnWithOver = ({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[];
}) => {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } });

  return (
    <Card
      ref={setNodeRef}
      className={`flex-1 min-w-0 transition-colors ${
        isOver ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between text-base">
          {title}
          <Badge variant="outline">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 min-h-[400px] max-h-[600px] overflow-y-auto">
        <div className="space-y-0">
          {tasks.map((task) => (
            <DraggableTaskCard key={task._id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Drop tasks here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
