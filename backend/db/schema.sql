-- =====================================================================
-- MakanFit database schema  ·  PostgreSQL 15+
-- ---------------------------------------------------------------------
-- Conventions
--   * snake_case everywhere; the API layer maps to the camelCase TS types
--   * uuid primary keys for user data (swap gen_random_uuid() for uuidv7()
--     on PostgreSQL 18+ for time-ordered keys)
--   * all timestamps are timestamptz (UTC); "local_date" columns hold the
--     user's calendar day so streaks / daily totals survive timezone changes
--   * nutrients are stored per 100 g (or 100 ml); per-serving = value * size/100
--   * money-like values (coins) always change through coin_transactions
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;      -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- fuzzy food search
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- non-overlapping goal versions

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
CREATE TYPE gender_t          AS ENUM ('male', 'female');
CREATE TYPE activity_level_t  AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');
CREATE TYPE dietary_goal_t    AS ENUM ('maintain', 'gradual_gain', 'rapid_gain', 'gradual_lose', 'rapid_lose');
CREATE TYPE diet_type_t       AS ENUM ('classic', 'pescatarian', 'vegetarian', 'vegan');
CREATE TYPE primary_goal_t    AS ENUM ('healthier', 'energy', 'consistency', 'body');
CREATE TYPE goal_origin_t     AS ENUM ('standard', 'custom');
CREATE TYPE meal_type_t       AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE food_type_t       AS ENUM ('dish', 'ingredient', 'packaged');
CREATE TYPE food_source_t     AS ENUM ('system', 'ai_generated', 'user_created');
CREATE TYPE nutrient_source_t AS ENUM ('standard', 'estimated', 'user', 'ai');
CREATE TYPE entry_source_t    AS ENUM ('search', 'ai_scan', 'manual');
CREATE TYPE item_source_t     AS ENUM ('ai_detected', 'catalog', 'manual');
CREATE TYPE analysis_status_t AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE auth_provider_t   AS ENUM ('google', 'apple');
CREATE TYPE consent_doc_t     AS ENUM ('terms', 'privacy');
CREATE TYPE platform_t        AS ENUM ('ios', 'android', 'web');
CREATE TYPE pal_slot_t        AS ENUM ('hat', 'eyes', 'accessory', 'scenery');
CREATE TYPE challenge_period_t AS ENUM ('daily', 'weekly');
CREATE TYPE challenge_kind_t  AS ENUM ('consistent', 'mindful', 'balance');
CREATE TYPE challenge_metric_t AS ENUM ('meals_logged', 'days_logged', 'calorie_goal_days', 'water_goal_days', 'weight_entries');
CREATE TYPE coin_reason_t     AS ENUM ('welcome_bonus', 'challenge_reward', 'streak_milestone', 'shop_purchase', 'refund', 'admin_adjustment');
CREATE TYPE ingredient_measurement_t AS ENUM ('g', 'serving');

-- ---------------------------------------------------------------------
-- 2. SHARED FUNCTIONS
-- ---------------------------------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------------
-- 3. IDENTITY & ACCOUNT
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL,
  password_hash     text,                         -- NULL for Google-only accounts; never sent to clients
  email_verified_at timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  last_login_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz                   -- soft delete; purge job hard-deletes later (PDPA)
);
CREATE UNIQUE INDEX users_email_uq ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE auth_identities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         auth_provider_t NOT NULL,
  provider_user_id text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
CREATE INDEX auth_identities_user_idx ON auth_identities (user_id);

CREATE TABLE sessions (                          -- refresh tokens / devices
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL UNIQUE,      -- store a hash, never the token
  remember_me        boolean NOT NULL DEFAULT false,
  user_agent         text,
  ip_address         inet,
  created_at         timestamptz NOT NULL DEFAULT now(),
  last_used_at       timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL,
  revoked_at         timestamptz
);
CREATE INDEX sessions_active_idx ON sessions (user_id) WHERE revoked_at IS NULL;

CREATE TABLE password_reset_tokens (             -- Login.tsx: forgot -> otp -> reset
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash    text NOT NULL,                     -- hash of the 6-digit code / token
  attempts     smallint NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  requested_ip inet,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz
);
CREATE INDEX password_reset_user_idx ON password_reset_tokens (user_id, created_at DESC);

CREATE TABLE user_consents (                     -- PDPA evidence for Terms / Privacy acceptance
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document    consent_doc_t NOT NULL,
  version     text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address  inet,
  UNIQUE (user_id, document, version)
);

