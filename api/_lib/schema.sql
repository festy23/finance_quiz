create table if not exists users (
  id          bigserial primary key,
  telegram_id bigint unique not null,
  username    text,
  first_name  text,
  last_name   text,
  photo_url   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table users add column if not exists avatar_url text;

create table if not exists attempts (
  id         text primary key,
  user_id    bigint not null references users(id) on delete cascade,
  mode       text not null,
  topic      text,
  score      int  not null,
  total      int  not null,
  qids       jsonb not null,
  answers    jsonb not null,
  spark      jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_idx on attempts(user_id, created_at desc);

create table if not exists qstats (
  user_id     bigint not null references users(id) on delete cascade,
  question_id text not null,
  seen        int not null default 0,
  correct     int not null default 0,
  primary key (user_id, question_id)
);

create table if not exists wrong (
  user_id     bigint not null references users(id) on delete cascade,
  question_id text not null,
  primary key (user_id, question_id)
);

create table if not exists days (
  user_id  bigint not null references users(id) on delete cascade,
  day      date not null,
  answered int not null default 0,
  primary key (user_id, day)
);

create table if not exists user_meta (
  user_id     bigint primary key references users(id) on delete cascade,
  best_streak int not null default 0,
  tt_best     int
);

create table if not exists login_tokens (
  token        text primary key,
  telegram_id  bigint,
  username     text,
  first_name   text,
  last_name    text,
  photo_url    text,
  status       text not null default 'pending',
  browser_hash text,
  created_at   timestamptz not null default now()
);

alter table login_tokens add column if not exists browser_hash text;

-- ── multi-quiz namespacing ───────────────────────────────────────────────
-- Существующие строки = финансовый квиз; новым колонкам ставим default 'finance'.

alter table attempts add column if not exists quiz_id text not null default 'finance';
create index if not exists attempts_user_quiz_idx on attempts(user_id, quiz_id, created_at desc);

alter table qstats add column if not exists quiz_id text not null default 'finance';
alter table qstats drop constraint if exists qstats_pkey;
alter table qstats add primary key (user_id, quiz_id, question_id);

alter table wrong add column if not exists quiz_id text not null default 'finance';
alter table wrong drop constraint if exists wrong_pkey;
alter table wrong add primary key (user_id, quiz_id, question_id);

alter table days add column if not exists quiz_id text not null default 'finance';
alter table days drop constraint if exists days_pkey;
alter table days add primary key (user_id, quiz_id, day);

alter table user_meta add column if not exists quiz_id text not null default 'finance';
alter table user_meta drop constraint if exists user_meta_pkey;
alter table user_meta add primary key (user_id, quiz_id);
