# 校邊 Campus Nest

以地圖為核心的臺灣國立大學周邊租屋探索平台。使用者可以切換學校、查看步行範圍內的租屋資訊、使用快速條件篩選，並針對每筆租屋留下公開留言與 1–5 星評分。

> 目前房源為產品功能用的示範資料，不是即時租屋廣告；正式營運前應加入刊登驗證、檢舉與內容審核流程。

## 首批支援學校

- 國立臺灣大學、國立清華大學、國立陽明交通大學、國立成功大學
- 國立中央大學、國立中興大學、國立中正大學、國立中山大學
- 國立臺灣科技大學、國立臺北科技大學、國立宜蘭大學

## 已完成功能

- OpenStreetMap + Leaflet 互動地圖，不需要地圖 API 金鑰
- 11 所學校快速切換與校園／租屋圖標
- 租金、房型、坪數、步行時間、特色與評分資訊
- 套房、萬元以下、可開伙快速篩選
- 公開留言與 1–5 星評分，包含伺服器端輸入驗證
- 響應式桌面側欄與手機底部面板
- SQLite / Cloudflare D1 相容資料表、索引與 migrations
- Open Graph 品牌分享圖與中文無障礙標示

## 資料儲存策略

開發環境由 Wrangler/Miniflare 將 D1 以專案內的本機 SQLite 檔案儲存於 `.wrangler/`，不用另裝資料庫伺服器；此資料夾已排除於 Git。部署環境使用 Cloudflare D1，沿用相同 SQLite schema 與 query，不需要改寫後端。

資料表：

- `universities`：學校與校區座標
- `listings`：租屋資訊與地圖座標
- `reviews`：使用者暱稱、評分、留言與建立時間

常用查詢已有 `university_id` 與 `(listing_id, created_at)` 索引。資料表會在首次 API 請求時安全初始化並匯入示範資料；`drizzle/` 也保留可部署的 SQL migrations。

## 本機執行

需求：Node.js 22.13 以上。

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`。首次讀取房源時會自動建立本機 SQLite 資料。

## 品質檢查

```bash
npm test
npm run db:check
npm run lint
npm run build
npm audit
```

## 技術組合

Vinext / Next.js App Router、React、TypeScript、Leaflet、OpenStreetMap、Cloudflare D1、Drizzle ORM、Cloudflare Workers。
