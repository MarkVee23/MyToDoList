import React, { useState } from 'react';
import {
  CheckSquare2,
  KeyRound,
  HelpCircle,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Menu,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<Props> = ({ onToggleSidebar, isDarkMode, onToggleDarkMode }) => {
  const { user, loading, isConfigured, signInWithGoogle, signOut, setIsConfigModalOpen, setIsGuideModalOpen } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Hamburger (mobile) + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="選單"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <CheckSquare2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
                MyToDo<span className="text-brand-600 dark:text-brand-400">List</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                <Sparkles className="w-2.5 h-2.5" /> 即時協作
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Status Badge */}
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition ${
            isConfigured
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 animate-pulse'
          }`}
          title="Firebase 專案設定"
        >
          {isConfigured ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span>my-to-do-list-537e1</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span>點此設定 Firebase 金鑰</span>
            </>
          )}
        </button>

        {/* Config Modal Button */}
        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="設定 Firebase 金鑰"
        >
          <KeyRound className="w-4 h-4" />
        </button>

        {/* Guide Modal Button */}
        <button
          onClick={() => setIsGuideModalOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="使用與協作說明"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isDarkMode ? '切換淺色模式' : '切換深色模式'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Auth Button / Profile */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition bg-slate-50 dark:bg-slate-800"
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {user.displayName}
              </span>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || '使用者'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white dark:ring-slate-900"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    登出帳號
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-md shadow-brand-500/20 active:scale-95"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">Google 帳號登入</span>
            <span className="sm:hidden">登入</span>
          </button>
        )}
      </div>
    </header>
  );
};
