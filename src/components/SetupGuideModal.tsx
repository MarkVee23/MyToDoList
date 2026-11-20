import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Users, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfig: () => void;
}

export const SetupGuideModal: React.FC<Props> = ({ isOpen, onClose, onOpenConfig }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Firebase 專案啟用指南</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">專案 ID：my-to-do-list-537e1</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300">
          {/* Step 1: Google Auth */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-500" />
                  啟用 Google 登入 (Authentication)
                </h4>
                <a
                  href="https://console.firebase.google.com/project/my-to-do-list-537e1/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  前往後台 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                進入 Firebase 控制台 ➔ <strong>Authentication</strong> ➔ <strong>Sign-in method</strong> ➔ 點選 <strong>Google</strong> 並開啟「啟用」，設定專案支援電子郵件後儲存。
              </p>
            </div>
          </div>

          {/* Step 2: Firestore Database */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  啟用 Cloud Firestore 資料庫
                </h4>
                <a
                  href="https://console.firebase.google.com/project/my-to-do-list-537e1/firestore"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  前往 Firestore <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                進入 <strong>Firestore Database</strong> ➔ 點選「建立資料庫」➔ 選擇地區（例如 <code>asia-east1</code>）➔ 可先選測試模式或直接建立。本專案根目錄已附上安全性規則 <code>firestore.rules</code>。
              </p>
            </div>
          </div>

          {/* Step 3: Web App Config */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  填入 Firebase Web 設定
                </h4>
                <button
                  onClick={() => {
                    onClose();
                    onOpenConfig();
                  }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  開啟設定視窗 ➔
                </button>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                在「專案設定」➔「一般」下方點擊 <strong>新增應用程式 (&lt;/&gt; Web)</strong>，命名後即可獲得 <code>apiKey</code>、<code>appId</code> 等資訊，點擊右上方「金鑰圖示」直接填入即可。
              </p>
            </div>
          </div>

          {/* How collaboration works */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              多人協作功能特色：
            </h5>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li><strong>即時雲端同步</strong>：利用 Firestore Snapshot，任一成員增刪修任務，所有人畫面毫秒級同步。</li>
              <li><strong>Google 電子郵件邀請</strong>：直接輸入夥伴的 Google Email 即可賦予協作編輯權限。</li>
              <li><strong>一鍵專屬邀請連結</strong>：複製分享連結或 6 位數邀請碼，夥伴點擊登入即可立即加入。</li>
              <li><strong>任務指派與進度追蹤</strong>：可指派成員、設定截止日與優先級，完成時自動記錄完成者資訊。</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 rounded-xl transition"
          >
            我瞭解了
          </button>
        </div>
      </div>
    </div>
  );
};
