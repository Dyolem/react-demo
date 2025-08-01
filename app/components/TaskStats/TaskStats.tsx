import React, { useMemo } from 'react';
import type {TaskStats as StatsType} from '../../types';
import './TaskStats.css';

interface TaskStatsProps {
    stats: StatsType;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
    const completionRate = useMemo(() => {
        return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    }, [stats.completed, stats.total]);

    const priorityData = useMemo(() => [
        { label: '高优先级', value: stats.highPriority, color: '#ef4444' },
        { label: '中优先级', value: stats.mediumPriority, color: '#f59e0b' },
        { label: '低优先级', value: stats.lowPriority, color: '#10b981' }
    ], [stats.highPriority, stats.mediumPriority, stats.lowPriority]);

    const maxPriorityValue = Math.max(...priorityData.map(item => item.value));

    return (
        <div className="task-stats">
            <h3 className="stats-title">任务统计</h3>

            {/* 总体统计 */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">总任务</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">已完成</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">待完成</div>
                </div>

                <div className="stat-card">
                    <div className="stat-number">{completionRate}%</div>
                    <div className="stat-label">完成率</div>
                </div>
            </div>

            {/* 完成率进度条 */}
            <div className="progress-section">
                <div className="progress-header">
                    <span className="progress-label">完成进度</span>
                    <span className="progress-percentage">{completionRate}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>

            {/* 优先级分布 */}
            <div className="priority-distribution">
                <h4 className="section-title">优先级分布</h4>
                <div className="priority-chart">
                    {priorityData.map((item, index) => (
                        <div key={index} className="priority-item">
                            <div className="priority-info">
                                <div
                                    className="priority-color"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="priority-label">{item.label}</span>
                            </div>
                            <div className="priority-bar-container">
                                <div
                                    className="priority-bar"
                                    style={{
                                        width: maxPriorityValue > 0 ? `${(item.value / maxPriorityValue) * 100}%` : '0%',
                                        backgroundColor: item.color
                                    }}
                                />
                                <span className="priority-count">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 环形图 */}
            {stats.total > 0 && (
                <div className="donut-chart-section">
                    <h4 className="section-title">任务状态</h4>
                    <div className="donut-chart">
                        <svg viewBox="0 0 100 100" className="donut-svg">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="var(--bg-secondary)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="var(--primary-color)"
                                strokeWidth="8"
                                strokeDasharray={`${completionRate * 2.51} ${(100 - completionRate) * 2.51}`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                                className="donut-progress"
                            />
                        </svg>
                        <div className="donut-center">
                            <div className="donut-percentage">{completionRate}%</div>
                            <div className="donut-label">已完成</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskStats;