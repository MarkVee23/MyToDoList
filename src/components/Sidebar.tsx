import React from 'react';
import {
  FolderPlus,
  UserPlus2,
  ListTodo,
  CheckCircle2,
  Crown,
  Users2,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { ToDoList } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  lists: ToDoList[];
  activeListId: string | null;
  onSelectList: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  taskCounts: Record<string, { total: number; pending: number }>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  lists,
  activeListId,
  onSelectList,
  onOpenCreateModal,
  onOpenJoinModal,
  taskCounts,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const ownedLists = lists.filter((l) => l.ownerId === user?.uid || l.ownerEmail === user?.email);
  const sharedLists = lists.filter((l) => l.ownerId !== user?.uid && l.ownerEmail !== user?.email);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-72 shrink-0">
      {/* Top Action Buttons */}
      <div className="p-4 space-y-2 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-brand-500/20 active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4" />
          建立新待辦清單
        </button>
        <button
          onClick={onOpenJoinModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-xs transition"
        >
          <UserPlus2 className="w-4 h-4 text-indigo-500" />
          輸入邀請碼加入
        </button>
      </div>

      {/* Lists Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Owned Lists Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3 h-3 text-amber-500" /> 我建立的清單 ({ownedLists.length})
            </span>
          </div>

          <div className="space-y-1">
            {ownedLists.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                尚未建立清單
              </div>
            ) : (
              ownedLists.map((l) => {
                const isActive = l.id === activeListId;
                const counts = taskCounts[l.id] || { total: 0, pending: 0 };
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectList(l.id);
                      onCloseMobile();
                    }}
                    className={`w-full group text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold ring-1 ring-brand-200 dark:ring-brand-800'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base shrink-0">{l.icon || '📋'}</span>
                      <span className="text-xs truncate">{l.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(l.members?.length > 1 || (l.memberDetails && l.memberDetails.length > 1)) && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                          <Users2 className="w-2.5 h-2.5" />
                          {l.memberDetails?.length || l.members?.length}
                        </span>
                      )}
                      {counts.pending > 0 && (
                        <span
                          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {counts.pending}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Shared Lists Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users2 className="w-3 h-3 text-indigo-500" /> 多人協作清單 ({sharedLists.length})
            </span>
          </div>

          <div className="space-y-1">
            {sharedLists.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                尚無參與其他人的協作清單
              </div>
            ) : (
              sharedLists.map((l) => {
                const isActive = l.id === activeListId;
                const counts = taskCounts[l.id] || { total: 0, pending: 0 };
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectList(l.id);
                      onCloseMobile();
                    }}
                    className={`w-full group text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold ring-1 ring-brand-200 dark:ring-brand-800'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base shrink-0">{l.icon || '📋'}</span>
                      <div className="truncate">
                        <span className="text-xs truncate block">{l.title}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          由 {l.ownerName || l.ownerEmail.split('@')[0]} 發起
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {counts.pending > 0 && (
                        <span
                          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {counts.pending}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-brand-500" />
          雲端即時同步
        </span>
        <span className="font-mono">v1.0</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">待辦清單分類</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
