import React, { useCallback } from "react";
import type { TaskFilter as FilterType } from "../../types";
import { useDebounce } from "~/hooks";
import "./TaskFilter.css";

interface TaskFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  categories: string[];
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  filter,
  onFilterChange,
  categories,
}) => {
  const debouncedSearch = useDebounce(filter.search, 300);

  const handleSearchChange = useCallback(
    (search: string) => {
      onFilterChange({ ...filter, search });
    },
    [filter, onFilterChange],
  );

  const handleStatusChange = useCallback(
    (status: FilterType["status"]) => {
      onFilterChange({ ...filter, status });
    },
    [filter, onFilterChange],
  );

  const handlePriorityChange = useCallback(
    (priority: FilterType["priority"]) => {
      onFilterChange({ ...filter, priority });
    },
    [filter, onFilterChange],
  );

  const handleCategoryChange = useCallback(
    (category: FilterType["category"]) => {
      onFilterChange({ ...filter, category });
    },
    [filter, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    onFilterChange({
      status: "all",
      priority: "all",
      category: "all",
      search: "",
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    filter.status !== "all" ||
    filter.priority !== "all" ||
    filter.category !== "all" ||
    filter.search !== "";

  return (
    <div className="task-filter">
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">搜索</label>
          <div className="search-wrapper">
            <input
              type="text"
              value={filter.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索任务..."
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">状态</label>
          <select
            value={filter.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as FilterType["status"])
            }
            className="filter-select"
          >
            <option value="all">全部</option>
            <option value="pending">待完成</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">优先级</label>
          <select
            value={filter.priority}
            onChange={(e) =>
              handlePriorityChange(e.target.value as FilterType["priority"])
            }
            className="filter-select"
          >
            <option value="all">全部</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">分类</label>
          <select
            value={filter.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="clear-filters-btn"
            title="清除所有筛选条件"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;
