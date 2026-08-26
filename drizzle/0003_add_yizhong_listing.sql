INSERT INTO `users` (
  `id`, `google_sub`, `email`, `name`, `avatar_url`, `created_at`, `updated_at`
) VALUES (
  'system-manual-listings',
  'manual:site-owner',
  'manual-listing@invalid.local',
  '站方代登',
  NULL,
  '2026-08-26T11:00:00.000Z',
  '2026-08-26T11:00:00.000Z'
)
ON CONFLICT(`google_sub`) DO NOTHING;
--> statement-breakpoint
INSERT INTO `listings` (
  `id`, `university_id`, `owner_user_id`, `title`, `address`, `description`,
  `monthly_rent`, `room_type`, `area_ping`, `walk_minutes`, `latitude`,
  `longitude`, `highlights`, `contact_method`, `contact_value`, `status`,
  `created_at`, `updated_at`
) VALUES (
  'manual-niu-yizhong-82',
  'niu',
  'system-manual-listings',
  '宜中路 82 號租屋',
  '260 宜蘭縣宜蘭市思源里宜中路82號',
  '租金、房型、坪數與步行時間請直接電話洽詢。地圖標記為宜中路門牌附近的約略位置，實際位置以聯絡人說明為準。',
  0,
  '詳情請洽',
  0,
  0,
  24.74692,
  121.74265,
  '["電話洽詢","位置約示"]',
  '電話',
  '0972249085',
  'published',
  '2026-08-26T11:00:00.000Z',
  '2026-08-26T11:00:00.000Z'
)
ON CONFLICT(`id`) DO UPDATE SET
  `address` = excluded.`address`,
  `description` = excluded.`description`,
  `latitude` = excluded.`latitude`,
  `longitude` = excluded.`longitude`,
  `highlights` = excluded.`highlights`,
  `contact_method` = excluded.`contact_method`,
  `contact_value` = excluded.`contact_value`,
  `status` = excluded.`status`,
  `updated_at` = excluded.`updated_at`;
--> statement-breakpoint
PRAGMA optimize;
