import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Sparkles,
  Inbox,
  UserCheck
} from 'lucide-react';
import { Task, ToDoList, Priority } from '../types';
import { TaskItem } from './TaskItem';
import { useAuth } from '../context/AuthContext';

interface Props {
  list: ToDoList;
  tasks: Task[];
}

type StatusFilter = 'all' | 'pending' | 'completed';
type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'dueDate_asc' | 'priority_desc';

export const TaskList: React.FC<Props> = ({ list, tasks }) => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt_desc');

  // Compute categories present in list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search term
        if (searchTerm.trim()) {
          const lower = searchTerm.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(lower);
          const matchDesc = t.description?.toLowerCase().includes(lower);
          if (!matchTitle && !matchDesc) return false;
        }

        // Status
        if (statusFilter === 'pending' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;

        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Assignee
        if (assigneeFilter === 'me') {
          if (!user || t.assignedTo?.email !== user.email) return false;
        } else if (assigneeFilter !== 'all') {
          if (t.assignedTo?.email !== assigneeFilter) return false;
        }

        // Category
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'createdAt_desc') return b.createdAt - a.createdAt;
        if (sortBy === 'createdAt_asc') return a.createdAt - b.createdAt;
        if (sortBy === 'dueDate_asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority_desc') {
          const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, categoryFilter, sortBy, user]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress & Summary Bar */}
      {totalTasks > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              已完成 {completedTasks} / {totalTasks} 項任務
            </span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋任務內容..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              清除
            </button>
          )}
        </div>

        {/* Filters Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Tabs */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              已完成
            </button>
          </div>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0 cursor-pointer"
          >
            <option value="all">所有指派成員</option>
            {user && <option value="me">🎯 指派給我</option>}
            {(list.memberDetails || []).map((m) => (
              <option key={m.email} value={m.email}>
                {m.displayName || m.email}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0 cursor-pointer"
          >
            <option value="all">所有優先級</option>
            <option value="high">🔴 高優先</option>
            <option value="medium">🟡 中優先</option>
            <option value="low">🟢 低優先</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0 cursor-pointer"
          >
            <option value="createdAt_desc">最新建立 ⬇</option>
            <option value="createdAt_asc">最舊建立 ⬆</option>
            <option value="dueDate_asc">到期日最近 ⏰</option>
            <option value="priority_desc">優先等級最高 🔥</option>
          </select>
        </div>
      </div>

      {/* Task Items List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {tasks.length === 0 ? '這份清單目前還沒有任何任務' : '找不到符合條件的任務'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {tasks.length === 0
                ? '在上方輸入框輸入事項，按下 Enter 即可新增第一條協作任務！'
                : '請嘗試清除篩選條件或搜尋關鍵字。'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              members={list.memberDetails || []}
            />
          ))
        )}
      </div>
    </div>
  );
};
