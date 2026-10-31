# NBA Tactics Lab

繁體中文籃球戰術工作台：[線上網站](https://jimmy980821-ops.github.io/nba-tactics-lab/) · [GitHub](https://github.com/jimmy980821-ops/nba-tactics-lab)。所有戰術為教學模擬，非特定 NBA 比賽重建。

## 本次品質升級

Pick and Roll 以新版 Scene 引擎重新手工編排：十名球員、多段曲線、加減速、掩護停頓與轉向、獨立傳球／接球／投籃事件。Drop、Switch、Hedge、Blitz 實際改變防守軌跡；Roll、Pop、Reject、Slip、持球攻框、弱側分球形成 24 種組合。

球場可切換深色／木地板、半場／全場、方向與斜角；球衣與肢體標記呈現朝向、運球、掩護與接球狀態。逐步出現的曲線路線、虛線傳球、掩護符號、進攻空間與防守覆蓋區都由同一時間取樣。

播放器支援任意 Seek、1/60 秒逐格、依真正步驟起點跳轉、自訂 0.1–4×、循環、重播、跟隨持球者與關鍵節點聚焦。左右面板可收合；保留 22 套戰術庫、六隊風格、比較、localStorage 編輯與 JSON 匯出入。

[重構前稽核](docs/REFACTOR-AUDIT.md) · [實作與驗證報告](docs/REFACTOR-REPORT.md)。

## 安裝與執行

Node.js 22+，建議 pnpm 11（已提供 lockfile）。

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
pnpm run test
pnpm exec playwright install chromium
pnpm run test:e2e
```

亦可使用 npm install / npm run dev / npm run build / npm run test。Windows 的 Playwright 設定使用已安裝 Chrome；Linux CI 使用 Playwright Chromium。此開發環境沒有 npm executable，本機以 Node CLI 執行對應建置與測試，GitHub CI 以 pnpm scripts 再驗證。

## 架構與新增戰術

- `src/engine.ts`：Tactic / Player / Keyframe 型別、舊畫格取樣、匯入驗證及 Scene 分派。
- `src/animation/types.ts`：Track、BallEvent、Annotation、Zone、TacticalAnalysis。
- `src/animation/geometry.ts`：Catmull–Rom 多段曲線、弧長取樣與 easing。
- `src/animation/sampleScene.ts`：從絕對時間推導所有球員、球權、朝向、姿態與可見事件。
- `src/animation/usePlaybackClock.ts`：單一 RAF 驅動主球場與比較球場；暫停時停止排程。
- `src/tactics/pickAndRoll.ts`：四防守 × 六結果的示範劇本與逐人任務。
- `src/components/Court.tsx`：SVG 球場、球員、鏡頭、互動逆座標與視覺疊圖。
- `src/components/Timeline.tsx`：時間軸、章節、逐格與播放控制。
- `src/components/ScenarioPanel.tsx`：攻防選擇與教練筆記。
- `src/tactics.json`：原 22 套基礎畫格資料，保留舊格式相容性。

新增簡單戰術可參照既有 JSON：十名唯一球員、時間遞增且完整的畫格、有效球權與步驟。進階劇本在 Tactic 中加入 `scene.version: 2`，定義每人連續 Track、獨立 BallEvent、區域、標註與分析。所有座標皆為英尺：x=0–50、y=0–94；半場呈現 y=0–47，不因顯示尺寸改變資料。所有匯入須通過 validate()。

進階劇本匯出的是目前攻防選擇的固定 Scene，匯入後仍能播放。複製進編輯器時轉成取樣畫格，保留既有拖曳與動作工具；目前不是完整曲線／事件編輯器。資料僅存於同一瀏覽器 localStorage 的 `nba-tactics`。

## 測試

18 項 Vitest：舊資料相容、插值、球權、路徑連續、曲線、掩護停頓、不同防守、傳接球時機、循環與不合法 Scene。24 種示範組合均以 60Hz 掃描十人間距，門檻為中心距離 1.7 英尺。

10 項 Playwright：播放、Seek、切換、雙球場、儲存、錯誤匯入、Undo/Redo、拖曳、逐格、循環、自訂速度、攻防變化、面板、鏡頭、手機／平板寬度及變換後逆座標。`tests/*.png` 是本機 QA 截圖，不加入 Git。

## GitHub Pages

`.github/workflows/deploy.yml` 在 main push 後執行單元測試、Chromium 互動測試、TypeScript 與正式建置，成功才部署。Vite base 設為 `./` 支援專案子路徑。React UI、Motion、戰術資料拆成獨立 chunk，沒有藉提高警告門檻隱藏大型包。

## 限制

- PnR 是本次完整編排示範；其他 21 套資料仍為基礎教學示意，已共用新版球場與球員呈現，但未逐套重編曲線與防守決策。
- 防守為預先編排的教學方案，沒有通用 AI 決策或即時碰撞物理。間距檢查針對示範軌跡，不涵蓋任意使用者自訂資料。
- 球員為 2D 向量球衣與肢體，斜角為 2D 投影；沒有 3D 模型、真實球員動作捕捉或 NBA 2K 遊戲素材。
- Safari / iPhone / Android 實機及輔助閱讀器尚未驗證；目前自動化使用桌面 Chromium 與響應式尺寸。

## Logo

`public/brand/logo.svg` 方形標誌、`logo-mark.svg` 透明金色圖案、`logo-horizontal.svg` 橫式字標；`public/favicon.svg` 為分頁圖示。圖案沿用 Lucide Waypoints，ISC 授權見 `public/brand/LICENSE.txt`。
