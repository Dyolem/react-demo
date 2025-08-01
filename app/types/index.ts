// src/types/index.ts
import React from "react";

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'completed';
    category: string;
    createdAt: Date;
    completedAt?: Date;
    order: number;
}

export interface TaskFilter {
    status: 'all' | 'pending' | 'completed';
    priority: 'all' | 'high' | 'medium' | 'low';
    category: 'all' | string;
    search: string;
}

export interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
}

export interface DragItem {
    id: string;
    index: number;
}

export type Theme = 'light' | 'dark';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export interface TaskFormData {
    title: string;
    description: string;
    priority: Task['priority'];
    category: string;
}