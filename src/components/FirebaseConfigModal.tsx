import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, HelpCircle, Save, Check } from 'lucide-react';
import { currentConfig, saveFirebaseConfig, clearFirebaseConfig } from '../firebase';
import { FirebaseConfig } from '../types';
import { useToast } from '../context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { success, error: toastError } = useToast();
  const [snippet, setSnippet] = useState('');
  const [formData, setFormData] = useState<FirebaseConfig>({
    apiKey: currentConfig?.apiKey || '',
    authDomain: currentConfig?.authDomain || 'my-to-do-list-537e1.firebaseapp.com',
    projectId: currentConfig?.projectId || 'my-to-do-list-537e1',
    storageBucket: currentConfig?.storageBucket || 'my-to-do-list-537e1.appspot.com',
    messagingSenderId: currentConfig?.messagingSenderId || '',
    appId: currentConfig?.appId || '',
  });

  if (!isOpen) return null;

  const handleParseSnippet = () => {
    try {
      // Try to parse JS object or JSON from snippet
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) {
        setFormData((prev) => ({
          apiKey: apiKeyMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : prev.authDomain,
          projectId: projectIdMatch ? projectIdMatch[1] : prev.projectId,
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : prev.storageBucket,
          messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : prev.messagingSenderId,
          appId: appIdMatch ? appIdMatch[1] : prev.appId,
        }));
        success('成功解析 Firebase 設定！');
      } else {
        // Try standard JSON.parse
        const json = JSON.parse(snippet);
        if (json.apiKey) {
          setFormData({
            apiKey: json.apiKey,
            authDomain: json.authDomain || 'my-to-do-list-537e1.firebaseapp.com',
            projectId: json.projectId || 'my-to-do-list-537e1',
            storageBucket: json.storageBucket || 'my-to-do-list-537e1.appspot.com',
            messagingSenderId: json.messagingSenderId || '',
            appId: json.appId || '',
          });
          success('成功解析 Firebase 設定！');
        } else {
          toastError('無法解析代碼，請手動填入 apiKey 等欄位');
        }
      }
    } catch (e) {
      toastError('代碼解析失敗，請確認格式或直接填寫下方輸入框');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apiKey.trim()) {
      toastError('請填寫 Firebase API Key');
      return;
    }
    saveFirebaseConfig(formData);
    success('設定已儲存並重新載入！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Firebase 專案設定</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">專案：my-to-do-list-537e1</p>
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
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 text-amber-800 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold mb-1">如何取得 Firebase 設定：</p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-700 dark:text-amber-300">
                <li>前往 <a href="https://console.firebase.google.com/project/my-to-do-list-537e1/settings/general" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-1">Firebase Console 專案設定 <ExternalLink className="w-3 h-3" /></a></li>
                <li>在「您的應用程式」中選擇或新增 Web 應用程式 (<code>&lt;/&gt;</code>)</li>
                <li>複製 <code>firebaseConfig</code> 程式碼區塊貼在下方「快速貼上」欄位</li>
              </ol>
            </div>
          </div>

          {/* Quick Paste Snippet */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              快速貼上整段 firebaseConfig 物件 (自動解析)：
            </label>
            <div className="flex gap-2">
              <textarea
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                placeholder="const firebaseConfig = { apiKey: 'AIza...', ... };"
                rows={3}
                className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {snippet && (
              <button
                type="button"
                onClick={handleParseSnippet}
                className="px-3 py-1.5 text-xs bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> 解析並填入下方欄位
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={formData.authDomain}
                  onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  value={formData.storageBucket}
                  onChange={(e) => setFormData({ ...formData, storageBucket: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={formData.appId}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                  placeholder="1:123456789:web:abcdef..."
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              {currentConfig?.apiKey && (
                <button
                  type="button"
                  onClick={clearFirebaseConfig}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium hover:underline"
                >
                  清除已儲存設定
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-md shadow-brand-500/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> 儲存並連線
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
