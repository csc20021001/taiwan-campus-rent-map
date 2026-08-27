# WZUNAA

以地圖為核心的臺灣國立大學周邊租屋地點與居住經驗交流平台。網站不保存房東電話、即時空房、押金、契約或房間照片；使用者登入後可新增租屋地點、回報月租與 1～5 分評分，並發表所有訪客都能閱讀的公開評論。

## MVP 功能

- 11 所學校：臺大、清大、陽明交大、成大、中央、中興、中山、中正、臺科、北科、宜大
- 首頁先選擇「查房子」或「查教授」，租屋地圖位於 `/rentals`
- MapLibre GL JS + OpenStreetMap／OpenFreeMap 極簡向量底圖，不需要商業地圖 API 金鑰
- Marker、地址、租金與評分全部由 Cloudflare D1 提供
- 52 個政府資料去重後地點、55 筆學校關聯，以及 1 個管理員建立的宜蘭地點
- 政府歷史租賃參考與有效使用者回報不分來源，合併計算平均租金；評分亦取所有有效回報平均
- Google OpenID Connect、PKCE、HttpOnly 工作階段
- 同帳號對同一租屋地點或教授只保留一筆評分，重新送出採 UPSERT
- 租屋地點評論可公開閱讀；使用 Google 登入後可發表 4～500 字評論
- 地址正規化、相同地址／已確認座標去重、輸入範圍驗證、參數化 SQL、同源檢查與 D1 限流
- 老師姓名遮罩顯示；可依「老師態度、學習收穫、作業量、考試難易、給分標準」五項給予 1～5 分評分
- AdSense 版位、隱私權政策、服務條款與 `ads.txt`

## Cloudflare 架構

```text
Vinext / Next.js UI + 靜態資產
              ↓
Cloudflare Worker（頁面與 REST API）
              ↓
Cloudflare D1

MapLibre → OpenFreeMap / OSM Produced Work（只作底圖）
Google OAuth → users / auth_sessions（不保存 Google token）
```

本專案沿用既有 Vinext 全端架構，由同一個 Cloudflare Worker 提供 React 頁面、靜態資產與 API。Cloudflare Pages 適合 Next.js 靜態匯出；需要 SSR、OAuth callback 與 D1 API 的 Next.js 專案，Cloudflare現行文件建議部署到 Workers。這樣不需拆成兩個站點，也能保留相同網域 Cookie 與同源防護。

第一版沒有圖片上傳，因此 `.openai/hosting.json` 的 R2 binding 保持 `null`。未來新增圖片時只把 object key／metadata 放在 D1，圖片 binary 放 R2。

## D1 資料模型

- `universities`：學校與校區座標
- `users`：內部使用者、唯一 `google_sub`；Email 不公開
- `auth_sessions`：工作階段 token 的 SHA-256 雜湊
- `academic_departments`：11 校公開官方網站所列系所、研究所與學位單位
- `professors`、`professor_ratings`：老師基本資料與唯一 `(user_id, professor_id)` 五項評分
- `rental_locations`：不重複的租屋地點；包含 `normalized_address` 與選用的政府參考租金
- `rental_location_universities`：同一地點可同時屬於清大與陽明交大等多校範圍
- `rental_reports`：唯一 `(user_id, rental_location_id)` 的月租與整體評分
- `rental_comments`：租屋地點的公開評論，顯示作者帳號名稱但不公開 Email
- `api_rate_limits`：以使用者、動作、時間窗計數的基本濫用防護

舊版 `listings`／`reviews` 資料表與 API 仍保留以避免破壞既有資料；新版租屋地點評論使用獨立的 `rental_comments`。所有評論寫入都要求登入並套用限流。

### 租金統計

平均租金將 `rental_locations.reference_rent`（若有）與 `rental_reports` 中 `is_valid = 1 AND is_outlier = 0` 的月租視為同等資料點後計算；平均評分則納入所有有效且非異常的使用者評分。API 接受月租 1,000～200,000 元；至少有 5 個既有有效價格資料點後，低於綜合中位數 0.4 倍或高於 2.5 倍的新值會保留原始紀錄，但標記為 `is_outlier`。

## REST API

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/universities` | D1 學校清單 |
| GET | `/api/rentals?university_id=...&north=...&south=...&east=...&west=...` | 學校／地圖範圍內地點 |
| GET | `/api/rentals/:id` | 地址、跨來源平均、價格資料筆數、評分與參考租金 |
| GET | `/api/rentals/:id/comments` | 公開讀取最近 50 則租屋評論 |
| POST | `/api/rentals` | 登入後新增或導向既有地點 |
| POST | `/api/rentals/:id/report` | 登入後 UPSERT 實付月租與評分 |
| POST | `/api/rentals/:id/comments` | 登入後發表公開租屋評論 |
| GET | `/api/professors` | `university_id`、`department`、`search` 篩選 |
| GET | `/api/professors/:id` | 教授平均評分與人數 |
| GET | `/api/departments?university_id=...` | 官方系所、學院、類型與來源 |
| POST | `/api/professors/:id/rating` | 登入後 UPSERT 五項老師評分 |

## 環境變數

複製 `.env.example` 為 `.env.local`：

```dotenv
GOOGLE_CLIENT_ID=你的-client-id
GOOGLE_CLIENT_SECRET=你的-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

