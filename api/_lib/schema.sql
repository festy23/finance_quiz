create table if not exists users (
  id          bigserial primary key,
  telegram_id bigint unique not null,
  username    text,
  first_name  text,
  last_name   text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

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
  token       text primary key,
  telegram_id bigint,
  username    text,
  first_name  text,
  last_name   text,
  photo_url   text,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);
