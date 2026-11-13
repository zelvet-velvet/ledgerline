---
title: 開始開發 Ledgerline
tags:
  - guide
---
# 開始開發 Ledgerline

這份指南帶你從零開始，一路到在手機上測試自己的修改。**第一部分**設定手機（最容易卡關，所以每一下點擊都寫出來）；**第二部分**是每次試一個分支要做的事；**第三部分**設定電腦。

整體怎麼運作：

- **`ledgerline`**（公開）：外掛的程式碼在 `plugin/`，外面包著一個用假資料的示範儲存庫（vault）。每個分支都帶著自己編好的外掛，所以手機切到哪個分支，跑的就是那個分支的 app。
- **`ledgerline-folio`**（私人）：我們共用的工作日誌：做完了什麼、接下來做什麼、手機上要檢查什麼。
- **分支**：`main` 是大家看到的正式版本。新的工作放在 `feat/<主題>` 或 `fix/<主題>`，先在手機上試，再透過 pull request 合併。

---

## 第一部分 · 手機（只需做一次）

需要：Obsidian app，以及大約 10 分鐘的 Wi-Fi。

### 1. 建立一個空的儲存庫
1. 從 App Store（或 Google Play）安裝 **Obsidian** 並打開。
2. 點 **建立新儲存庫（Create new vault）**，名稱填 `ledgerline`。
3. iPhone：**關閉「儲存在 iCloud」（Store in iCloud）**。Git 和 iCloud 會同時同步同一批檔案而互相弄壞，儲存庫必須留在「我的 iPhone」裡。
4. 點 **建立（Create）**，進入一個空的儲存庫。

### 2. 安裝 Git 外掛
1. 打開 **設定（Settings）**：左側欄的齒輪（從螢幕左緣向右滑可打開側欄）。
2. **第三方外掛（Community plugins）** → **開啟第三方外掛（Turn on community plugins）**。
3. **瀏覽（Browse）** → 搜尋 **Git** → 選作者為 *Vinzent* 的 **Git** → **安裝（Install）** → **啟用（Enable）**。
4. 關閉設定。

### 3. 把示範儲存庫複製（clone）進來
打開**指令面板（command palette）**：在打開的筆記上往下滑，或點 **⋯ / 選單**按鈕選 *開啟指令面板（Open command palette）*。接著：

| 步驟 | 畫面上會看到 | 你要做的 |
| :--- | :--- | :--- |
| 1 | 指令清單 | 輸入 `clone`，點 **Git: Clone an existing remote repo** |
| 2 | *Enter remote URL* | 貼上 `https://github.com/zelvet-velvet/ledgerline.git`，按 Enter |
| 3 | *Enter directory for clone…* | 點 **Vault Root** |
| 4 | *Does your remote repo contain a .obsidian directory at the root?* | 點 **YES** |
| 5 | *To avoid conflicts, the local .obsidian directory needs to be deleted.* | 點 **DELETE ALL YOUR LOCAL CONFIG AND PLUGINS**。這是安全的：儲存庫是空的，而遠端會帶來自己的設定和外掛，連 Git 外掛也包含在內。 |
| 6 | *Specify depth of clone. Leave empty for full clone.* | **留空**，按 Enter。（淺層複製沒辦法切換分支。） |
| 7 | *Cloning new repo…*，接著 *Cloned new repo* 和 *Please restart Obsidian* | 等它完成。第一次複製約需一兩分鐘。 |

### 4. 重新啟動
1. 完全關閉 Obsidian：往上滑到多工畫面，把 Obsidian 滑掉。
2. 再次打開。如果它問是否信任這個儲存庫的外掛，點 **信任作者並啟用外掛（Trust author and enable plugins）**。
3. Ledgerline 會全螢幕打開，顯示 Alex 的假資料。你現在在 `main` 分支。

### 5. 讓 Git 外掛只拉取、不提交
手機只用來*看*分支，從不提交。在 **設定 → Git**：

- **Auto commit-and-sync interval**：`0`（關閉）。
- **Auto pull interval**：`0`（手動拉取，畫面才不會在你看的時候變動）。
- **Pull on startup**：開啟（選用：打開 app 時就是該分支的最新版本）。

