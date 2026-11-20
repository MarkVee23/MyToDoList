import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { ToDoList, Task } from './types';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TodoListHeader } from './components/TodoListHeader';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { CreateListModal } from './components/CreateListModal';
import { JoinListModal } from './components/JoinListModal';
import { InviteModal } from './components/InviteModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import {
  CheckSquare2,
  Users2,
  Sparkles,
  Zap,
  ShieldCheck,
  FolderPlus,
  LogIn,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    user,
    loading: authLoading,
    isConfigured,
    signInWithGoogle,
    isConfigModalOpen,
    setIsConfigModalOpen,
    isGuideModalOpen,
    setIsGuideModalOpen,
  } = useAuth();

  const { success, error: toastError, info } = useToast();

  const [lists, setLists] = useState<ToDoList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; pending: number }>>({});
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle URL invite code: ?join=CODE or ?invite=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join') || params.get('invite');
    const firestore = db;

    if (joinCode && user && firestore) {
      const autoJoin = async () => {
        try {
          const q = query(collection(firestore, 'lists'), where('inviteCode', '==', joinCode.toUpperCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const listDoc = snap.docs[0];
            const data = listDoc.data();
            const userEmail = user.email || '';

            if (!data.members?.includes(userEmail) && !data.members?.includes(user.uid)) {
              await updateDoc(doc(firestore, 'lists', listDoc.id), {
                members: arrayUnion(userEmail, user.uid),
                memberDetails: arrayUnion({
                  uid: user.uid,
                  email: userEmail,
                  displayName: user.displayName || '協作成員',
                  photoURL: user.photoURL || '',
                  role: 'editor',
                  joinedAt: Date.now(),
                }),
                updatedAt: Date.now(),
              });
              success(`已成功透過邀請加入「${data.title}」！`);
            }
            setActiveListId(listDoc.id);
            // Clean URL query
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('Auto join failed:', err);
        }
      };
      autoJoin();
    }
  }, [user]);

  // Subscribe to User's Lists (both owned & shared)
  useEffect(() => {
    const firestore = db;
    if (!user || !firestore || !isConfigured) {
      setLists([]);
      setActiveListId(null);
      return;
    }

    const userEmail = user.email || '';

    // Listen to lists where user is in members array
    const q = query(
      collection(firestore, 'lists'),
      where('members', 'array-contains-any', [userEmail, user.uid].filter(Boolean))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLists: ToDoList[] = [];
        snapshot.forEach((docSnap) => {
          fetchedLists.push({ id: docSnap.id, ...docSnap.data() } as ToDoList);
        });

        // Sort: newest updated first
        fetchedLists.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setLists(fetchedLists);

        // Auto select active list if not set or invalid
        setActiveListId((current) => {
          if (current && fetchedLists.some((l) => l.id === current)) {
            return current;
          }
          return fetchedLists.length > 0 ? fetchedLists[0].id : null;
        });
      },
      (err) => {
        console.error('Error listening to lists:', err);
      }
    );

    return () => unsubscribe();
  }, [user, isConfigured]);

  // Subscribe to Tasks of Active List
  useEffect(() => {
    const firestore = db;
    if (!activeListId || !firestore || !isConfigured) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(firestore, 'lists', activeListId, 'tasks');
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const fetchedTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          fetchedTasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
        });
        setTasks(fetchedTasks);

        // Update counts
        const total = fetchedTasks.length;
        const pending = fetchedTasks.filter((t) => !t.completed).length;
        setTaskCounts((prev) => ({
          ...prev,
          [activeListId]: { total, pending },
        }));
      },
      (err) => {
        console.error('Error listening to tasks:', err);
      }
    );

    return () => unsubscribe();
  }, [activeListId, isConfigured]);

  const activeList = lists.find((l) => l.id === activeListId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Body */}
      {authLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">載入雲端待辦清單中...</p>
          </div>
        </div>
      ) : !user ? (
        /* Landing / Unauthenticated View */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Firebase 雲端多人即時協作</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            與夥伴即時同步的
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}多人協作待辦清單
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
            透過 Google 帳號一鍵登入，建立專屬待辦清單或透過專屬邀請碼加入團隊。任務變更、完成勾選毫秒級全端即時同步！
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-12">
            <button
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>使用 Google 帳號立即開始</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isConfigured && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                設定 Firebase 金鑰
              </button>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">毫秒級即時同步</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                利用 Cloud Firestore 監聽技術，夥伴新增、標記完成或指派成員，所有人瀏覽器畫面立即同步。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">直覺邀請與協作</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                支援輸入 Google Email 直接指派與邀請，或複製專屬 6 碼邀請碼，團隊成員一鍵立即加入。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Firebase 雲端託管</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                預先對接專案 <code>my-to-do-list-537e1</code>，提供完備的資料庫安全規則與 Google Auth 認證保護。
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Collaborative Workspace */
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            lists={lists}
            activeListId={activeListId}
            onSelectList={setActiveListId}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
            taskCounts={taskCounts}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            {activeList ? (
              <>
                <TodoListHeader
                  list={activeList}
                  onOpenInvite={() => setIsInviteModalOpen(true)}
                  onListDeleted={() => {
                    const remaining = lists.filter((l) => l.id !== activeList.id);
                    setActiveListId(remaining.length > 0 ? remaining[0].id : null);
                  }}
                  onListUpdated={(updated) => {
                    setLists((prev) =>
                      prev.map((l) => (l.id === activeList.id ? { ...l, ...updated } : l))
                    );
                  }}
                />

                <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto flex-1">
                  {/* Task Input Box */}
                  <TaskInput list={activeList} />

                  {/* Task List (Filters, Search, Items) */}
                  <TaskList list={activeList} tasks={tasks} />
                </div>
              </>
            ) : (
              /* No Lists Selected / Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  開始您的第一份協作待辦清單
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  建立個人或專案清單，邀請朋友或同事一同加入，隨時隨地實時同步任務進度！
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition"
                  >
                    + 建立新清單
                  </button>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="flex-1 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition"
                  >
                    輸入邀請碼加入
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Modals */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={(newId) => setActiveListId(newId)}
      />

      <JoinListModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoined={(joinedId) => setActiveListId(joinedId)}
      />

      {activeList && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          list={activeList}
          onListUpdated={(updated) => {
            setLists((prev) =>
              prev.map((l) => (l.id === activeList.id ? { ...l, ...updated } : l))
            );
          }}
        />
      )}

      <FirebaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <SetupGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />
    </div>
  );
};

export default App;
