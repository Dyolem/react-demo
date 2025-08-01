import { useState, useEffect, useCallback, useRef } from 'react';
import type {Task, Theme} from '~/types';

// 本地存储Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue] as const;
}

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// 主题Hook
export function useTheme() {
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, [setTheme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
}

// 拖拽排序Hook
export function useDragAndDrop<T extends { id: string; order: number }>(
    items: T[],
    onReorder: (newItems: T[]) => void
) {
    const dragItem = useRef<{ id: string; index: number } | null>(null);
    const dragOverItem = useRef<{ id: string; index: number } | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, id: string, index: number) => {
        dragItem.current = { id, index };
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent, id: string, index: number) => {
        e.preventDefault();
        dragOverItem.current = { id, index };
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();

        if (!dragItem.current || !dragOverItem.current) return;
        if (dragItem.current.id === dragOverItem.current.id) return;

        const newItems = [...items];
        const dragItemIndex = dragItem.current.index;
        const dragOverItemIndex = dragOverItem.current.index;

        // 移动元素
        const [movedItem] = newItems.splice(dragItemIndex, 1);
        newItems.splice(dragOverItemIndex, 0, movedItem);

        // 更新order字段
        const reorderedItems = newItems.map((item, index) => ({
            ...item,
            order: index
        }));

        onReorder(reorderedItems);

        dragItem.current = null;
        dragOverItem.current = null;
    }, [items, onReorder]);

    return {
        handleDragStart,
        handleDragEnter,
        handleDragOver,
        handleDrop
    };
}

// 键盘快捷键Hook
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
            const handler = shortcuts[key];

            if (handler) {
                e.preventDefault();
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}