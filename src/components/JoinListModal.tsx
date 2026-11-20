import React, { useState } from 'react';
import { X, UserPlus2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (listId: string) => void;
}

export const JoinListModal: React.FC<Props> = ({ isOpen, onClose, onJoined }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toastError('請先登入 Google 帳號');
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toastError('請輸入邀請碼');
      return;
    }
    if (!db) {
      toastError('Firebase 未連線');
      return;
    }

    try {
      setLoading(true);
      // Query by inviteCode
      const q = query(collection(db, 'lists'), where('inviteCode', '==', cleanCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        toastError('找不到符合該邀請碼的待辦清單，請確認代碼是否正確');
        return;
      }

      const listDoc = snap.docs[0];
      const listData = listDoc.data();
      const userEmail = user.email || '';

      // Check if user is already a member
      if (listData.members?.includes(userEmail) || listData.members?.includes(user.uid)) {
        success(`您已經是「${listData.title}」的成員！`);
        onJoined(listDoc.id);
        onClose();
        return;
      }

      // Add to members & memberDetails
      const newMemberDetail = {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || '協作成員',
        photoURL: user.photoURL || '',
        role: 'editor',
        joinedAt: Date.now(),
      };

      const docRef = doc(db, 'lists', listDoc.id);
      await updateDoc(docRef, {
        members: arrayUnion(userEmail, user.uid),
        memberDetails: arrayUnion(newMemberDetail),
        updatedAt: Date.now(),
      });

      success(`成功加入協作清單「${listData.title}」！`);
      onJoined(listDoc.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to join list:', err);
      toastError(err.message || '加入清單失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <UserPlus2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">加入協作清單</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              輸入 6 位數邀請碼
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例如：A9BC4D"
              className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-widest uppercase border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              請向待辦清單的發起人索取 6 位數專屬邀請碼或分享連結。
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              {loading ? '查詢中...' : '立即加入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
