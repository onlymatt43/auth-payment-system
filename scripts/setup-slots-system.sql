-- Slot Machine System Tables

-- Table pour les spins des utilisateurs
CREATE TABLE IF NOT EXISTS user_spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  spin_cost INTEGER DEFAULT 0,
  spin_result INTEGER NOT NULL,
  reels TEXT NOT NULL,
  multiplier REAL DEFAULT 1.0,
  is_jackpot BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Table pour tracker les spins gratuits journaliers
CREATE TABLE IF NOT EXISTS daily_free_spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  last_free_spin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  spins_used_today INTEGER DEFAULT 1,
  
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_spins_user_id ON user_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_spins_created_at ON user_spins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_free_spins_user_id ON daily_free_spins(user_id);