NEXT_PUBLIC_VECTOR_TILE_URL=https://tiles.openfreemap.org/planet
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT=
```

正式 Google OAuth redirect URI：

```text
https://map.scmwcscr.com/api/auth/google/callback
```

Client Secret 只能設定為 Worker／Sites 伺服器環境變數，不可使用 `NEXT_PUBLIC_` 前綴，也不可提交 Git。登入流程驗證 `state`、PKCE、Google JWKS、issuer、audience 與 Email verified；D1 不保存 access token、refresh token 或 Google 密碼。

## 本機開發

需求為 Node.js 22.13 以上。

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`。Vinext + Miniflare 會把 D1 的本機 SQLite 放在 `.wrangler/`；首次 API 請求也會以冪等方式建立資料表並匯入學校與租屋地點，不需另裝 SQL server。

## Migrations 與 seed

- `drizzle/0004_cloudflare_core.sql`：教授、租屋地點、回報、限流、UNIQUE constraints 與 indexes
- `drizzle/0005_seed_government_rentals.sql`：本次 55 筆輸入去重後的 D1 初始地點
- `drizzle/0006_fixed_absolute_coordinates.sql`：把共用街道中心點的房屋改為固定、未驗證的絕對座標
- `drizzle/0008_academic_units_and_rating_dimensions.sql`：新增官方系所資料表與四項老師評分欄位
- `drizzle/0009_rental_comments.sql`：新增公開租屋評論、內容長度限制與查詢 indexes
- `drizzle/0010_professor_learning_score.sql`：新增「學習收穫」評分欄位與 1～5 分限制
- `scripts/build-rental-seed.mjs`：從內建地址與一次性 geocode cache 重建 TypeScript／SQL seed
- `db/professors.seed.json` + `scripts/build-professor-seed.mjs`：匯入已由各校官方公開師資頁核對的教授姓名、系所與來源連結
- `scripts/discover-official-*.mjs`：從 11 校官方學術單位目錄逐系所尋找師資頁；只接受該校官方 HTTPS 子網域
- `db/nycu-official-units.generated.json`：由陽明交大官方「115 年網站健檢受檢單位清單」整理的系所網址
- `db/department-seeds.ts`：收錄 11 校官方學術單位頁所列系所、研究所、學位學程與教學單位

```bash
npm run seed:build
npm run professors:discover
npm run professors:faculty-pages
npm run professors:extract
npm run professors:merge
```

Sites 部署會把 `drizzle/` 一併打包並依 journal 套用 D1 migration。若使用自己的 Cloudflare 帳號與 Wrangler，先建立 D1、設定 `DB` binding，然後執行：

```bash
npx wrangler d1 migrations apply <DATABASE_NAME> --local
npx wrangler d1 migrations apply <DATABASE_NAME> --remote
```

教授 JSON 格式：

```json
[
  {
    "id": "ntu-agec-example",
    "universityId": "ntu",
    "department": "農業經濟學系",
    "name": "陳教授",
    "sourceUrl": "https://www.agec.ntu.edu.tw/zh_tw/teacher"
  }
]
```

目前收錄 11 校、777 個去重後官方學術單位，以及 3,365 筆官方公開師資資料，涵蓋 226 個具有可核對公開師資名單的系所／學程。所有學術單位都可在篩選器查看；老師姓名必須能在校方公開師資頁以職稱或專任師資區段核對後才會顯示，論壇、搜尋結果摘要及第三方名錄不會被匯入。

## 品質檢查

```bash
npm test
npm run db:check
npm run lint
npm run build
npm audit
```

Migration 測試會在記憶體 SQLite 實際套用 schema 與 seed，確認 53 個不重複地點、56 筆學校關聯、唯一評分／回報限制、公開評論限制，以及政府參考與有效使用者回報的跨來源平均計算。

## 地圖授權

畫面保留 OpenStreetMap contributors 與 OpenFreeMap 署名，並使用沒有地名、商家或景點 symbol layer 的自訂極簡樣式。可用 `NEXT_PUBLIC_VECTOR_TILE_URL` 切換至相容的自有 TileJSON 服務。租屋 Marker 只使用 D1 中保存的絕對經緯度，不套用學校相對位置、隨機位移或畫面避碰偏移；所有 Marker 根節點維持 `position:absolute`，選取狀態只改外框與陰影，不覆寫 MapLibre 的定位 `transform`。租屋資料不從 OSM POI 推論，也不爬取 Google Maps、591 或其他商業租屋平台。
