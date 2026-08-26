# 校邊 Campus Nest

以地圖為核心的臺灣國立大學周邊租屋探索平台。使用者可以切換學校、查看步行範圍內的租屋資訊、使用快速條件篩選，並針對每筆租屋留下公開留言與 1–5 星評分。

> 目前房源為產品功能用的示範資料，不是即時租屋廣告；正式營運前應加入刊登驗證、檢舉與內容審核流程。

## 首批支援學校

- 國立臺灣大學、國立清華大學、國立陽明交通大學、國立成功大學
- 國立中央大學、國立中興大學、國立中正大學、國立中山大學
- 國立臺灣科技大學、國立臺北科技大學、國立宜蘭大學

## 已完成功能

- OpenStreetMap 資料 + Protomaps PMTiles + MapLibre GL JS，不需要地圖 API 金鑰
- 校園專用極簡底圖：保留道路、水域、綠地與建物輪廓，移除商家、景點、POI 與一般地名標籤
- 11 所學校快速切換與校園／租屋圖標
- 租金、房型、坪數、步行時間、特色與評分資訊
- 套房、萬元以下、可開伙快速篩選
- 公開留言與 1–5 星評分，包含伺服器端輸入驗證
- 響應式桌面側欄與手機底部面板
- SQLite / Cloudflare D1 相容資料表、索引與 migrations
- Open Graph 品牌分享圖與中文無障礙標示
- AdSense 響應式廣告版位、站點驗證 meta 與動態 `ads.txt`（未設定帳號時安全顯示預留版位）

## 地圖資料與商業使用

前端以 MapLibre GL JS 顯示 PMTiles 向量地圖，樣式只引用 `earth`、`landuse`、`water`、`buildings` 與 `roads` 圖層，刻意不載入 `places`、`pois` 或任何 `symbol` 標籤層。校名與租屋價格由本站自己的資料與 Marker 呈現，所以地圖不會被餐廳、商店、景點及次要地名淹沒。

預設 PMTiles 來源是 Protomaps 在 Source Cooperative 發布的公開 OSM Produced Work，適合本機開發與功能驗證。正式營運時請將臺灣範圍的 `.pmtiles` 放到自有 Cloudflare R2（搭配自訂網域與 CORS），並透過 `NEXT_PUBLIC_PMTILES_URL` 切換，避免長期熱連結公共資料站。畫面右下角會保留 OpenStreetMap contributors 與 Protomaps 的可見署名。

## AdSense 設定

複製 `.env.example` 為 `.env.local`，填入自己的 AdSense 資訊：

```dotenv
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_SLOT=1234567890
```

未填或格式不正確時，不會下載 Google 廣告程式，只顯示清楚標記、不遮擋內容的預留版位。設定完成後，全站會載入 AdSense、加入 `google-adsense-account` 驗證 meta，並在 `/ads.txt` 輸出對應 publisher 紀錄。AdSense 必須另外通過 Google 的站點審查；目前私有預覽站不適合送審，正式申請前需要公開可供 Google 檢索的網域與完整內容政策頁。

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

Vinext / Next.js App Router、React、TypeScript、MapLibre GL JS、PMTiles、OpenStreetMap、Cloudflare D1、Drizzle ORM、Cloudflare Workers。
