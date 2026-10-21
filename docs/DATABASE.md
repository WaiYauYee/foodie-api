# MakanFit Database Schema

PostgreSQL 15+ schema for MakanFit, a calorie / nutrition tracking app with AI food-photo analysis and a gamified "Pal" (Lemmy).

## Conventions

- `snake_case` everywhere; the API layer maps to camelCase TypeScript types.
- UUID primary keys for user data.
- All timestamps are `timestamptz` (UTC). `local_date` columns hold the user's calendar day, so streaks and daily totals survive timezone changes.
- Nutrients are stored **per 100 g (or 100 ml)**. Per serving = `value * serving_size / 100`.
- Coins only change through `coin_transactions` (append-only ledger).
- `NN` = NOT NULL. `PK` = primary key. `FK` = foreign key.

## Table of Contents

1. [Identity & Account](#1-identity--account): `users`, `auth_identities`, `sessions`, `password_reset_tokens`, `user_consents`
2. [Profile & Goals](#2-profile--goals): `user_profiles`, `user_goals`
3. [Notifications](#3-notifications): `notification_preferences`, `meal_reminder_times`, `push_devices`
4. [Body & Hydration Tracking](#4-body--hydration-tracking): `weight_entries`, `water_logs`
5. [Food Catalog](#5-food-catalog): `food_groups`, `foods`, `food_nutrients`, `food_aliases`, `food_components`
6. [Meal Logging & AI Pipeline](#6-meal-logging--ai-pipeline): `meal_entries`, `food_photo_analyses`, `analysis_detected_items`, `meal_items`
7. [Derived Progress](#7-derived-progress): `daily_summaries`, `user_streaks`
8. [Pal Gamification](#8-pal-lemmy-gamification): `pal_profiles`, `pal_items`, `user_pal_items`, `pal_equipped`, `coin_transactions`, `challenge_templates`, `user_challenges`, `streak_milestones`, `user_streak_milestone_claims`
9. [Enums](#9-enums)
10. [Views](#10-views)
11. [Functions & Triggers](#11-functions--triggers)

---

## 1. Identity & Account

### `users`
Core account record. Soft-deleted via `deleted_at`; a purge job hard-deletes later (PDPA).

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Unique user ID. |
| `email` | citext, NN | Case-insensitive email. Unique among non-deleted users. |
| `password_hash` | text | Password hash. NULL for Google/Apple-only accounts. Never sent to clients. |
| `email_verified_at` | timestamptz | When the email was verified. NULL = unverified. |
| `is_active` | boolean, NN | Whether the account is enabled (default `true`). |
| `last_login_at` | timestamptz | Last successful login. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |
| `deleted_at` | timestamptz | Soft-delete marker. |

### `auth_identities`
Social login links (Google / Apple) attached to a user.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Identity ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user (cascade delete). |
| `provider` | auth_provider_t, NN | `google` or `apple`. |
| `provider_user_id` | text, NN | User ID at the provider. Unique together with `provider`. |
| `created_at` | timestamptz, NN | When the identity was linked. |

### `sessions`
Refresh-token sessions, one per device/login.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Session ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `refresh_token_hash` | text, NN, unique | Hash of the refresh token (the raw token is never stored). |
| `remember_me` | boolean, NN | Whether the user chose "remember me" (longer expiry). |
| `user_agent` | text | Client user agent. |
| `ip_address` | inet | Client IP. |
| `created_at` | timestamptz, NN | Session start. |
| `last_used_at` | timestamptz, NN | Last time the token was used. |
| `expires_at` | timestamptz, NN | Expiry time. |
| `revoked_at` | timestamptz | Set when logged out / revoked. |

### `password_reset_tokens`
Forgot-password flow (request → OTP → reset).

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Token ID. |
| `user_id` | uuid, FK → `users`, NN | User resetting the password. |
| `code_hash` | text, NN | Hash of the 6-digit code / token. |
| `attempts` | smallint, NN | Wrong-code attempts so far (≥ 0), for rate limiting. |
| `requested_ip` | inet | IP that requested the reset. |
| `created_at` | timestamptz, NN | Request time. |
| `expires_at` | timestamptz, NN | Code expiry. |
| `used_at` | timestamptz | When the code was successfully used. |

### `user_consents`
PDPA evidence of Terms / Privacy acceptance.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Consent record ID. |
| `user_id` | uuid, FK → `users`, NN | User who accepted. |
| `document` | consent_doc_t, NN | `terms` or `privacy`. |
| `version` | text, NN | Version of the document accepted. Unique with `user_id` + `document`. |
| `accepted_at` | timestamptz, NN | Acceptance time. |
| `ip_address` | inet | IP at acceptance. |

---

## 2. Profile & Goals

### `user_profiles`
One-to-one profile and onboarding data. Creating a row triggers default notification, Pal and reminder rows.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `first_name` | text, NN | First name. |
| `last_name` | text, NN | Last name. |
| `gender` | gender_t | `male` / `female`. |
| `birth_date` | date | Must be in the past. |
| `height_cm` | numeric(5,1) | Height, 100–250 cm. |
| `diet_type` | diet_type_t, NN | `classic`, `pescatarian`, `vegetarian`, `vegan` (default `classic`). |
| `primary_goal` | primary_goal_t, NN | `healthier`, `energy`, `consistency`, `body` (default `healthier`). |
| `tried_other_apps` | boolean, NN | Onboarding answer: used other tracking apps before. |
| `timezone` | text, NN | IANA timezone (default `Asia/Kuala_Lumpur`); used to compute `local_date`. |
| `locale` | text, NN | UI language (default `en`). |
| `onboarding_completed_at` | timestamptz | Set when onboarding finishes. Requires gender, birth date and height to be filled. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

### `user_goals`
Versioned goals. Each change closes the current row (`valid_to`) and opens a new one, so history is kept. Only one current row per user; time ranges cannot overlap.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Goal version ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `start_weight_kg` | numeric(5,2), NN | Weight when the goal started (20–500). |
| `goal_weight_kg` | numeric(5,2), NN | Target weight (20–500). |
| `activity_level` | activity_level_t, NN | `sedentary` … `extra_active`. |
| `dietary_goal` | dietary_goal_t, NN | `maintain`, `gradual_gain`, `rapid_gain`, `gradual_lose`, `rapid_lose`. |
| `calorie_origin` | goal_origin_t, NN | `standard` (calculated) or `custom` (user-set) calorie target. |
| `target_calories` | integer, NN | Daily calorie target (800–6000). |
| `macro_origin` | goal_origin_t, NN | `standard` or `custom` macro targets. |
| `target_protein_g` | numeric(6,1), NN | Daily protein target (g). |
| `target_carbs_g` | numeric(6,1), NN | Daily carbs target (g). |
| `target_fat_g` | numeric(6,1), NN | Daily fat target (g). |
| `target_fiber_g` | numeric(6,1), NN | Daily fiber target (g). |
| `target_water_ml` | integer, NN | Daily water target (500–8000 ml, default 2000). |
| `valid_from` | timestamptz, NN | When this version became active. |
| `valid_to` | timestamptz | When it was superseded. NULL = current goal. |

---

## 3. Notifications

### `notification_preferences`
Per-user reminder switches.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `meal_reminders_enabled` | boolean, NN | Meal reminders on/off (default on). |
| `water_reminder_enabled` | boolean, NN | Water reminders on/off (default off). |
| `weight_reminders_enabled` | boolean, NN | Weight-in reminders on/off (default on). |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

### `meal_reminder_times`
Reminder time per main meal (snack excluded).

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `notification_preferences` | Owning user. |
| `meal_type` | meal_type_t, PK | `breakfast`, `lunch` or `dinner` (not `snack`). |
| `remind_at` | time, NN | Local wall-clock reminder time (defaults 07:45 / 12:30 / 19:00). |

### `push_devices`
Registered devices for push notifications.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Device record ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `platform` | platform_t, NN | `ios`, `android`, `web`. |
| `push_token` | text, NN, unique | Push provider token. |
| `created_at` | timestamptz, NN | Registration time. |
| `last_seen_at` | timestamptz, NN | Last activity from this device. |
| `revoked_at` | timestamptz | Set when the token is invalidated. |

---

## 4. Body & Hydration Tracking

### `weight_entries`
Weight log. The current weight is the latest row (see view `v_current_weight`); it is not stored on the user.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Entry ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `weight_kg` | numeric(5,2), NN | Weight (20–500 kg). |
| `height_cm` | numeric(5,1) | Height snapshot used for BMI (100–250). |
| `bmi` | numeric(4,1), generated | `weight / height²`, computed automatically when height is present. |
| `recorded_at` | timestamptz, NN | When it was measured. |
| `local_date` | date, NN | User's calendar day (auto-filled from timezone if omitted). |
| `note` | text | Optional note. |
| `created_at` | timestamptz, NN | Row creation time. |

### `water_logs`
Individual water intake events.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Log ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `amount_ml` | integer, NN | Amount drunk (1–5000 ml). |
| `logged_at` | timestamptz, NN | When it was drunk. |
| `local_date` | date, NN | User's calendar day (auto-filled). |
| `created_at` | timestamptz, NN | Row creation time. |

---

## 5. Food Catalog

### `food_groups`
Lookup of food categories (carbs, protein, fat, dairy, fruit, vege, beverage, other).

| Column | Type | Description |
|---|---|---|
| `id` | smallint, PK | Identity ID. |
| `code` | text, NN, unique | Machine code, e.g. `carbs`. |
| `name` | text, NN | Display name. |

### `foods`
Food catalog: global system foods, AI-generated foods, or private user foods.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Food ID. |
| `name` | text, NN | Food name (trigram-indexed for fuzzy search). |
| `food_type` | food_type_t, NN | `dish`, `ingredient`, `packaged` (default `dish`). |
| `food_group_id` | smallint, FK → `food_groups` | Group. Nullable so AI dishes are not force-fitted. |
| `serving_size` | numeric(8,2), NN | Size of one serving (> 0). |
| `serving_unit` | text, NN | `g` or `ml`. |
| `source` | food_source_t, NN | `system`, `ai_generated`, `user_created`. |
| `owner_user_id` | uuid, FK → `users` | NULL = global catalog; otherwise a private custom food. |
| `is_verified` | boolean, NN | Whether the entry has been verified. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |
| `deleted_at` | timestamptz | Soft delete. |

### `food_nutrients`
1:1 with `foods`. Values are **per 100 g / 100 ml**.

| Column | Type | Description |
|---|---|---|
| `food_id` | uuid, PK, FK → `foods` | Related food. |
| `calories_kcal` | numeric(7,2), NN | Energy (kcal). |
| `protein_g` | numeric(7,2), NN | Protein (g). |
| `carbs_g` | numeric(7,2), NN | Carbohydrates (g). |
| `fat_g` | numeric(7,2), NN | Fat (g). |
| `fiber_g` | numeric(7,2), NN | Fiber (g). |
| `data_source` | nutrient_source_t, NN | `standard`, `estimated`, `user`, `ai`. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

### `food_aliases`
Alternative names (e.g. Malay or Chinese names) for search.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Alias ID. |
| `food_id` | uuid, FK → `foods`, NN | Related food. |
| `alias` | text, NN | Alternative name. Unique per food (case-insensitive). |
| `locale` | text, NN | Language of the alias (default `ms`). |

### `food_components`
Standard recipe of a dish (dish → ingredients).

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Component ID. |
| `parent_food_id` | uuid, FK → `foods`, NN | The dish. |
| `ingredient_food_id` | uuid, FK → `foods`, NN | The ingredient (cannot be the same as the parent; delete restricted). |
| `quantity` | numeric(8,2), NN | Amount of the ingredient (> 0). |
| `unit` | text, NN | `g` or `ml`. |
| `sort_order` | smallint, NN | Display order. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

---

## 6. Meal Logging & AI Pipeline

### `meal_entries`
A logged meal. Totals are maintained by trigger as the sum of `meal_items`.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Meal ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `meal_type` | meal_type_t, NN | `breakfast`, `lunch`, `dinner`, `snack`. |
| `consumed_at` | timestamptz, NN | When it was eaten. |
| `local_date` | date, NN | User's calendar day (auto-filled). |
| `food_id` | uuid, FK → `foods` | Catalog dish, if any (set NULL on delete). |
| `dish_name` | text, NN | Snapshot of the dish name; survives catalog edits. |
| `entry_source` | entry_source_t, NN | `search`, `ai_scan`, `manual`. |
| `servings` | numeric(6,2), NN | Number of servings (> 0). |
| `photo_path` | text | Object-storage key of the photo (never base64). |
| `total_calories` | numeric(8,2), NN | Sum of item calories. |
| `total_protein_g` | numeric(8,2), NN | Sum of item protein. |
| `total_carbs_g` | numeric(8,2), NN | Sum of item carbs. |
| `total_fat_g` | numeric(8,2), NN | Sum of item fat. |
| `total_fiber_g` | numeric(8,2), NN | Sum of item fiber. |
| `calorie_min_kcal` | numeric(8,2) | Lower bound of the AI calorie estimate shown in the Diary. |
| `calorie_max_kcal` | numeric(8,2) | Upper bound (must be ≥ min). |
| `note` | text | Optional note. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

### `food_photo_analyses`
One row per photo scan; can exist before the meal is saved.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Analysis ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `meal_entry_id` | uuid, unique, FK → `meal_entries` | Linked meal once saved. |
| `status` | analysis_status_t, NN | `pending`, `completed`, `failed`. |
| `photo_path` | text, NN | Storage key of the uploaded photo. |
| `overlay_path` | text | Storage key of the segmentation overlay image. |
| `classifier_label` | text | Top predicted dish label. |
| `classifier_confidence` | numeric(4,3) | Confidence of the top label (0–1). |
| `classifier_top_k` | jsonb | Top-K classifier predictions. |
| `segmentation_ref` | text | `segmentation_id` from the Python service. |
| `estimate_kcal` | numeric(8,2) | Estimated total calories. |
| `estimate_min_kcal` | numeric(8,2) | Lower calorie estimate. |
| `estimate_max_kcal` | numeric(8,2) | Upper calorie estimate. |
| `model_versions` | jsonb, NN | Versions of the models used. |
| `raw_result` | jsonb | Full service response, for debugging. |
| `error_message` | text | Error detail when `status = failed`. |
| `latency_ms` | integer | Processing time. |
| `created_at` | timestamptz, NN | Scan start. |
| `completed_at` | timestamptz | Scan finish. |
| `photo_purge_after` | timestamptz | Retention deadline for the photo. |
| `photo_purged_at` | timestamptz | When the photo was actually deleted. |

### `analysis_detected_items`
What the model predicted (kept immutable).

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Item ID. |
| `analysis_id` | uuid, FK → `food_photo_analyses`, NN | Parent analysis. |
| `name` | text, NN | Detected item name. |
| `weight_g` | numeric(8,2), NN | Estimated weight (> 0). |
| `calories_kcal` | numeric(8,2), NN | Estimated calories. |
| `protein_g` | numeric(8,2), NN | Estimated protein. |
| `carbs_g` | numeric(8,2), NN | Estimated carbs. |
| `fat_g` | numeric(8,2), NN | Estimated fat. |
| `fiber_g` | numeric(8,2), NN | Estimated fiber. |
| `confidence` | numeric(4,3) | Detection confidence (0–1). |
| `matched_food_id` | uuid, FK → `foods` | Catalog food matched to the detection. |
| `sort_order` | smallint, NN | Display order. |

### `meal_items`
What the user actually ate. Source of truth for meal totals.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Item ID. |
| `meal_entry_id` | uuid, FK → `meal_entries`, NN | Parent meal (cascade delete). |
| `food_id` | uuid, FK → `foods` | Catalog food, if any. |
| `detected_item_id` | uuid, FK → `analysis_detected_items` | Originating AI detection, if any. |
| `name` | text, NN | Item name. |
| `grams` | numeric(8,2), NN | Amount eaten (> 0). |
| `calories_kcal` | numeric(8,2), NN | Calories for this amount. |
| `protein_g` | numeric(8,2), NN | Protein. |
| `carbs_g` | numeric(8,2), NN | Carbs. |
| `fat_g` | numeric(8,2), NN | Fat. |
| `fiber_g` | numeric(8,2), NN | Fiber. |
| `source` | item_source_t, NN | `ai_detected`, `catalog`, `manual`. |
| `is_user_edited` | boolean, NN | True if grams were changed after the AI guess. |
| `sort_order` | smallint, NN | Display order. |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

---

## 7. Derived Progress

Rebuildable from the log tables.

### `daily_summaries`
Per-user, per-day roll-up used by dashboard charts, challenges and streaks.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `summary_date` | date, PK | User's calendar day. |
| `total_calories` | numeric(9,2), NN | Calories eaten that day. |
| `total_protein_g` | numeric(8,2), NN | Protein total. |
| `total_carbs_g` | numeric(8,2), NN | Carbs total. |
| `total_fat_g` | numeric(8,2), NN | Fat total. |
| `total_fiber_g` | numeric(8,2), NN | Fiber total. |
| `meal_count` | integer, NN | Number of meals logged. |
| `water_ml` | integer, NN | Water drunk. |
| `calorie_target_kcal` | integer | Calorie goal in force that day (from `user_goals`). |
| `water_target_ml` | integer | Water goal in force that day. |
| `within_calorie_target` | boolean, generated | `total_calories <= calorie_target_kcal`. |
| `water_goal_met` | boolean, generated | `water_ml >= water_target_ml`. |
| `updated_at` | timestamptz, NN | Last refresh time. |

### `user_streaks`
Cached logging streak (view `v_user_streak` applies the "alive today/yesterday" rule).

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `current_streak` | integer, NN | Length of the most recent run of logged days. |
| `longest_streak` | integer, NN | Longest run ever. |
| `last_logged_date` | date | Most recent day with a meal. |
| `updated_at` | timestamptz, NN | Last recalculation. |

---

## 8. Pal (Lemmy) Gamification

### `pal_profiles`
The user's virtual pal and coin wallet.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `coin_balance` | integer, NN | Cached sum of `coin_transactions` (cannot go below 0). |
| `friendship_level` | smallint, NN | Friendship level (≥ 1). |
| `friendship_xp` | smallint, NN | XP in the current level (0–99). |
| `created_at` | timestamptz, NN | Creation time. |
| `updated_at` | timestamptz, NN | Auto-updated by trigger. |

### `pal_items`
Shop catalog (SVG art stays in the frontend, keyed by `code`).

| Column | Type | Description |
|---|---|---|
| `id` | smallint, PK | Item ID. |
| `code` | text, NN, unique | Stable code used by the frontend, e.g. `crown`. |
| `name` | text, NN | Display name. |
| `category` | pal_slot_t, NN | `hat`, `eyes`, `accessory`, `scenery`. |
| `price_coins` | integer, NN | Price in coins. |
| `is_default` | boolean, NN | Granted to every new user. |
| `is_active` | boolean, NN | Whether it is sold in the shop. |
| `sort_order` | smallint, NN | Shop display order. |

### `user_pal_items`
User inventory / closet.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owner. |
| `item_id` | smallint, PK, FK → `pal_items` | Owned item. |
| `price_paid` | integer, NN | Coins paid at purchase. |
| `acquired_at` | timestamptz, NN | Acquisition time. |

### `pal_equipped`
One equipped item per slot (scenery = background theme). Item must fit the slot and be owned.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK | Owner. |
| `slot` | pal_slot_t, PK | Slot being filled. |
| `item_id` | smallint, NN | Equipped item (FK to `pal_items(id, category)` and `user_pal_items`). |
| `equipped_at` | timestamptz, NN | When it was equipped. |

### `coin_transactions`
Append-only coin ledger. A trigger updates `pal_profiles.coin_balance` and fills `balance_after`.

| Column | Type | Description |
|---|---|---|
| `id` | bigint, PK | Identity ID. |
| `user_id` | uuid, FK → `users`, NN | Owning user. |
| `delta` | integer, NN | Coins gained (+) or spent (−), non-zero. |
| `balance_after` | integer, NN | Balance after this transaction. |
| `reason` | coin_reason_t, NN | `welcome_bonus`, `challenge_reward`, `streak_milestone`, `shop_purchase`, `refund`, `admin_adjustment`. |
| `ref_type` | text | Type of the referenced object. |
| `ref_id` | text | ID of the referenced object. Unique with `user_id`, `reason`, `ref_type` to prevent double payout. |
| `created_at` | timestamptz, NN | Transaction time. |

### `challenge_templates`
Definitions of daily / weekly challenges.

| Column | Type | Description |
|---|---|---|
| `id` | smallint, PK | Template ID. |
| `code` | text, NN, unique | Code, e.g. `d1`, `w2`. |
| `title` | text, NN | Challenge title. |
| `description` | text, NN | Shown to the user. |
| `period` | challenge_period_t, NN | `daily` or `weekly`. |
| `kind` | challenge_kind_t, NN | `consistent`, `mindful`, `balance`. |
| `metric` | challenge_metric_t, NN | What is counted: `meals_logged`, `days_logged`, `calorie_goal_days`, `water_goal_days`, `weight_entries`. |
| `target` | integer, NN | Progress needed to complete (> 0). |
| `params` | jsonb, NN | Extra rules, e.g. `{"min_meals": 3}`. |
| `reward_coins` | integer, NN | Coins rewarded. |
| `is_active` | boolean, NN | Whether it is currently offered. |
| `sort_order` | smallint, NN | Display order. |

### `user_challenges`
A user's progress on a challenge for one period.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `template_id` | smallint, PK, FK → `challenge_templates` | Challenge. |
| `period_start` | date, PK | The day (daily) or Monday (weekly). |
| `progress` | integer, NN | Current progress (≥ 0). |
| `completed_at` | timestamptz | When the target was reached. |
| `claimed_at` | timestamptz | When the reward was claimed (requires completion). |
| `coin_tx_id` | bigint, FK → `coin_transactions` | Ledger entry of the reward. |

### `streak_milestones`
Streak reward tiers (3, 7, 14, 30 days).

| Column | Type | Description |
|---|---|---|
| `days` | integer, PK | Streak length required. |
| `title` | text, NN | Milestone title, e.g. "Weekly Warrior". |
| `reward_coins` | integer, NN | Coins rewarded. |
| `badge_key` | text, NN | Badge identifier used by the frontend. |

### `user_streak_milestone_claims`
Claimed streak milestones.

| Column | Type | Description |
|---|---|---|
| `user_id` | uuid, PK, FK → `users` | Owning user. |
| `milestone_days` | integer, PK, FK → `streak_milestones` | Milestone claimed. |
| `streak_start_date` | date, PK | Start of the streak run, so a later run can earn it again. |
| `coin_tx_id` | bigint, FK → `coin_transactions`, NN | Ledger entry of the reward. |
| `claimed_at` | timestamptz, NN | Claim time. |

---

## 9. Enums

| Enum | Values |
|---|---|
| `gender_t` | male, female |
| `activity_level_t` | sedentary, lightly_active, moderately_active, very_active, extra_active |
| `dietary_goal_t` | maintain, gradual_gain, rapid_gain, gradual_lose, rapid_lose |
| `diet_type_t` | classic, pescatarian, vegetarian, vegan |
| `primary_goal_t` | healthier, energy, consistency, body |
| `goal_origin_t` | standard, custom |
| `meal_type_t` | breakfast, lunch, dinner, snack |
| `food_type_t` | dish, ingredient, packaged |
| `food_source_t` | system, ai_generated, user_created |
| `nutrient_source_t` | standard, estimated, user, ai |
| `entry_source_t` | search, ai_scan, manual |
| `item_source_t` | ai_detected, catalog, manual |
| `analysis_status_t` | pending, completed, failed |
| `auth_provider_t` | google, apple |
| `consent_doc_t` | terms, privacy |
| `platform_t` | ios, android, web |
| `pal_slot_t` | hat, eyes, accessory, scenery |
| `challenge_period_t` | daily, weekly |
| `challenge_kind_t` | consistent, mindful, balance |
| `challenge_metric_t` | meals_logged, days_logged, calorie_goal_days, water_goal_days, weight_entries |
| `coin_reason_t` | welcome_bonus, challenge_reward, streak_milestone, shop_purchase, refund, admin_adjustment |

## 10. Views

| View | Description |
|---|---|
| `v_current_goal` | Each user's active goal (`valid_to IS NULL`). |
| `v_current_weight` | Latest weight entry and BMI per user. |
| `v_food_per_serving` | Nutrients for one serving of each food (per-100 g values scaled by serving size). |
| `v_user_streak` | Current streak, which counts only if the user logged today or yesterday, plus longest streak and `logged_today`. |

## 11. Functions & Triggers

| Name | Description |
|---|---|
| `set_updated_at()` | Sets `updated_at = now()` on update; attached to most mutable tables. |
| `fill_local_date()` | Fills `local_date` from the timestamp and the user's timezone when not supplied (meals, water, weight). |
| `recalc_meal_totals()` / `trg_meal_items_totals` | Keeps `meal_entries` totals equal to the sum of `meal_items`. |
| `refresh_daily_summary()` | Rebuilds a user's `daily_summaries` row for a date and then recalculates the streak. |
| `trg_meal_entries_summary` / `trg_water_summary` | Call `refresh_daily_summary()` when meals or water logs change. |
| `recalc_user_streak()` | Recomputes `user_streaks` using gaps-and-islands over days with at least one meal. |
| `trg_coin_apply` | Applies each `coin_transactions.delta` to `pal_profiles.coin_balance` and sets `balance_after`. |
| `trg_new_profile_defaults` | On new `user_profiles`, creates notification preferences, default meal reminders, the Pal profile, default Pal items and the default scenery. |
