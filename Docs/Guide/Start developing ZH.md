---
title: 開始開發 Ledgerline
tags:
  - guide
---
# 開始開發 Ledgerline

本指南分三部分：

1. 手機設定（一次）
2. 在手機上測試分支（每次）
3. 電腦設定（一次）

相關的兩個 repo：

- **`ledgerline`**（公開）：外掛原始碼在 `plugin/`。repo 根目錄同時是一個示範儲存庫（假資料）。每個分支都包含編譯好的外掛，手機切換到哪個分支，就執行該分支的版本。
- **`ledgerline-folio`**（私人）：工作日誌，記錄進度、計畫和手機檢查清單。

分支規則：`main` 是正式版本。新功能用 `feat/<主題>`，修正用 `fix/<主題>`。在手機上確認後，用 pull request 合併到 `main`。

---

## 第一部分 · 手機設定

需要：Obsidian app、Wi-Fi，約 10 分鐘。

### 1. 建立空的儲存庫
1. 從 App Store 或 Google Play 安裝 **Obsidian**。
2. 點 **建立新儲存庫（Create new vault）**，名稱輸入 `ledgerline`。
3. iPhone：關閉 **儲存在 iCloud（Store in iCloud）**。iCloud 和 Git 同步同一批檔案會發生衝突。
4. 點 **建立（Create）**。

### 2. 安裝 Git 外掛
1. 開啟 **設定（Settings）**：側欄左下角的齒輪。從螢幕左緣向右滑可開啟側欄。
2. **第三方外掛（Community plugins）** → **開啟第三方外掛（Turn on community plugins）**。
3. **瀏覽（Browse）** → 搜尋 `Git` → 選作者為 Vinzent 的 **Git** → **安裝（Install）** → **啟用（Enable）**。
4. 關閉設定。

### 3. 複製（clone）示範儲存庫
開啟**指令面板（command palette）**：在筆記畫面往下滑，或點選單按鈕 → **開啟指令面板（Open command palette）**。依序操作：

| 步驟 | 畫面顯示 | 操作 |
| :--- | :--- | :--- |
| 1 | 指令清單 | 輸入 `clone`，選 **Git: Clone an existing remote repo** |
| 2 | Enter remote URL | 輸入 `https://github.com/zelvet-velvet/ledgerline.git`，按 Enter |
| 3 | Enter directory for clone… | 選 **Vault Root** |
| 4 | Does your remote repo contain a .obsidian directory at the root? | 選 **YES** |
| 5 | To avoid conflicts, the local .obsidian directory needs to be deleted. | 選 **DELETE ALL YOUR LOCAL CONFIG AND PLUGINS**。儲存庫是空的，repo 內已包含所需的設定和外掛（含 Git 外掛）。 |
| 6 | Specify depth of clone. Leave empty for full clone. | 不輸入，直接按 Enter。淺層複製無法切換分支。 |
| 7 | Cloned new repo、Please restart Obsidian | 等待完成，約 1–2 分鐘。 |

### 4. 重新啟動 Obsidian
1. 從多工畫面關閉 Obsidian。
2. 重新開啟。若出現信任外掛的提示，選 **信任作者並啟用外掛（Trust author and enable plugins）**。
3. 開啟後顯示 Ledgerline 示範資料，目前分支為 `main`。

### 5. Git 外掛設定
手機只拉取（pull），不提交。**設定 → Git**：

- **Auto commit-and-sync interval**：`0`
- **Auto pull interval**：`0`
- **Pull on startup**：開啟（選用）

> [!tip] Ledgerline 全螢幕時開啟設定
> 從螢幕左緣向右滑開啟側欄；或開啟指令面板，執行 **開啟設定（Open settings）**。

---

## 第二部分 · 測試分支

以分支 `feat/marquee` 為例：

1. 指令面板 → **Git: Fetch**（取得最新的分支清單）。
2. 指令面板 → **Git: Switch to remote branch** → 選 `origin/feat/marquee`。
3. 指令面板 → **重新載入 app，不儲存（Reload app without saving）**，或關閉後重新開啟 Obsidian。
4. 依該分支的檢查項目測試，結果記在 folio 的測試清單。

同一分支有新提交時：**Git: Pull** → 重新載入。

切回 `main`：**Git: Switch branch** → `main` → **Git: Pull** → 重新載入。

### 常見問題

| 狀況 | 處理方式 |
| :--- | :--- |
| 切換或拉取時出現 Your local changes would be overwritten | 執行 **Git: CAUTION: Discard all changes**，再重試。手機上的變更不需要保留。 |
| 分支清單中沒有該分支 | 先執行 **Git: Fetch**。 |
| 切換後畫面沒有改變 | 重新載入 app。仍未改變時：設定 → 第三方外掛 → 關閉再開啟 **Ledgerline**。 |
| Pull 或 Fetch 失敗 | 確認網路後重試。 |
| 其他無法解決的狀況 | 刪除 `ledgerline` 儲存庫，重做第一部分。所有內容都在 GitHub 上。 |

> [!warning] 不要在手機上執行 Commit-and-sync
> 提交只在電腦上的分支進行。

---

## 第三部分 · 電腦設定

### 1. 安裝與設定
1. 安裝 **Git**、**Node.js 22**、**Claude Code**。
2. 接受 `ledgerline` 和 `ledgerline-folio` 的 GitHub 邀請。
3. 在存放專案的資料夾開啟終端機，執行 `claude`，貼上以下指示：

> Set up Ledgerline development here. Clone https://github.com/zelvet-velvet/ledgerline and https://github.com/zelvet-velvet/ledgerline-folio next to each other. In `ledgerline-folio`, run `python3 Tools/setup/install_plugins.py` and `python3 Tools/setup/folio.py link` (it links the work-log commands into `../ledgerline`). In `ledgerline/plugin`, run `npm install`, then check that `npm run check`, `npm run test` and `npm run build` all pass. Tell me what to open in Obsidian. Chat with me in Traditional Chinese.

4. 在 Obsidian 用 **開啟資料夾作為儲存庫（Open folder as vault）** 分別開啟 `ledgerline` 和 `ledgerline-folio`，並在兩者開啟第三方外掛。

### 2. 開發流程
1. 在 `ledgerline` 資料夾執行 `claude`。
2. 說明要做的修改，例如：「開新分支 feat/csv-export，把 Log 的月份匯出成 CSV。」Claude 會建立分支、修改、檢查、編譯，並提交、推送原始碼和編譯結果。
3. 在手機上依第二部分測試。
4. 測試通過後，請 Claude 開 pull request，由維護者審查後合併到 `main`。
5. 結束前執行 **`/cmd-sync`**，把進度寫入 folio。

### 3. 檔案位置
| 內容 | 位置 |
| :--- | :--- |
| Agent 規則 | `ledgerline/AGENTS.md` |
| 設計規則 | `ledgerline/Docs/Design/Design Rules/` |
| 各頁面版面 | `ledgerline/Docs/Design/Screens/`（用 Vellum 外掛開啟） |
| 計畫、進度、手機檢查清單 | `ledgerline-folio` |
