import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Copy,
  Check,
  Crown,
  Shield,
  Trash2,
  Mail,
  Share2,
  Link as LinkIcon
} from 'lucide-react';
import { ToDoList, ListMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  list: ToDoList;
  onListUpdated: (updated: Partial<ToDoList>) => void;
}

export const InviteModal: React.FC<Props> = ({ isOpen, onClose, list, onListUpdated }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isOwner = user?.uid === list.ownerId || user?.email === list.ownerEmail;
  const inviteLink = `${window.location.origin}${window.location.pathname}?join=${list.inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    success('已複製邀請連結至剪貼簿！');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(list.inviteCode);
    setCopiedCode(true);
    success('已複製邀請碼！');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return;

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toastError('請輸入有效的電子郵件地址');
      return;
    }

    if (list.members.includes(cleanEmail)) {
      toastError('該電子郵件已在協作成員名單中');
      return;
    }

    if (!db) {
      toastError('Firebase 未連線');
      return;
    }

    try {
      setSubmitting(true);
      const newMember: ListMember = {
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        role: 'editor',
        joinedAt: Date.now(),
      };

      const docRef = doc(db, 'lists', list.id);
      await updateDoc(docRef, {
        members: arrayUnion(cleanEmail),
        memberDetails: arrayUnion(newMember),
        updatedAt: Date.now(),
      });

      const updatedDetails = [...(list.memberDetails || []), newMember];
      const updatedMembers = [...list.members, cleanEmail];
      onListUpdated({ members: updatedMembers, memberDetails: updatedDetails });

      success(`成功邀請 ${cleanEmail} 加入協作！`);
      setEmailInput('');
    } catch (err: any) {
      console.error('Failed to invite member:', err);
      toastError(err.message || '邀請成員失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    if (!isOwner) {
      toastError('只有清單擁有者可移除成員');
      return;
    }
    if (memberEmail === list.ownerEmail) {
      toastError('無法移除清單擁有者');
      return;
    }
    if (!db) return;

    try {
      const updatedMembers = list.members.filter((m) => m !== memberEmail);
      const updatedDetails = (list.memberDetails || []).filter((m) => m.email !== memberEmail);

      const docRef = doc(db, 'lists', list.id);
      await updateDoc(docRef, {
        members: updatedMembers,
        memberDetails: updatedDetails,
        updatedAt: Date.now(),
      });

      onListUpdated({ members: updatedMembers, memberDetails: updatedDetails });
      success(`已將 ${memberEmail} 從協作成員中移除`);
    } catch (err: any) {
      toastError('移除成員失敗');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                邀請協作者・{list.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                邀請夥伴一同實時編輯與完成待辦清單
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Share Link & Code */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-brand-500" /> 專屬邀請連結
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? '已複製' : '複製連結'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                或直接使用邀請碼：<strong className="font-mono text-slate-800 dark:text-slate-200 text-sm tracking-wider">{list.inviteCode}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? '已複製代碼' : '複製代碼'}
              </button>
            </div>
          </div>

          {/* Direct Email Invite Form */}
          <form onSubmit={handleAddEmail} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-500" /> 以 Google 帳號 Email 直接邀請
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="colleague@gmail.com"
                className="w-full px-3.5 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={submitting || !emailInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                加入
              </button>
            </div>
          </form>

          {/* Members List */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              目前協作成員 ({(list.memberDetails || []).length || list.members?.length || 1} 人)
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {(list.memberDetails || []).map((m, idx) => {
                const memberIsOwner = m.role === 'owner' || m.email === list.ownerEmail;
                return (
                  <div
                    key={m.email || idx}
                    className="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {m.photoURL ? (
                        <img
                          src={m.photoURL}
                          alt={m.displayName || m.email}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                          {m.displayName?.[0] || m.email?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {m.displayName || m.email.split('@')[0]}
                          </span>
                          {memberIsOwner ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <Crown className="w-3 h-3 text-amber-500" /> 擁有者
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <Shield className="w-3 h-3 text-slate-400" /> 協作者
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{m.email}</p>
                      </div>
                    </div>

                    {isOwner && !memberIsOwner && (
                      <button
                        onClick={() => handleRemoveMember(m.email)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="移除此成員"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
