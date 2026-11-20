import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Flag,
  User,
  Tag,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Priority, ToDoList, ListMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  list: ToDoList;
}

const CATEGORIES = ['工作', '生活', '開發', '設計', '採買', '其他'];

export const TaskInput: React.FC<Props> = ({ list }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('工作');
  const [dueDate, setDueDate] = useState<string>('');
  const [assignedMemberEmail, setAssignedMemberEmail] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members: ListMember[] = list.memberDetails || [];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!user) {
      toastError('請先登入 Google 帳號');
      return;
    }
    if (!db) {
      toastError('Firebase 未連線');
      return;
    }

    try {
      setIsSubmitting(true);

      let assignedTo = null;
      if (assignedMemberEmail) {
        const found = members.find((m) => m.email === assignedMemberEmail);
        if (found) {
          assignedTo = {
            uid: found.uid || '',
            displayName: found.displayName || found.email.split('@')[0],
            email: found.email,
            photoURL: found.photoURL || '',
          };
        }
      }

      const taskData = {
        listId: list.id,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        completedBy: null,
        completedAt: null,
        priority,
        category: category || '其他',
        dueDate: dueDate || null,
        assignedTo,
        createdBy: {
          uid: user.uid,
          displayName: user.displayName || '使用者',
          email: user.email || '',
          photoURL: user.photoURL || '',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, 'lists', list.id, 'tasks'), taskData);

      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedMemberEmail('');
      setIsExpanded(false);
    } catch (err: any) {
      console.error('Failed to add task:', err);
      toastError(err.message || '新增任務失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:shadow-md focus-within:border-brand-500 overflow-hidden mb-6">
      <form onSubmit={handleAddTask} className="p-3 sm:p-4">
        {/* Main Input Row */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder="新增待辦任務... (按 Enter 送出)"
            className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="px-3.5 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl transition flex items-center gap-1 shrink-0 shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>新增</span>
          </button>
        </div>

        {/* Detailed Controls (Expanded) */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
            {/* Optional Description */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="補充備註或說明 (選填)..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            {/* Options Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Priority Selector */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="low">🟢 低優先</option>
                  <option value="medium">🟡 中優先</option>
                  <option value="high">🔴 高優先</option>
                </select>
              </div>

              {/* Due Date Picker */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-xs focus:outline-none cursor-pointer text-slate-600 dark:text-slate-300"
                />
              </div>

              {/* Assignee Selector */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={assignedMemberEmail}
                  onChange={(e) => setAssignedMemberEmail(e.target.value)}
                  className="bg-transparent text-xs focus:outline-none cursor-pointer"
                >
                  <option value="">指派成員 (未指定)</option>
                  {members.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.displayName || m.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent text-xs focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
              >
                收合
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
