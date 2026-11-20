import React, { useState } from 'react';
import {
  Share2,
  Trash2,
  MoreVertical,
  Edit2,
  Crown,
  Users2,
  Check,
  X
} from 'lucide-react';
import { ToDoList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Props {
  list: ToDoList;
  onOpenInvite: () => void;
  onListDeleted: () => void;
  onListUpdated: (updated: Partial<ToDoList>) => void;
}

export const TodoListHeader: React.FC<Props> = ({
  list,
  onOpenInvite,
  onListDeleted,
  onListUpdated,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [editDesc, setEditDesc] = useState(list.description || '');
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.uid === list.ownerId || user?.email === list.ownerEmail;

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toastError('清單名稱不能為空');
      return;
    }
    if (!db) return;

    try {
      const docRef = doc(db, 'lists', list.id);
      await updateDoc(docRef, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        updatedAt: Date.now(),
      });
      onListUpdated({ title: editTitle.trim(), description: editDesc.trim() });
      setIsEditing(false);
      success('已更新清單名稱與描述');
    } catch (err: any) {
      toastError('更新失敗');
    }
  };

  const handleDeleteList = async () => {
    if (!isOwner) {
      toastError('只有清單擁有者可以刪除此清單');
      return;
    }
    if (!window.confirm(`確定要刪除「${list.title}」待辦清單嗎？清單內所有任務也將被清除。`)) {
      return;
    }
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'lists', list.id));
      success(`已刪除清單「${list.title}」`);
      onListDeleted();
    } catch (err: any) {
      console.error('Delete list error:', err);
      toastError(err.message || '刪除失敗');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-3xl shrink-0 p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl select-none">
            {list.icon || '📋'}
          </div>

          {isEditing ? (
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-lg font-bold px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="清單備註描述..."
                className="w-full text-xs px-3 py-1 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-semibold bg-brand-600 text-white rounded-lg flex items-center gap-1 hover:bg-brand-700"
                >
                  <Check className="w-3.5 h-3.5" /> 儲存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> 取消
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                  {list.title}
                </h1>
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Crown className="w-3 h-3 text-amber-500" /> 我的清單
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <Users2 className="w-3 h-3 text-indigo-500" /> 協作成員
                  </span>
                )}
              </div>
              {list.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {list.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Members & Actions */}
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          {/* Collaborator Avatars */}
          <div
            onClick={onOpenInvite}
            className="flex items-center -space-x-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="點擊管理協作成員"
          >
            {(list.memberDetails || []).slice(0, 4).map((m, idx) => (
              <div
                key={m.email || idx}
                className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200"
                title={`${m.displayName || m.email} (${m.role === 'owner' ? '擁有者' : '協作者'})`}
              >
                {m.photoURL ? (
                  <img src={m.photoURL} alt={m.displayName || m.email} className="w-full h-full object-cover" />
                ) : (
                  <span>{m.displayName?.[0] || m.email?.[0] || 'U'}</span>
                )}
              </div>
            ))}
            {(list.memberDetails?.length || 0) > 4 && (
              <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center">
                +{(list.memberDetails?.length || 0) - 4}
              </div>
            )}
          </div>

          {/* Invite Button */}
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 rounded-xl transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>邀請協作</span>
          </button>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                      setEditTitle(list.title);
                      setEditDesc(list.description || '');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> 編輯名稱與描述
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDeleteList();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 刪除整個清單
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
