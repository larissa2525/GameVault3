-- Seed data for GameVault
-- Run this in Supabase SQL editor or via psql

-- Demo profile
INSERT INTO profiles (id, nickname, avatar_url, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'DemoPlayer', NULL, now())
ON CONFLICT (id) DO NOTHING;

-- Demo jogos
INSERT INTO jogos (id, user_id, nome, plataforma, genero, nota, status, capa_url, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'The Witcher 3: Wild Hunt', 'PC', 'RPG', 9.8, 'Concluído', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg', now(), now()),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Elden Ring', 'PS5', 'RPG', 9.5, 'Jogando', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg', now(), now()),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Hades', 'Nintendo Switch', 'Ação', 9.2, 'Concluído', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co27vp.jpg', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Optional: verify
SELECT 'seed_complete' as status;
