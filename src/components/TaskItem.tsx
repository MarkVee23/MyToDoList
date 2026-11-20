import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit2,
  Tag,
  AlertCircle,
  X,
  Save,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Priority, ListMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Props {
  task: Task;
  members: ListMember[];
}

export const TaskItem: React.FC<Props> = ({ task, members }) => {
  const { user } = useAuth();
  const { toast, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editAssigneeEmail, setEditAssigneeEmail] = useState(task.assignedTo?.email || '');
  const [editCategory, setEditCategory] = useState(task.category || '工作');
  const [loading, setLoading] = useState(false);

  const isAssignedToMe = user && task.assignedTo?.email === user.email;

  // Check if overdue
  const isOverdue =
    !task.completed &&
    task.dueDate &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const handleToggleComplete = async () => {
    if (!user) {
      toastError('請先登入 Google 帳號');
      return;
    }
    if (!db) return;

    const newCompleted = !task.completed;

    try {
      if (newCompleted) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0c8fe9', '#10b981', '#f59e0b', '#ec4899'],
        });
      }

      const taskRef = doc(db, 'lists', task.listId, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: newCompleted,
        completedBy: newCompleted
          ? {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || '使用者',
              email: user.email || '',
            }
          : null,
        completedAt: newCompleted ? Date.now() : null,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      toastError('更新任務狀態失敗');
    }
  };

  const handleDelete = async () => {
    if (!db) return;
    if (!window.confirm(`確定要刪除「${task.title}」嗎？`)) return;

    try {
      await deleteDoc(doc(db, 'lists', task.listId, 'tasks', task.id));
      toast('已刪除任務', 'info');
    } catch (err: any) {
      toastError('刪除任務失敗');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toastError('任務名稱不能為空');
      return;
    }
    if (!db) return;

    try {
      setLoading(true);

      let newAssignedTo = null;
      if (editAssigneeEmail) {
        const found = members.find((m) => m.email === editAssigneeEmail);
        if (found) {
          newAssignedTo = {
            uid: found.uid || '',
            displayName: found.displayName || found.email.split('@')[0],
            email: found.email,
            photoURL: found.photoURL || '',
          };
        }
      }

      const taskRef = doc(db, 'lists', task.listId, 'tasks', task.id);
      await updateDoc(taskRef, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        category: editCategory,
        dueDate: editDueDate || null,
        assignedTo: newAssignedTo,
        updatedAt: Date.now(),
      });

      setIsEditing(false);
      toast('任務內容已更新', 'success');
    } catch (err: any) {
      toastError('更新失敗');
    } finally {
      setLoading(false);
    }
  };

  const priorityBadge = {
    high: { label: '高優先', bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
    medium: { label: '中優先', bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    low: { label: '低優先', bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  }[task.priority || 'medium'];

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-brand-500 rounded-2xl p-4 shadow-md space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full text-sm font-semibold px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          autoFocus
        />
        <input
          type="text"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="任務說明備註..."
          className="w-full text-xs px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
          >
            <option value="low">🟢 低優先</option>
            <option value="medium">🟡 中優先</option>
            <option value="high">🔴 高優先</option>
          </select>

          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
          />

          <select
            value={editAssigneeEmail}
            onChange={(e) => setEditAssigneeEmail(e.target.value)}
            className="px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
          >
            <option value="">指派成員 (無)</option>
            {members.map((m) => (
              <option key={m.email} value={m.email}>
                {m.displayName || m.email}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            placeholder="標籤類別"
            className="px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> 取消
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={loading}
            className="px-4 py-1 text-xs font-semibold bg-brand-600 text-white rounded-lg flex items-center gap-1 hover:bg-brand-700 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" /> {loading ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md ${
        task.completed
          ? 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
          : isOverdue
          ? 'border-rose-200 dark:border-rose-900/60 shadow-sm shadow-rose-500/5'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30'
          }`}
          title={task.completed ? '標記為未完成' : '標記為已完成'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold transition-all break-words ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.title}
            </span>

            {/* Badges */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${priorityBadge.bg}`}
            >
              {priorityBadge.label}
            </span>

            {task.category && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {task.category}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row: Due Date, Assignee, Completion info */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {/* Due date */}
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                {isOverdue ? `已逾期：${task.dueDate}` : `到期日：${task.dueDate}`}
              </span>
            )}

            {/* Assignee */}
            {task.assignedTo ? (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isAssignedToMe
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title={task.assignedTo.email}
              >
                {task.assignedTo.photoURL ? (
                  <img
                    src={task.assignedTo.photoURL}
                    alt={task.assignedTo.displayName}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {isAssignedToMe ? '指派給我' : task.assignedTo.displayName || task.assignedTo.email}
                </span>
              </span>
            ) : null}

            {/* Completed By Note */}
            {task.completed && task.completedBy && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                由 {task.completedBy.displayName} 完成
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="編輯任務"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="刪除任務"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