-- ---------------------------------------------------------------------
-- 4. PROFILE & GOALS
-- ---------------------------------------------------------------------
CREATE TABLE user_profiles (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  gender        gender_t,
  birth_date    date CHECK (birth_date IS NULL OR birth_date < CURRENT_DATE),
  height_cm     numeric(5,1) CHECK (height_cm IS NULL OR height_cm BETWEEN 100 AND 250),
  diet_type     diet_type_t   NOT NULL DEFAULT 'classic',
  primary_goal  primary_goal_t NOT NULL DEFAULT 'healthier',
  tried_other_apps boolean NOT NULL DEFAULT false,
  timezone      text NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
  locale        text NOT NULL DEFAULT 'en',
  onboarding_completed_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_needs_body_data CHECK (
    onboarding_completed_at IS NULL
    OR (gender IS NOT NULL AND birth_date IS NOT NULL AND height_cm IS NOT NULL)
  )
);

-- Versioned goals: every change closes the current row and opens a new one,
-- so history (old vs new calorie target) is never lost. Replaces goal_history.
CREATE TABLE user_goals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_weight_kg  numeric(5,2) NOT NULL CHECK (start_weight_kg BETWEEN 20 AND 500),
  goal_weight_kg   numeric(5,2) NOT NULL CHECK (goal_weight_kg  BETWEEN 20 AND 500),
  activity_level   activity_level_t NOT NULL,
  dietary_goal     dietary_goal_t   NOT NULL,
  calorie_origin   goal_origin_t    NOT NULL DEFAULT 'standard',
  target_calories  integer NOT NULL CHECK (target_calories BETWEEN 800 AND 6000),
  macro_origin     goal_origin_t    NOT NULL DEFAULT 'standard',
  target_protein_g numeric(6,1) NOT NULL CHECK (target_protein_g >= 0),
  target_carbs_g   numeric(6,1) NOT NULL CHECK (target_carbs_g   >= 0),
  target_fat_g     numeric(6,1) NOT NULL CHECK (target_fat_g     >= 0),
  target_fiber_g   numeric(6,1) NOT NULL CHECK (target_fiber_g   >= 0),
  target_water_ml  integer NOT NULL DEFAULT 2000 CHECK (target_water_ml BETWEEN 500 AND 8000),
  valid_from       timestamptz NOT NULL DEFAULT now(),
  valid_to         timestamptz,
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  EXCLUDE USING gist (user_id WITH =, tstzrange(valid_from, valid_to) WITH &&)
);
CREATE UNIQUE INDEX user_goals_one_current_uq ON user_goals (user_id) WHERE valid_to IS NULL;

-- ---------------------------------------------------------------------
-- 5. NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notification_preferences (
  user_id                  uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  meal_reminders_enabled   boolean NOT NULL DEFAULT true,
  water_reminder_enabled   boolean NOT NULL DEFAULT false,
  weight_reminders_enabled boolean NOT NULL DEFAULT true,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE meal_reminder_times (
  user_id   uuid NOT NULL REFERENCES notification_preferences(user_id) ON DELETE CASCADE,
  meal_type meal_type_t NOT NULL CHECK (meal_type <> 'snack'),
  remind_at time NOT NULL,                       -- local wall-clock time, e.g. 07:45
  PRIMARY KEY (user_id, meal_type)
);

CREATE TABLE push_devices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     platform_t NOT NULL,
  push_token   text NOT NULL UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz
);
CREATE INDEX push_devices_user_idx ON push_devices (user_id) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------
-- 6. BODY & HYDRATION TRACKING
-- ---------------------------------------------------------------------
-- current weight is NOT stored on the user: it is the latest row here
-- (see v_current_weight). This removes the dual-write in App.handleAddWeight.
CREATE TABLE weight_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   numeric(5,2) NOT NULL CHECK (weight_kg BETWEEN 20 AND 500),
  height_cm   numeric(5,1) CHECK (height_cm IS NULL OR height_cm BETWEEN 100 AND 250),  -- snapshot for BMI
  bmi         numeric(4,1) GENERATED ALWAYS AS (
                CASE WHEN height_cm IS NOT NULL
                     THEN round(weight_kg / ((height_cm / 100.0) * (height_cm / 100.0)), 1)
                END) STORED,                      -- replaces bmi_history
  recorded_at timestamptz NOT NULL DEFAULT now(),
  local_date  date NOT NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX weight_entries_user_time_idx ON weight_entries (user_id, recorded_at DESC);
CREATE INDEX weight_entries_user_date_idx ON weight_entries (user_id, local_date);

CREATE TABLE water_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml  integer NOT NULL CHECK (amount_ml BETWEEN 1 AND 5000),
  logged_at  timestamptz NOT NULL DEFAULT now(),
  local_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX water_logs_user_date_idx ON water_logs (user_id, local_date);

