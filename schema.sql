PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  developer TEXT,
  regions TEXT NOT NULL DEFAULT 'SEA,Asia,Global',
  official_url TEXT,
  source_url TEXT,
  logo_url TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('event','patch','maintenance','banner','reset')),
  region TEXT NOT NULL DEFAULT 'Global',
  starts_at TEXT,
  ends_at TEXT,
  source_url TEXT,
  source_name TEXT,
  verified_at TEXT,
  status TEXT NOT NULL DEFAULT 'unconfirmed'
    CHECK (status IN ('scheduled','active','ended','unconfirmed')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_game_id ON events(game_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_ends_at ON events(ends_at);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region);

INSERT OR IGNORE INTO games (slug,name,short_name,developer,regions,official_url,source_url) VALUES
('genshin-impact','Genshin Impact','Genshin','HoYoverse','SEA,Asia,Global','https://genshin.hoyoverse.com/','https://genshin.hoyoverse.com/'),
('honkai-star-rail','Honkai: Star Rail','HSR','HoYoverse','SEA,Asia,Global','https://hsr.hoyoverse.com/','https://hsr.hoyoverse.com/'),
('zenless-zone-zero','Zenless Zone Zero','ZZZ','HoYoverse','SEA,Asia,Global','https://zenless.hoyoverse.com/','https://zenless.hoyoverse.com/'),
('wuthering-waves','Wuthering Waves','WuWa','Kuro Games','SEA,Asia,Global','https://wutheringwaves.kurogames.com/','https://wutheringwaves.kurogames.com/'),
('arknights','Arknights','AK','Hypergryph / Yostar','SEA,Asia,Global','https://www.arknights.global/','https://www.arknights.global/'),
('punishing-gray-raven','Punishing: Gray Raven','PGR','Kuro Games','SEA,Asia,Global','https://pgr.kurogame.net/','https://pgr.kurogame.net/'),
('fate-grand-order','Fate/Grand Order','FGO','Aniplex','Asia,Global','https://fate-go.us/','https://fate-go.us/'),
('nikke','GODDESS OF VICTORY: NIKKE','NIKKE','Level Infinite','SEA,Asia,Global','https://nikke-en.com/','https://nikke-en.com/'),
('blue-archive','Blue Archive','BA','NEXON Games','SEA,Asia,Global','https://bluearchive.nexon.com/','https://bluearchive.nexon.com/'),
('love-and-deepspace','Love and Deepspace','LaDS','Infold Games','SEA,Asia,Global','https://loveanddeepspace.infoldgames.com/','https://loveanddeepspace.infoldgames.com/');

-- Intentionally no fabricated event times are inserted.
