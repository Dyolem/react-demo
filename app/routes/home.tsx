import { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import type { Route } from './+types/home';
import type {Task, TaskFilter as FilterType, TaskFormData, TaskStats} from '../types';
import { useLocalStorage, useDebounce, useTheme, useDragAndDrop, useKeyboardShortcuts } from '../hooks';
import Modal from '../components/Modal/Modal';
import TaskItem from '../components/TaskItem/TaskItem';
import TaskFilter from '../components/TaskFilter/TaskFilter';
import TaskForm from '../components/TaskForm/TaskForm';
import TaskStatsComponent from '../components/TaskStats/TaskStats';
import '../styles/app.css';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "TaskFlow - 智能任务管理器" },
    { name: "description", content: "高效的任务管理应用，支持拖拽排序、主题切换、实时统计等功能" },
    { name: "keywords", content: "任务管理, todo, 效率工具, React, TypeScript" },
  ];
};

const DEFAULT_CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐'];

export default function TaskFlowHome() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [filter, setFilter] = useState<FilterType>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // 防抖搜索
  const debouncedSearch = useDebounce(filter.search, 300);

  // 生成唯一ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }, []);

  // 获取所有分类
  const categories = useMemo(() => {
    const taskCategories = Array.from(new Set(tasks.map(task => task.category)));
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...taskCategories]));
  }, [tasks]);

  // 筛选任务
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 状态筛选
      if (filter.status !== 'all' && task.status !== filter.status) {
        return false;
      }

      // 优先级筛选
      if (filter.priority !== 'all' && task.priority !== filter.priority) {
        return false;
      }

      // 分类筛选
      if (filter.category !== 'all' && task.category !== filter.category) {
        return false;
      }

      // 搜索筛选
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower);
      }

      return true;
    }).sort((a, b) => a.order - b.order);
  }, [tasks, filter.status, filter.priority, filter.category, debouncedSearch]);

  // 计算统计数据
  const stats = useMemo<TaskStats>(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      highPriority: tasks.filter(task => task.priority === 'high').length,
      mediumPriority: tasks.filter(task => task.priority === 'medium').length,
      lowPriority: tasks.filter(task => task.priority === 'low').length
    };
  }, [tasks]);

  // 拖拽排序
  const { handleDragStart, handleDragEnter, handleDragOver, handleDrop } = useDragAndDrop(
      filteredTasks,
      useCallback((newTasks: Task[]) => {
        // 更新任务顺序
        const updatedTasks = tasks.map(task => {
          const updatedTask = newTasks.find(t => t.id === task.id);
          return updatedTask || task;
        });
        setTasks(updatedTasks);
      }, [tasks, setTasks])
  );

  // 任务操作
  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'pending',
      category: formData.category,
      createdAt: new Date(),
      order: tasks.length
    };

    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
  }, [generateId, tasks.length, setTasks]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed',
          completedAt: task.status === 'pending' ? new Date() : undefined
        };
      }
      return task;
    }));
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  // 键盘快捷键
  useKeyboardShortcuts({
    'Ctrl+Alt+n': () => setIsModalOpen(true),
    'Ctrl+/': toggleTheme,
    'Escape': () => setIsModalOpen(false)
  });

  // 页面标题更新
  useLayoutEffect(() => {
    const pendingCount = stats.pending;
    document.title = pendingCount > 0
        ? `TaskFlow (${pendingCount} 待完成)`
        : 'TaskFlow - 智能任务管理';
  }, [stats.pending]);

  return (
      <div className="app">
        <div className="app-container">
          {/* 头部 */}
          <header className="app-header">
            <h1 className="app-title">
              <span className="app-title-icon">📋</span>
              TaskFlow
            </h1>
            <div className="header-actions">
              <button
                  onClick={toggleTheme}
                  className="theme-toggle"
                  title={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
                  aria-label="切换主题"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                  onClick={() => setIsModalOpen(true)}
                  className="add-task-btn"
                  title="创建新任务 (Ctrl+N)"
              >
                <span>➕</span>
                添加任务
              </button>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="app-main">
            <section className="tasks-section">
              {/* 筛选器 */}
              <TaskFilter
                  filter={filter}
                  onFilterChange={setFilter}
                  categories={categories}
              />

              {/* 任务列表 */}
              <div className="tasks-list">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onUpdate={updateTask}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        {tasks.length === 0 ? '📝' : '🔍'}
                      </div>
                      <h3 className="empty-state-title">
                        {tasks.length === 0 ? '还没有任务' : '没有匹配的任务'}
                      </h3>
                      <p className="empty-state-description">
                        {tasks.length === 0
                            ? '点击"添加任务"按钮创建你的第一个任务，开始高效管理时间！'
                            : '尝试调整筛选条件或搜索关键词'
                        }
                      </p>
                    </div>
                )}
              </div>
            </section>

            {/* 统计面板 */}
            <aside className="stats-section">
              <TaskStatsComponent stats={stats} />
            </aside>
          </main>

          {/* 添加任务模态框 */}
          <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="创建新任务"
          >
            <TaskForm
                onSubmit={addTask}
                onCancel={() => setIsModalOpen(false)}
                categories={categories}
            />
          </Modal>

          {/* 快捷键提示 */}
          <div className="shortcuts-hint">
            <div>Ctrl+Shift+N: 新建任务</div>
            <div>Ctrl+/: 切换主题</div>
            <div>Esc: 关闭弹窗</div>
          </div>
        </div>
      </div>
  );
}