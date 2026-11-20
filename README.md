# MyToDoList - 多人即時協作待辦清單應用程式

這是一個支援 **Google 登入** 與 **多人即時協作** 的現代化待辦清單 (To-Do List) 網頁應用程式，專門對接 Firebase 專案 `my-to-do-list-537e1`。

---

## 🛠️ 技術堆疊 (Tech Stack)

- **前端框架**：React 19 + TypeScript + Vite
- **樣式設計**：Tailwind CSS + Lucide Icons (支援深色 / 淺色模式)
- **後端與資料庫**：
  - **Firebase Authentication**：Google 帳號 OAuth 登入
  - **Cloud Firestore**：即時資料同步 (`onSnapshot` 雙向即時監聽)
- **視覺互動**：Canvas Confetti 完成紙花彩帶特效
- **安全防護**：Firestore 安全性規則 (`firestore.rules`)

---

## 🌟 核心特色

1. **Google 帳號一鍵登入**：
   - 整合 Firebase Authentication，支援 Google 帳號無縫登入，自動載入頭像與名稱。
2. **多人即時雲端同步**：
   - 使用 Cloud Firestore 實時監聽 (Snapshot Listener)，成員增刪修任務或勾選完成，所有協作者螢幕毫秒級同步。
3. **靈活的協作分享機制**：
   - **Google Email 邀請**：直接輸入夥伴 Email 賦予編輯權限。
   - **專屬邀請連結與 6 碼代碼**：一鍵複製連結或輸入代碼立即加入協作。
4. **豐富的任務管理功能**：
   - 任務優先級標記（高 🔴、中 🟡、低 🟢）。
   - 截止日期（到期與逾期警示）。
   - 任務指派給指定成員。
   - 任務完成慶祝彩帶特效 (Confetti) 與完成者歷史記錄。
   - 支援搜尋、分類篩選、狀態切換（全部 / 進行中 / 已完成）與智慧排序。
5. **多清單分類與主題自訂**：
   - 建立多個清單（工作、個人、採買、專案等），自訂圖示 Emoji 與漸層主題色彩。
6. **支援深色 / 淺色模式切換**。

---

## 🚀 快速開始

### 1. 安裝相依套件

```bash
cd /Users/markhsu/.gemini/antigravity/scratch/MyToDoList
npm install
```

### 2. 啟動本機開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 `http://localhost:5173` 即可檢視應用程式！

---

## ⚙️ Firebase 專案設定 (`my-to-do-list-537e1`)

本專案已預設指向 `my-to-do-list-537e1`。若尚未填入 Web API Key，可在網頁右上角點擊金鑰圖示直接在彈出視窗填入，或設定 `.env.local`：

### 步驟說明：

1. **前往 Firebase Console**：
   - 前往 [Firebase Console (my-to-do-list-537e1)](https://console.firebase.google.com/project/my-to-do-list-537e1/overview)。

2. **啟用 Google 登入提供者**：
   - 進入 **Authentication** ➔ **Sign-in method** ➔ 點選 **Google** 並開啟「啟用」➔ 選擇支援電子郵件後點選儲存。

3. **啟用 Cloud Firestore 資料庫**：
   - 進入 **Firestore Database** ➔ 建立資料庫（地區建議選擇 `asia-east1` 台灣或最近地區）。
   - 切換至 **Rules** 頁籤，將本專案目錄下的 `firestore.rules` 內容貼入並發布。

4. **取得 Web 應用程式設定**：
   - 前往 **專案設定** ➔ **一般** ➔ 下方「您的應用程式」中點選 **新增應用程式 (Web `</>`)**。
   - 複製其中的 `apiKey`、`appId` 等，填入 `.env.local` 或在網頁 UI 彈出的設定視窗中貼上：

```env
VITE_FIREBASE_API_KEY=你的_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=my-to-do-list-537e1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-to-do-list-537e1
VITE_FIREBASE_STORAGE_BUCKET=my-to-do-list-537e1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=你的_APP_ID
```

---

## 🔒 Firestore 安全性規則 (`firestore.rules`)

專案內已包含完整的安全性規則，確保只有清單擁有人及授權成員可存取與修改對應的待辦事項。
