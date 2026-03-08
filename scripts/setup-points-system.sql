-- Migration: Système de points OnlyMatt
-- Création des tables pour boutique de points avec PayPal

-- 1. Packages de points vendus
CREATE TABLE IF NOT EXISTS point_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price_usd REAL NOT NULL,
  paypal_plan_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configuration globale des valeurs de points (modulable pour promos)
CREATE TABLE IF NOT EXISTS point_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Une seule ligne de config
  point_dollar_value REAL DEFAULT 0.10,   -- 1pt = 0.10$ (ajustable)
  point_minutes_value INTEGER DEFAULT 6,  -- 1pt = 6min (ajustable)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Soldes utilisateurs par email (Google Auth)
CREATE TABLE IF NOT EXISTS user_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Historique des transactions de points
CREATE TABLE IF NOT EXISTS point_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'bonus')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata TEXT,  -- JSON: {project, paypal_order_id, package_id, etc.}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Coût en points par projet
CREATE TABLE IF NOT EXISTS project_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sessions (table existante - vérifier si existe avant de créer)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  project_slug TEXT,
  points_spent INTEGER,
  ip_address TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_balances_email ON user_balances(email);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON point_transactions(email);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_project_costs_slug ON project_costs(project_slug);

-- Data initial: Configuration par défaut
INSERT INTO point_config (id, point_dollar_value, point_minutes_value, updated_at)
VALUES (1, 0.10, 6, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

-- Data initial: Packages par défaut
INSERT INTO point_packages (name, points, price_usd, active) VALUES
  ('Pack Starter', 50, 5.00, true),
  ('Pack Standard', 200, 15.00, true),
  ('Pack Premium', 500, 30.00, true)
ON CONFLICT DO NOTHING;

-- Data initial: Projets exemple
INSERT INTO project_costs (project_slug, project_name, points_required, active) VALUES
  ('only-surrr', 'ONLY SURRR', 10, true),
  ('super-videotheque', 'Super Vidéothèque', 50, true),
  ('only-coach', 'Only Coach', 20, true)
ON CONFLICT(project_slug) DO NOTHING;

-- Afficher les tables créées
SELECT 'Tables created successfully:' as status;
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'point_%' OR name LIKE 'user_%' OR name LIKE 'project_%' OR name = 'sessions';
