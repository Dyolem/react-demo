import React, { useState, useCallback, useRef, useEffect } from "react";
import type { TaskFormData, Task } from "~/types";
import "./TaskForm.css";

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  categories: string[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  categories,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    category: categories[0] || "工作",
  });
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        titleInputRef.current?.focus();
        return;
      }

      const categoryToUse =
        showNewCategory && newCategory.trim()
          ? newCategory.trim()
          : formData.category;

      onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: categoryToUse,
      });

      // 重置表单
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: categories[0] || "工作",
      });
      setNewCategory("");
      setShowNewCategory(false);
    },
    [formData, onSubmit, categories, showNewCategory, newCategory],
  );

  const handleInputChange = useCallback(
    (field: keyof TaskFormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit(e as any);
      } else if (e.key === "Escape") {
        onCancel();
      }
    },
    [handleSubmit, onCancel],
  );

  const toggleNewCategory = useCallback(() => {
    setShowNewCategory((prev) => !prev);
    setNewCategory("");
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="task-form"
      onKeyDown={handleKeyDown}
    >
      <div className="form-group">
        <label htmlFor="task-title" className="form-label">
          任务标题 <span className="required">*</span>
        </label>
        <input
          id="task-title"
          ref={titleInputRef}
          type="text"
          value={formData.title}
          onChange={handleInputChange("title")}
          placeholder="输入任务标题..."
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-description" className="form-label">
          任务描述
        </label>
        <textarea
          id="task-description"
          value={formData.description}
          onChange={handleInputChange("description")}
          placeholder="输入任务描述（可选）..."
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-priority" className="form-label">
            优先级
          </label>
          <select
            id="task-priority"
            value={formData.priority}
            onChange={handleInputChange("priority")}
            className="form-select"
          >
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-category" className="form-label">
            分类
          </label>
          <div className="category-wrapper">
            {!showNewCategory ? (
              <select
                id="task-category"
                value={formData.category}
                onChange={handleInputChange("category")}
                className="form-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="输入新分类..."
                className="form-input"
              />
            )}
            <button
              type="button"
              onClick={toggleNewCategory}
              className="category-toggle-btn"
              title={showNewCategory ? "选择已有分类" : "创建新分类"}
            >
              {showNewCategory ? "📋" : "➕"}
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          创建任务
          <span className="shortcut-hint">Ctrl+Enter</span>
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          取消
          <span className="shortcut-hint">Esc</span>
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