> [!tip] Ledgerline 全螢幕時怎麼進設定
> 從螢幕左緣向右滑打開側欄，或打開指令面板（往下滑）執行 *開啟設定（Open settings）*。

---

## 第二部分 · 試一個分支（每次）

有人說「`feat/marquee` 可以在手機上試了」的時候：

1. 指令面板 → **Git: Fetch**。這會載入新的分支清單，畫面還不會變。
2. 指令面板 → **Git: Switch to remote branch** → 選 `origin/feat/marquee`。
3. 指令面板 → **重新載入 app，不儲存（Reload app without saving）**（或關掉再打開 Obsidian）。外掛現在跑的就是這個分支的版本。
4. 照這次修改要你檢查的項目檢查，然後回報（寫在 folio 的測試清單，或在聊天裡說）。

同一個分支之後又有新提交：**Git: Pull**，再 **重新載入 app**。

回到 `main`：**Git: Switch branch** → `main`，然後 **Git: Pull**，再重新載入。

### 出問題時

| 狀況 | 解法 |
| :--- | :--- |
| 切換或拉取時出現 *Your local changes would be overwritten* | 手機上有檔案被改到了（某個設定、某次點擊存了檔）。手機上沒有需要保留的東西：執行 **Git: CAUTION: Discard all changes**，再試一次。 |
| 清單裡找不到那個分支 | 先執行 **Git: Fetch**，再切換。 |
| 切換後畫面沒變 | 重新載入（步驟 3）。還是一樣：設定 → 第三方外掛 → 把 **Ledgerline** 關掉再打開。 |
| *Pull* 或 *Fetch* 失敗 | 檢查 Wi-Fi 後再試。一直失敗就看下一列。 |
| 卡住或怪怪的 | 從頭來過：在儲存庫切換器的設定裡刪除 `ledgerline` 儲存庫，再做一次第一部分。不會有任何損失，所有東西都在 GitHub 上。 |

> [!warning] 永遠不要在手機上按「Commit-and-sync」
> 手機只是用來看的。提交一律在電腦上、在分支上做。

---

## 第三部分 · 電腦（只需做一次）

### 交給 Claude 設定
安裝 **Git**、**Node.js 22** 和 **Claude Code**，接受 `ledgerline` 和 `ledgerline-folio` 的 GitHub 邀請。在你放專案的資料夾開一個終端機，啟動 `claude`，貼上：

> Set up Ledgerline development here. Clone https://github.com/zelvet-velvet/ledgerline and https://github.com/zelvet-velvet/ledgerline-folio next to each other. In `ledgerline-folio`, run `python3 Tools/setup/install_plugins.py` and `python3 Tools/setup/folio.py link` (it links the work-log commands into `../ledgerline`). In `ledgerline/plugin`, run `npm install`, then check that `npm run check`, `npm run test` and `npm run build` all pass. Tell me what to open in Obsidian. Chat with me in Traditional Chinese.

接著用 Obsidian **把兩個資料夾都當儲存庫打開**（*開啟資料夾作為儲存庫（Open folder as vault）*）：`ledgerline` 是示範 app 和 Vellum 畫面，`ledgerline-folio` 是工作日誌。兩邊都要開啟第三方外掛。

### 一次工作的流程
1. 在 `ledgerline` 開終端機，啟動 `claude`。它會讀 `AGENTS.md` 和 folio 的進度。
2. 說你要做什麼，例如：*「開新分支 feat/csv-export：把 Log 的月份匯出成 CSV。」* Claude 會建分支、改程式、跑檢查、編譯，把原始碼和編好的外掛一起提交並推送。
3. 在手機上：第二部分。
4. 沒問題後，請 Claude 開 pull request。維護者審查後合併進 `main`。
5. 結束前：**`/cmd-sync`** 把今天的進度寫進 folio（並提交），下一次工作（你的或別人的）就知道進行到哪裡。

### 東西放在哪裡
| 內容 | 位置 |
| :--- | :--- |
| 給 agent 的規則 | `ledgerline/AGENTS.md` |
| 頁面的外觀和行為 | `ledgerline/Docs/Design/Design Rules/` |
| 每一頁的版面 | `ledgerline/Docs/Design/Screens/`（用 Vellum 外掛打開） |
| 計畫、進度、手機檢查清單 | `ledgerline-folio` |
