# Phase 進度與驗證

| Phase | 已實作 | 驗證 / 尚待補齊 |
| --- | --- | --- |
| 1 | React/Vite/TS/Tailwind、深色三欄、SVG 球場與十人 | TypeScript、正式建置、桌面手機截圖通過 |
| 2 | 獨立 sample 引擎、共用時間源、線性與 ease-in-out、持球與傳球 | 插值、Seek、球權、資料驗證單元測試 |
| 3 | 播放暫停、步驟跳轉、重設、五種速度與時間軸 | Playwright 主要流程通過 |
| 4 | 12 種進攻實際動畫，PNR 六種選擇、Horns 三分支 | 資料與分支驗證；動畫為教學示意，尚需戰術專業審閱 |
| 5 | 10 種防守陣形與隨球輪轉 | 每套基本動畫可播放；尚非通用防守規則引擎 |
| 6 | 六隊風格、進攻、防守與代表動畫入口 | 已實作；無真實球員陣容與賽事重建 |
| 7 | 拖曳位置、六種動作、步驟增刪與上移、儲存複製刪除、JSON、Undo/Redo | 儲存與錯誤匯入測試；尚無任意曲線路徑節點編輯 |
| 8 | 雙球場、相同秒數同步、各自播放、重播、事件比較 | 雙球場操作通過；比較說明可再深化 |
| 9 | 響應式桌面、平板、手機與 reduced-motion 入場效果 | 390px 無橫向溢出；Safari / Android 實機尚未測試 |
| 10 | Vitest、Playwright、GitHub Pages Actions、README | 本機建置測試完成；GitHub 雲端測試與建置通過，已部署至 GitHub Pages |

環境沒有 npm，使用 pnpm 安裝與對應 Node CLI 驗證。Playwright 在 Windows 使用已安裝的 Chrome；CI 使用 Playwright Chromium。

