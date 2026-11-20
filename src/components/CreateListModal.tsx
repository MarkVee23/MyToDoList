import React, { useState } from 'react';
import { X, Plus, FolderPlus, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (listId: string) => void;
}

const EMOJI_OPTIONS = ['📋', '🚀', '💼', '🛒', '🎯', '💡', '🏠', '💻', '🎨', '🔥', '📚', '🌟'];
const COLOR_OPTIONS = [
  { name: '天空藍', value: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500' },
  { name: '活力紫', value: 'from-purple-500 to-pink-600', ring: 'ring-purple-500' },
  { name: '翡翠綠', value: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500' },
  { name: '夕陽橙', value: 'from-orange-500 to-rose-600', ring: 'ring-orange-500' },
  { name: '石墨灰', value: 'from-slate-600 to-zinc-800', ring: 'ring-slate-500' },
];

export const CreateListModal: React.FC<Props> = ({ isOpen, onClose, onListCreated }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toastError('請先登入 Google 帳號');
      return;
    }
    if (!title.trim()) {
      toastError('請輸入清單名稱');
      return;
    }
    if (!db) {
      toastError('Firebase 未正確連接');
      return;
    }

    try {
      setSubmitting(true);
      // Generate 6-char random invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const userEmail = user.email || '';
      const listData = {
        title: title.trim(),
        description: description.trim(),
        icon,
        color,
        ownerId: user.uid,
        ownerEmail: userEmail,
        ownerName: user.displayName || '擁有者',
        members: [userEmail, user.uid], // Include both email & uid for flexible queries
        memberDetails: [
          {
            uid: user.uid,
            email: userEmail,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'owner',
            joinedAt: Date.now(),
          },
        ],
        inviteCode,
        isPublic: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'lists'), listData);
      success(`成功建立待辦清單「${title}」！`);
      setTitle('');
      setDescription('');
      onListCreated(docRef.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to create list:', err);
      toastError(err.message || '建立清單失敗，請檢查 Firestore 權限');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">建立新的待辦清單</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Emoji Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              清單圖示
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition ${
                    icon === em
                      ? 'bg-brand-100 dark:bg-brand-900/60 ring-2 ring-brand-500 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* List Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              清單名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：團隊專案開發、採買清單..."
              className="w-full px-3.5 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>

          {/* List Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              描述備註 (選填)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="簡短描述這份待辦清單的目標或規則"
              className="w-full px-3.5 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Theme Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> 主題漸層色彩
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${c.value} transition ${
                    color === c.value ? `ring-2 ring-offset-2 dark:ring-offset-slate-900 ${c.ring} scale-110` : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-brand-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {submitting ? '建立中...' : '建立待辦清單'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
