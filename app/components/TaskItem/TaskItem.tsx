import React, { useState, useRef, useCallback } from "react";
import type {Task} from "~/types";
import "./TaskItem.css";

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDragStart: (e: React.DragEvent, id: string, index: number) => void;
  onDragEnter: (e: React.DragEvent, id: string, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  onToggle,
  onDelete,
  onUpdate,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleSave = useCallback(() => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
    }
    setIsEditing(false);
  }, [task.id, editTitle, editDescription, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  }, [task.title, task.description]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div
      className={`task-item ${task.status === "completed" ? "completed" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id, index)}
      onDragEnter={(e) => onDragEnter(e, task.id, index)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="task-item-header">
        <div className="task-checkbox-wrapper">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.status === "completed"}
            onChange={() => onToggle(task.id)}
            aria-label={`标记任务 ${task.title} 为${task.status === "completed" ? "未完成" : "已完成"}`}
          />
        </div>

        <div className="task-content">
          {isEditing ? (
            <div className="task-edit-form">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-edit-input"
                placeholder="任务标题"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-edit-textarea"
                placeholder="任务描述"
                rows={2}
              />
              <div className="task-edit-actions">
                <button onClick={handleSave} className="btn btn-primary btn-sm">
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary btn-sm"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="task-info">
              <h3 className="task-title">{task.title}</h3>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div className="task-meta">
                <span
                  className="task-priority"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority === "high"
                    ? "高"
                    : task.priority === "medium"
                      ? "中"
                      : "低"}
                </span>
                <span className="task-category">{task.category}</span>
                <span className="task-date">
                  {task.status === "completed" && task.completedAt
                    ? `完成于 ${formatDate(task.completedAt)}`
                    : `创建于 ${formatDate(task.createdAt)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="task-actions">
            <button
              onClick={handleEdit}
              className="task-action-btn"
              aria-label="编辑任务"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="task-action-btn task-delete-btn"
              aria-label="删除任务"
            >
              🗑️
            </button>
            <div className="drag-handle" aria-label="拖拽排序">
              ⋮⋮
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
