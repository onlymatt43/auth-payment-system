-- Canonical database schema for auth-payment-system
-- Source of truth for local/prod initialization and migrations.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified DATETIME,
  image TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  expires DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires DATETIME NOT NULL,
  PRIMARY KEY(identifier, token)
);

CREATE TABLE IF NOT EXISTS users_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  description TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS point_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price_usd REAL NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  spin_cost INTEGER DEFAULT 0,
  spin_result INTEGER NOT NULL,
  reels TEXT NOT NULL,
  multiplier REAL DEFAULT 1.0,
  is_jackpot BOOLEAN DEFAULT 0,
  is_paid_spin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_free_spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  last_free_spin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  spins_used_today INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS project_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storefront_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  price_label TEXT,
  cta_label TEXT,
  cta_url TEXT,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'none',
  badge TEXT,
  active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_points_user_id ON users_points(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_spins_user_id ON user_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_spins_created_at ON user_spins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_free_spins_user_id ON daily_free_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_slug ON project_costs(project_slug);
CREATE INDEX IF NOT EXISTS idx_storefront_items_active_sort ON storefront_items(active, sort_order, id);

INSERT OR IGNORE INTO point_packages (name, points, price_usd, description, active)
VALUES ('Starter Pack', 50, 5.00, 'Perfect for trying out', 1);

INSERT OR IGNORE INTO point_packages (name, points, price_usd, description, active)
VALUES ('Standard Pack', 250, 10.00, 'Most popular choice', 1);

INSERT OR IGNORE INTO point_packages (name, points, price_usd, description, active)
VALUES ('Premium Pack', 1000, 50.00, 'Best value', 1);

INSERT OR IGNORE INTO point_packages (name, points, price_usd, description, active)
VALUES ('VIP Pack', 5000, 200.00, 'Maximum value', 1);

INSERT OR IGNORE INTO project_costs (project_slug, project_name, points_required, active)
VALUES ('only-surrr', 'ONLY SURRR', 10, 1);

INSERT OR IGNORE INTO project_costs (project_slug, project_name, points_required, active)
VALUES ('super-videoteque', 'Super Vidéothèque', 50, 1);

INSERT OR IGNORE INTO project_costs (project_slug, project_name, points_required, active)
VALUES ('only-coach', 'Only Coach', 20, 1);
