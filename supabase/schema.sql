-- Supabase schema for GameVault
-- Run this in Supabase SQL editor or via supabase CLI

create table if not exists profiles (
  id uuid primary key,
  nickname text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists jogos (
  id uuid primary key,
  user_id uuid references profiles(id) on delete cascade,
  nome text not null,
  plataforma text not null,
  genero text not null,
  nota numeric not null,
  status text not null,
  capa_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_jogos_user on jogos(user_id);