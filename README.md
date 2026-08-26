# 校邊 Campus Nest

以地圖為核心的臺灣國立大學周邊租屋探索平台。使用者可以切換學校、查看步行範圍內的租屋資訊、使用快速條件篩選，並針對每筆租屋留下公開留言與 1–5 星評分。網站不預載任何範例房源，所有房源都由 Google 登入會員自行刊登。

## 首批支援學校

- 國立臺灣大學、國立清華大學、國立陽明交通大學、國立成功大學
- 國立中央大學、國立中興大學、國立中正大學、國立中山大學
- 國立臺灣科技大學、國立臺北科技大學、國立宜蘭大學

## 已完成功能

- OpenStreetMap 資料 + Protomaps PMTiles + MapLibre GL JS，不需要地圖 API 金鑰
- 校園專用極簡底圖：保留道路、水域、綠地與建物輪廓，移除商家、景點、POI 與一般地名標籤
- 11 所學校快速切換與校園／租屋圖標
- Google OpenID Connect 登入、HttpOnly 工作階段與登出
- 登入會員可在地圖選點並刊登地址、租金、房型、坪數、特色及聯絡方式
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
- `users`：Google 帳號的公開基本資料，以 Google `sub` 作唯一識別
- `auth_sessions`：雜湊後的登入工作階段與到期時間
- `listings`：會員所有權、租屋資訊、聯絡方式與地圖座標
- `reviews`：使用者暱稱、評分、留言與建立時間

常用查詢已有 `(university_id, status)`、`(owner_user_id, created_at)`、`(listing_id, created_at)` 與 `(user_id, expires_at)` 索引。資料表會在首次 API 請求時安全初始化，只匯入學校清單，不會匯入房源或留言；`drizzle/` 保留可部署的 SQL migrations。

## Google 登入設定

在 Google Cloud Console 建立「Web application」OAuth 2.0 Client，加入以下 Authorized redirect URI：

```text
http://localhost:3000/api/auth/google/callback
https://xiaobian-campus-nest.sjehd363960.chatgpt.site/api/auth/google/callback
```

接著複製 `.env.example` 為 `.env.local`，填入：

```dotenv
GOOGLE_CLIENT_ID=你的-client-id
GOOGLE_CLIENT_SECRET=你的-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

正式部署時必須將三個值設成平台的伺服器端環境變數，並把 `GOOGLE_REDIRECT_URI` 換成正式網址。Client Secret 不可使用 `NEXT_PUBLIC_` 前綴，也不可提交到 Git。未設定金鑰時網站仍可瀏覽，但登入與刊登按鈕會清楚顯示尚未啟用。

登入流程使用 OAuth `state`、PKCE、Google JWKS 驗證 ID token 的簽章、issuer、audience 與期限。瀏覽器只保存 `HttpOnly`、`Secure`、`SameSite=Lax` 的隨機 session token，D1 只保存其 SHA-256 雜湊，不保存 Google access token 或 refresh token。刊登 API 另有同源請求與伺服器端欄位驗證。

## 本機執行

需求：Node.js 22.13 以上。

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`。首次讀取房源時會自動建立本機 SQLite 資料。若尚未設定 Google OAuth，可先驗證地圖、空狀態與公開讀取 API；建立刊登需要完成登入。

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