-- ---------------------------------------------------------------------
-- 7. FOOD CATALOG
-- ---------------------------------------------------------------------
CREATE TABLE food_groups (
  id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE foods (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  food_type     food_type_t   NOT NULL DEFAULT 'dish',
  food_group_id smallint REFERENCES food_groups(id),          -- nullable: AI dishes are not force-fitted into a group
  serving_size  numeric(8,2)  NOT NULL CHECK (serving_size > 0),
  serving_unit  text          NOT NULL DEFAULT 'g' CHECK (serving_unit IN ('g', 'ml')),
  source        food_source_t NOT NULL DEFAULT 'system',
  owner_user_id uuid REFERENCES users(id) ON DELETE CASCADE,  -- NULL = global catalog, else a private custom food
  is_verified   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX foods_name_trgm_idx ON foods USING gin (name gin_trgm_ops);
CREATE INDEX foods_group_idx     ON foods (food_group_id);
CREATE INDEX foods_owner_idx     ON foods (owner_user_id) WHERE owner_user_id IS NOT NULL;

CREATE TABLE food_nutrients (                    -- 1:1 with foods, values per 100 g / 100 ml
  food_id      uuid PRIMARY KEY REFERENCES foods(id) ON DELETE CASCADE,
  calories_kcal numeric(7,2) NOT NULL CHECK (calories_kcal >= 0),
  protein_g    numeric(7,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g      numeric(7,2) NOT NULL DEFAULT 0 CHECK (carbs_g   >= 0),
  fat_g        numeric(7,2) NOT NULL DEFAULT 0 CHECK (fat_g     >= 0),
  fiber_g      numeric(7,2) NOT NULL DEFAULT 0 CHECK (fiber_g   >= 0),
  data_source  nutrient_source_t NOT NULL DEFAULT 'standard',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE food_aliases (                      -- "Nasi Lemak" / "Coconut Rice" / Malay, Chinese names
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id  uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  alias    text NOT NULL,
  locale   text NOT NULL DEFAULT 'ms'
);
CREATE UNIQUE INDEX food_aliases_uq ON food_aliases (food_id, lower(alias));
CREATE INDEX food_aliases_trgm_idx ON food_aliases USING gin (alias gin_trgm_ops);

CREATE TABLE food_components (                   -- standard recipe of a dish
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_food_id     uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  ingredient_food_id uuid NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  quantity           numeric(8,2) NOT NULL CHECK (quantity > 0),
  unit               text NOT NULL DEFAULT 'g' CHECK (unit IN ('g', 'ml')),
  sort_order         smallint NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_food_id, ingredient_food_id),
  CHECK (parent_food_id <> ingredient_food_id)
);
CREATE INDEX food_components_ingredient_idx ON food_components (ingredient_food_id);

-- ---------------------------------------------------------------------
-- 8. MEAL LOGGING + AI PIPELINE
-- ---------------------------------------------------------------------
CREATE TABLE meal_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type       meal_type_t NOT NULL,
  consumed_at     timestamptz NOT NULL DEFAULT now(),
  local_date      date NOT NULL,
  food_id         uuid REFERENCES foods(id) ON DELETE SET NULL,   -- catalog dish, if any
  dish_name       text NOT NULL,                                   -- snapshot; survives catalog edits
  entry_source    entry_source_t NOT NULL DEFAULT 'search',
  servings        numeric(6,2) NOT NULL DEFAULT 1 CHECK (servings > 0),
  photo_path      text,                                            -- object-storage key, never base64
  -- totals are maintained by trigger as the sum of meal_items
  total_calories  numeric(8,2) NOT NULL DEFAULT 0 CHECK (total_calories >= 0),
  total_protein_g numeric(8,2) NOT NULL DEFAULT 0 CHECK (total_protein_g >= 0),
  total_carbs_g   numeric(8,2) NOT NULL DEFAULT 0 CHECK (total_carbs_g   >= 0),
  total_fat_g     numeric(8,2) NOT NULL DEFAULT 0 CHECK (total_fat_g     >= 0),
  total_fiber_g   numeric(8,2) NOT NULL DEFAULT 0 CHECK (total_fiber_g   >= 0),
  calorie_min_kcal numeric(8,2),                                   -- AI estimate range shown in Diary
  calorie_max_kcal numeric(8,2),
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (calorie_max_kcal IS NULL OR calorie_min_kcal IS NULL OR calorie_max_kcal >= calorie_min_kcal)
);
CREATE INDEX meal_entries_user_date_idx ON meal_entries (user_id, local_date);
CREATE INDEX meal_entries_user_time_idx ON meal_entries (user_id, consumed_at DESC);

CREATE TABLE food_photo_analyses (               -- one row per scan; may exist before the meal is saved
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_entry_id         uuid UNIQUE REFERENCES meal_entries(id) ON DELETE CASCADE,
  status                analysis_status_t NOT NULL DEFAULT 'pending',
  photo_path            text NOT NULL,
  overlay_path          text,                                      -- segmentation overlay image
  classifier_label      text,
  classifier_confidence numeric(4,3) CHECK (classifier_confidence BETWEEN 0 AND 1),
  classifier_top_k      jsonb,
  segmentation_ref      text,                                      -- segmentation_id from the Python service
  estimate_kcal         numeric(8,2),
  estimate_min_kcal     numeric(8,2),
  estimate_max_kcal     numeric(8,2),
  model_versions        jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_result            jsonb,                                     -- full service response, for debugging
  error_message         text,
  latency_ms            integer,
  created_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  photo_purge_after     timestamptz,                               -- retention job (Privacy Policy: no longer than necessary)
  photo_purged_at       timestamptz
);
CREATE INDEX food_photo_analyses_user_idx  ON food_photo_analyses (user_id, created_at DESC);
CREATE INDEX food_photo_analyses_purge_idx ON food_photo_analyses (photo_purge_after) WHERE photo_purged_at IS NULL;

CREATE TABLE analysis_detected_items (           -- what the model predicted, kept immutable
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id    uuid NOT NULL REFERENCES food_photo_analyses(id) ON DELETE CASCADE,
  name           text NOT NULL,
  weight_g       numeric(8,2) NOT NULL CHECK (weight_g > 0),
  calories_kcal  numeric(8,2) NOT NULL DEFAULT 0,
  protein_g      numeric(8,2) NOT NULL DEFAULT 0,
  carbs_g        numeric(8,2) NOT NULL DEFAULT 0,
  fat_g          numeric(8,2) NOT NULL DEFAULT 0,
  fiber_g        numeric(8,2) NOT NULL DEFAULT 0,
  confidence     numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),
  matched_food_id uuid REFERENCES foods(id) ON DELETE SET NULL,
  sort_order     smallint NOT NULL DEFAULT 0
);
CREATE INDEX analysis_detected_items_analysis_idx ON analysis_detected_items (analysis_id);

CREATE TABLE meal_items (                        -- what the user actually ate (source of truth for totals)
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_entry_id    uuid NOT NULL REFERENCES meal_entries(id) ON DELETE CASCADE,
  food_id          uuid REFERENCES foods(id) ON DELETE SET NULL,
  detected_item_id uuid REFERENCES analysis_detected_items(id) ON DELETE SET NULL,
  name             text NOT NULL,
  grams            numeric(8,2) NOT NULL CHECK (grams > 0),
  calories_kcal    numeric(8,2) NOT NULL DEFAULT 0 CHECK (calories_kcal >= 0),
  protein_g        numeric(8,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g          numeric(8,2) NOT NULL DEFAULT 0 CHECK (carbs_g   >= 0),
  fat_g            numeric(8,2) NOT NULL DEFAULT 0 CHECK (fat_g     >= 0),
  fiber_g          numeric(8,2) NOT NULL DEFAULT 0 CHECK (fiber_g   >= 0),
  source           item_source_t NOT NULL DEFAULT 'catalog',
  is_user_edited   boolean NOT NULL DEFAULT false,   -- true when grams were changed after the AI guess
  sort_order       smallint NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_items_meal_idx ON meal_items (meal_entry_id);
CREATE INDEX meal_items_food_idx ON meal_items (food_id);

-- ---------------------------------------------------------------------
-- 9. DERIVED PROGRESS (rebuildable from the log tables)
-- ---------------------------------------------------------------------
CREATE TABLE daily_summaries (
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_date        date NOT NULL,
  total_calories      numeric(9,2) NOT NULL DEFAULT 0,
  total_protein_g     numeric(8,2) NOT NULL DEFAULT 0,
  total_carbs_g       numeric(8,2) NOT NULL DEFAULT 0,
  total_fat_g         numeric(8,2) NOT NULL DEFAULT 0,
  total_fiber_g       numeric(8,2) NOT NULL DEFAULT 0,
  meal_count          integer NOT NULL DEFAULT 0,
  water_ml            integer NOT NULL DEFAULT 0,
  calorie_target_kcal integer,                    -- goal in force that day (from user_goals)
  water_target_ml     integer,
  within_calorie_target boolean GENERATED ALWAYS AS (
                        calorie_target_kcal IS NOT NULL AND total_calories <= calorie_target_kcal) STORED,
  water_goal_met      boolean GENERATED ALWAYS AS (
                        water_target_ml IS NOT NULL AND water_ml >= water_target_ml) STORED,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, summary_date)
);

CREATE TABLE user_streaks (                      -- cache; view v_user_streak applies "alive today/yesterday"
  user_id          uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak   integer NOT NULL DEFAULT 0,   -- length of the most recent run of logged days
  longest_streak   integer NOT NULL DEFAULT 0,
  last_logged_date date,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. PAL (LEMMY) GAMIFICATION
-- ---------------------------------------------------------------------
CREATE TABLE pal_profiles (
  user_id          uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coin_balance     integer NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),   -- cached sum of coin_transactions
  friendship_level smallint NOT NULL DEFAULT 1 CHECK (friendship_level >= 1),
  friendship_xp    smallint NOT NULL DEFAULT 0 CHECK (friendship_xp BETWEEN 0 AND 99),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pal_items (                         -- shop catalog; SVG art stays in the frontend keyed by code
  id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  category   pal_slot_t NOT NULL,
  price_coins integer NOT NULL DEFAULT 0 CHECK (price_coins >= 0),
  is_default boolean NOT NULL DEFAULT false,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  UNIQUE (id, category)
);

CREATE TABLE user_pal_items (                    -- inventory / closet
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     smallint NOT NULL REFERENCES pal_items(id),
  price_paid  integer NOT NULL DEFAULT 0 CHECK (price_paid >= 0),
  acquired_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE pal_equipped (                      -- one item per slot; scenery = background theme
  user_id     uuid NOT NULL,
  slot        pal_slot_t NOT NULL,
  item_id     smallint NOT NULL,
  equipped_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slot),
  FOREIGN KEY (item_id, slot)   REFERENCES pal_items (id, category),               -- item must fit the slot
  FOREIGN KEY (user_id, item_id) REFERENCES user_pal_items (user_id, item_id) ON DELETE CASCADE  -- and be owned
);

CREATE TABLE coin_transactions (                 -- append-only ledger
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta         integer NOT NULL CHECK (delta <> 0),
  balance_after integer NOT NULL,
  reason        coin_reason_t NOT NULL,
  ref_type      text,
  ref_id        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coin_transactions_user_idx ON coin_transactions (user_id, created_at DESC);
-- idempotency: the same reward for the same reference can only be paid once
CREATE UNIQUE INDEX coin_transactions_once_uq ON coin_transactions (user_id, reason, ref_type, ref_id) WHERE ref_id IS NOT NULL;

CREATE TABLE challenge_templates (
  id           smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code         text NOT NULL UNIQUE,
  title        text NOT NULL,
  description  text NOT NULL,
  period       challenge_period_t NOT NULL,
  kind         challenge_kind_t   NOT NULL,
  metric       challenge_metric_t NOT NULL,
  target       integer NOT NULL CHECK (target > 0),
  params       jsonb NOT NULL DEFAULT '{}'::jsonb,       -- e.g. {"min_meals": 3}
  reward_coins integer NOT NULL CHECK (reward_coins >= 0),
  is_active    boolean NOT NULL DEFAULT true,
  sort_order   smallint NOT NULL DEFAULT 0
);

CREATE TABLE user_challenges (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id  smallint NOT NULL REFERENCES challenge_templates(id),
  period_start date NOT NULL,                             -- the day (daily) or Monday (weekly)
  progress     integer NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed_at timestamptz,
  claimed_at   timestamptz,
  coin_tx_id   bigint REFERENCES coin_transactions(id),
  PRIMARY KEY (user_id, template_id, period_start),
  CHECK (claimed_at IS NULL OR completed_at IS NOT NULL)
);
CREATE INDEX user_challenges_period_idx ON user_challenges (user_id, period_start DESC);

CREATE TABLE streak_milestones (
  days         integer PRIMARY KEY CHECK (days > 0),
  title        text NOT NULL,
  reward_coins integer NOT NULL CHECK (reward_coins >= 0),
  badge_key    text NOT NULL
);

CREATE TABLE user_streak_milestone_claims (
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_days    integer NOT NULL REFERENCES streak_milestones(days),
  streak_start_date date NOT NULL,                        -- identifies the run, so a later run can earn it again
  coin_tx_id        bigint NOT NULL REFERENCES coin_transactions(id),
  claimed_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, milestone_days, streak_start_date)
);

CREATE TABLE custom_foods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_user_id uuid NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    name text NOT NULL,
    servings numeric(6,2) NOT NULL
        CHECK (servings > 0),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX custom_foods_owner_idx
    ON custom_foods (owner_user_id);

CREATE TABLE custom_food_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    custom_food_id uuid NOT NULL
        REFERENCES custom_foods(id) ON DELETE CASCADE,

    food_id uuid NOT NULL
        REFERENCES foods(id),

    quantity numeric(8,2) NOT NULL
        CHECK (quantity > 0),

    measurement_type ingredient_measurement_t NOT NULL
        DEFAULT 'g',

    sort_order smallint NOT NULL
        DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX custom_food_ingredients_custom_food_idx
    ON custom_food_ingredients (custom_food_id);

CREATE INDEX custom_food_ingredients_food_idx
    ON custom_food_ingredients (food_id);

-- ---------------------------------------------------------------------
-- 11. TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------
-- updated_at
CREATE TRIGGER trg_users_upd    BEFORE UPDATE ON users                    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON user_profiles            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notif_upd    BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_foods_upd    BEFORE UPDATE ON foods                    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fnut_upd     BEFORE UPDATE ON food_nutrients           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fcomp_upd    BEFORE UPDATE ON food_components          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_meals_upd    BEFORE UPDATE ON meal_entries             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_items_upd    BEFORE UPDATE ON meal_items               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pal_upd      BEFORE UPDATE ON pal_profiles             FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- local_date: derive the user's calendar day from the timestamp unless the client supplied one
CREATE FUNCTION fill_local_date() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  ts timestamptz;
  tz text;
BEGIN
  IF NEW.local_date IS NULL THEN
    ts := (to_jsonb(NEW) ->> TG_ARGV[0])::timestamptz;
    SELECT timezone INTO tz FROM user_profiles WHERE user_id = NEW.user_id;
    NEW.local_date := (ts AT TIME ZONE COALESCE(tz, 'Asia/Kuala_Lumpur'))::date;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_meal_local_date   BEFORE INSERT ON meal_entries   FOR EACH ROW EXECUTE FUNCTION fill_local_date('consumed_at');
CREATE TRIGGER trg_water_local_date  BEFORE INSERT ON water_logs     FOR EACH ROW EXECUTE FUNCTION fill_local_date('logged_at');
CREATE TRIGGER trg_weight_local_date BEFORE INSERT ON weight_entries FOR EACH ROW EXECUTE FUNCTION fill_local_date('recorded_at');

-- streak cache (gaps-and-islands over days that have at least one meal)
CREATE FUNCTION recalc_user_streak(p_user uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_longest integer;
  v_current integer;
  v_last    date;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user) THEN RETURN; END IF;

  WITH d AS (
    SELECT summary_date,
           summary_date - (row_number() OVER (ORDER BY summary_date))::int AS grp
    FROM daily_summaries
    WHERE user_id = p_user AND meal_count > 0
  ), islands AS (
    SELECT count(*)::int AS len, max(summary_date) AS last_d FROM d GROUP BY grp
  )
  SELECT COALESCE(max(len), 0),
         COALESCE((SELECT len FROM islands ORDER BY last_d DESC LIMIT 1), 0),
         (SELECT max(last_d) FROM islands)
    INTO v_longest, v_current, v_last
  FROM islands;

  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_logged_date)
  VALUES (p_user, v_current, v_longest, v_last)
  ON CONFLICT (user_id) DO UPDATE
    SET current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_logged_date = EXCLUDED.last_logged_date,
        updated_at = now();
END $$;

-- daily roll-up used by Dashboard charts, challenges and streaks
CREATE FUNCTION refresh_daily_summary(p_user uuid, p_date date) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  m record;
  w integer;
  g record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user) THEN RETURN; END IF;   -- user being deleted

  SELECT COALESCE(sum(total_calories), 0)  AS cal,
         COALESCE(sum(total_protein_g), 0) AS pro,
         COALESCE(sum(total_carbs_g), 0)   AS carb,
         COALESCE(sum(total_fat_g), 0)     AS fat,
         COALESCE(sum(total_fiber_g), 0)   AS fib,
         count(*)::int                     AS cnt
    INTO m
  FROM meal_entries WHERE user_id = p_user AND local_date = p_date;

  SELECT COALESCE(sum(amount_ml), 0) INTO w
  FROM water_logs WHERE user_id = p_user AND local_date = p_date;

  IF m.cnt = 0 AND w = 0 THEN
    DELETE FROM daily_summaries WHERE user_id = p_user AND summary_date = p_date;
  ELSE
    SELECT target_calories, target_water_ml INTO g
    FROM user_goals
    WHERE user_id = p_user AND valid_from < (p_date + 1)::timestamptz
    ORDER BY valid_from DESC LIMIT 1;

    INSERT INTO daily_summaries AS s
      (user_id, summary_date, total_calories, total_protein_g, total_carbs_g, total_fat_g,
       total_fiber_g, meal_count, water_ml, calorie_target_kcal, water_target_ml)
    VALUES
      (p_user, p_date, m.cal, m.pro, m.carb, m.fat, m.fib, m.cnt, w, g.target_calories, g.target_water_ml)
    ON CONFLICT (user_id, summary_date) DO UPDATE
      SET total_calories = EXCLUDED.total_calories,
          total_protein_g = EXCLUDED.total_protein_g,
          total_carbs_g = EXCLUDED.total_carbs_g,
          total_fat_g = EXCLUDED.total_fat_g,
          total_fiber_g = EXCLUDED.total_fiber_g,
          meal_count = EXCLUDED.meal_count,
          water_ml = EXCLUDED.water_ml,
          calorie_target_kcal = EXCLUDED.calorie_target_kcal,
          water_target_ml = EXCLUDED.water_target_ml,
          updated_at = now();
  END IF;

  PERFORM recalc_user_streak(p_user);
END $$;

CREATE FUNCTION trg_meal_entries_summary() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM refresh_daily_summary(NEW.user_id, NEW.local_date);
  END IF;
  IF TG_OP = 'DELETE'
     OR (TG_OP = 'UPDATE' AND OLD.local_date IS DISTINCT FROM NEW.local_date) THEN
    PERFORM refresh_daily_summary(OLD.user_id, OLD.local_date);
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_meal_entries_summary
  AFTER INSERT OR UPDATE OF local_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g
     OR DELETE ON meal_entries
  FOR EACH ROW EXECUTE FUNCTION trg_meal_entries_summary();

CREATE FUNCTION trg_water_summary() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM refresh_daily_summary(NEW.user_id, NEW.local_date);
  END IF;
  IF TG_OP = 'DELETE'
     OR (TG_OP = 'UPDATE' AND OLD.local_date IS DISTINCT FROM NEW.local_date) THEN
    PERFORM refresh_daily_summary(OLD.user_id, OLD.local_date);
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_water_summary
  AFTER INSERT OR UPDATE OR DELETE ON water_logs
  FOR EACH ROW EXECUTE FUNCTION trg_water_summary();

-- meal totals = sum of items
CREATE FUNCTION recalc_meal_totals(p_meal uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE meal_entries m
     SET total_calories  = COALESCE(s.cal, 0),
         total_protein_g = COALESCE(s.pro, 0),
         total_carbs_g   = COALESCE(s.carb, 0),
         total_fat_g     = COALESCE(s.fat, 0),
         total_fiber_g   = COALESCE(s.fib, 0)
    FROM (SELECT sum(calories_kcal) AS cal, sum(protein_g) AS pro, sum(carbs_g) AS carb,
                 sum(fat_g) AS fat, sum(fiber_g) AS fib
            FROM meal_items WHERE meal_entry_id = p_meal) s
   WHERE m.id = p_meal;
END $$;

CREATE FUNCTION trg_meal_items_totals() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN PERFORM recalc_meal_totals(NEW.meal_entry_id); END IF;
  IF TG_OP = 'DELETE'
     OR (TG_OP = 'UPDATE' AND OLD.meal_entry_id IS DISTINCT FROM NEW.meal_entry_id) THEN
    PERFORM recalc_meal_totals(OLD.meal_entry_id);
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_meal_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON meal_items
  FOR EACH ROW EXECUTE FUNCTION trg_meal_items_totals();

-- coin ledger keeps pal_profiles.coin_balance in step (CHECK >= 0 blocks overspending)
CREATE FUNCTION trg_coin_apply() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE pal_profiles
     SET coin_balance = coin_balance + NEW.delta
   WHERE user_id = NEW.user_id
  RETURNING coin_balance INTO NEW.balance_after;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pal_profiles row missing for user %', NEW.user_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_coin_apply BEFORE INSERT ON coin_transactions
  FOR EACH ROW EXECUTE FUNCTION trg_coin_apply();

-- defaults created together with the profile at sign-up
CREATE FUNCTION trg_new_profile_defaults() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO notification_preferences (user_id) VALUES (NEW.user_id);
  INSERT INTO meal_reminder_times (user_id, meal_type, remind_at) VALUES
    (NEW.user_id, 'breakfast', '07:45'),
    (NEW.user_id, 'lunch',     '12:30'),
    (NEW.user_id, 'dinner',    '19:00');
  INSERT INTO pal_profiles (user_id) VALUES (NEW.user_id);
  INSERT INTO user_pal_items (user_id, item_id)
    SELECT NEW.user_id, id FROM pal_items WHERE is_default;
  INSERT INTO pal_equipped (user_id, slot, item_id)
    SELECT NEW.user_id, category, id FROM pal_items WHERE is_default AND category = 'scenery';
  RETURN NULL;
END $$;

CREATE TRIGGER trg_new_profile_defaults AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION trg_new_profile_defaults();

-- ---------------------------------------------------------------------
-- 12. VIEWS
-- ---------------------------------------------------------------------
CREATE VIEW v_current_goal AS
  SELECT * FROM user_goals WHERE valid_to IS NULL;

CREATE VIEW v_current_weight AS
  SELECT DISTINCT ON (user_id) user_id, weight_kg, bmi, recorded_at
  FROM weight_entries
  ORDER BY user_id, recorded_at DESC;

CREATE VIEW v_food_per_serving AS      -- what the Diary shows: nutrients for one serving
  SELECT f.id AS food_id, f.name, f.serving_size, f.serving_unit,
         round(n.calories_kcal * f.serving_size / 100, 1) AS calories_kcal,
         round(n.protein_g     * f.serving_size / 100, 1) AS protein_g,
         round(n.carbs_g       * f.serving_size / 100, 1) AS carbs_g,
         round(n.fat_g         * f.serving_size / 100, 1) AS fat_g,
         round(n.fiber_g       * f.serving_size / 100, 1) AS fiber_g
  FROM foods f JOIN food_nutrients n ON n.food_id = f.id
  WHERE f.deleted_at IS NULL;

CREATE VIEW v_user_streak AS           -- same rule as utils/streak.ts: alive if logged today or yesterday
  SELECT s.user_id,
         CASE WHEN s.last_logged_date >= (now() AT TIME ZONE p.timezone)::date - 1
              THEN s.current_streak ELSE 0 END AS current_streak,
         s.longest_streak,
         s.last_logged_date,
         (s.last_logged_date = (now() AT TIME ZONE p.timezone)::date) AS logged_today
  FROM user_streaks s JOIN user_profiles p USING (user_id);

-- ---------------------------------------------------------------------
-- 13. SEED DATA (taken from the current frontend constants)
-- ---------------------------------------------------------------------
INSERT INTO food_groups (code, name) VALUES
  ('carbs', 'Carbs'), ('protein', 'Protein'), ('fat', 'Fat'), ('dairy', 'Dairy'),
  ('fruit', 'Fruit'), ('vege', 'Vege'), ('beverage', 'Beverage'), ('other', 'Other');

INSERT INTO streak_milestones (days, title, reward_coins, badge_key) VALUES
  (3,  'Starter Spark',   30,  'bronze'),
  (7,  'Weekly Warrior',  80,  'silver'),
  (14, 'Habit Champion',  150, 'gold'),
  (30, 'Makan Legend',    300, 'crown');

INSERT INTO pal_items (code, name, category, price_coins, is_default, sort_order) VALUES
  ('shades',      'Cool Shades',         'eyes',      150, false, 10),
  ('round_specs', 'Retro Round Specs',   'eyes',      130, false, 20),
  ('crown',       'Royal Crown',         'hat',       350, false, 30),
  ('songkok',     'Classic Songkok',     'hat',       180, false, 40),
  ('straw_hat',   'Kampung Straw Hat',   'hat',       120, false, 50),
  ('sporty_band', 'Runner Headband',     'hat',       160, false, 60),
  ('chef_hat',    'Chef Toque',          'hat',       250, false, 70),
  ('bungaraya',   'Bunga Raya',          'hat',       200, false, 80),
  ('halo',        'Healthy Halo',        'hat',       500, false, 90),
  ('bowtie',      'Fancy Bowtie',        'accessory', 120, false, 100),
  ('gold_medal',  'Champion Gold Medal', 'accessory', 260, false, 110),
  ('teh_tarik',   'Boba Teh Tarik Cup',  'accessory', 180, false, 120),
  ('bg_garden',   'Zen Garden',          'scenery',   0,   true,  200),
  ('bg_picnic',   'Cozy Picnic',         'scenery',   180, false, 210),
  ('bg_forest',   'Rainforest',          'scenery',   240, false, 220),
  ('bg_beach',    'Sunny Beach',         'scenery',   280, false, 230),
  ('bg_night',    'Campfire Night',      'scenery',   350, false, 240);

INSERT INTO challenge_templates (code, title, description, period, kind, metric, target, params, reward_coins, sort_order) VALUES
  ('d1', 'Get Started',      'Log your first meal today',                        'daily',  'consistent', 'meals_logged',      1, '{}',                 50, 10),
  ('d2', 'Stay Consistent',  'Log 3 meals today',                                'daily',  'consistent', 'meals_logged',      3, '{}',                 50, 20),
  ('d3', 'Calorie Balance',  'Log 3 meals and stay within your calorie goal',    'daily',  'balance',    'calorie_goal_days', 1, '{"min_meals": 3}',   80, 30),
  ('w1', 'Keep the streak',  'Stay active 5 days',                               'weekly', 'consistent', 'days_logged',       5, '{}',                 50, 40),
  ('w2', 'Hydration',        'Hit your water target 5 days',                     'weekly', 'mindful',    'water_goal_days',   5, '{}',                 40, 50),
  ('w3', 'Calorie Control',  'Stay within your calorie goal 5 days',             'weekly', 'balance',    'calorie_goal_days', 5, '{"min_meals": 1}',   80, 60),
  ('w4', 'Track Progress',   'Log your weight',                                  'weekly', 'mindful',    'weight_entries',    1, '{}',                 30, 70);