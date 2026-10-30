# NBA Tactics Lab
繁體中文籃球教學工作台。所有戰術均為示意動畫，非特定 NBA 比賽重建，球隊分析為風格示例。

## 啟動
Node.js 22+。
```sh
npm install
npm run dev
npm run build
npm run test
npx playwright install chromium
npm run test:e2e
```
也支援 pnpm，已提供 pnpm-lock.yaml。此開發環境未提供 npm 指令，因此實際安裝使用 pnpm，建置與測試透過對應 Node CLI 執行。

## 功能與架構
React + TypeScript + Vite + Tailwind CSS + Zustand + Motion + Lucide。SVG 使用 NBA 50 × 47 / 94 英尺球場座標。單一 requestAnimationFrame 時間源，純函式 sample() 處理插值、Seek、持球轉移。場上五攻五守，支援半全場、方向、縮放與標記開關。

- `src/engine.ts`：可擴充型別、動畫插值與匯入驗證。
- `src/tactics.json`：12 套進攻、10 套防守教學動畫。`src/data.ts` 提供六隊風格資料。
- `src/store.ts`：Zustand 播放狀態。
- `src/App.tsx`：播放器、步驟、比較與本機編輯器。
- `tests/`：Vitest 與 Playwright。

新增戰術：使用 Tactic 型別，十名唯一球員、遞增 keyframes（從 0 至 duration）、每畫格所有球員座標及 ballHandler、對應 steps。先通過 validate()。可直接匯出既有 JSON 作為格式範本，再透過介面匯入。持球者改變時視為傳球；ballPosition 可定義投籃終點。

自訂戰術儲存於 localStorage 的 nba-tactics，僅限同一瀏覽器。支援拖曳、動作、步驟增刪上移、預覽、複製、刪除、JSON 匯出入與 Undo/Redo。

## GitHub Pages
將此資料夾作為獨立 repository 根目錄推送到 main。在 Settings → Pages 選擇 GitHub Actions，工作流程會安裝、測試、建置並部署。Vite `base: './'` 支援 GitHub Pages 子路徑。尚未建立遠端 repository 或實際部署。

## 實作範圍與限制
MVP 動畫、控制、步驟同步已實作。其他進攻與防守都有可播放資料，但部分為基礎教學示意：防守尚未建立完整反應規則，各套戰術已有獨立優缺點及破解說明，仍需教練專業審閱。Horns 提供三分支；Pick and Roll 支援 Roll、Pop、Reject、Slip、後衛終結與外線分球。分支均為教學示意，未做完整攻防決策樹。球員使用 PG/SG/SF/PF/C，沒有實際球員名單。尚未完成曲線路線節點編輯與複雜掩護碰撞。比較使用相同絕對秒數同步。

測試覆蓋 Chromium 主要流程與手機尺寸；iPhone Safari / Android Chrome 實機未驗證。此版本不應聲稱十個 Phase 全部完成。
