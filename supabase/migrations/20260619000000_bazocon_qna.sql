create extension if not exists pgcrypto;

create table public.bazocon_sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  speaker text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  kind text not null check (kind in ('setup', 'entry', 'opening', 'talk', 'break', 'networking', 'closing', 'cleanup')),
  sort_order integer not null,
  is_public_qna_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bazocon_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.bazocon_sessions(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 500),
  nickname text not null default '익명',
  status text not null default 'visible' check (status in ('visible', 'hidden', 'answered')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bazocon_question_votes (
  question_id uuid not null references public.bazocon_questions(id) on delete cascade,
  visitor_id_hash text not null,
  created_at timestamptz not null default now(),
  primary key (question_id, visitor_id_hash)
);

create table public.bazocon_event_state (
  id boolean primary key default true check (id),
  current_session_id uuid references public.bazocon_sessions(id) on delete set null,
  notice text,
  updated_at timestamptz not null default now()
);

create table public.bazocon_admin_actions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.bazocon_questions(id) on delete set null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.bazocon_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bazocon_questions_set_updated_at
before update on public.bazocon_questions
for each row execute function public.bazocon_set_updated_at();

alter table public.bazocon_sessions enable row level security;
alter table public.bazocon_questions enable row level security;
alter table public.bazocon_question_votes enable row level security;
alter table public.bazocon_event_state enable row level security;
alter table public.bazocon_admin_actions enable row level security;

create policy "public read bazocon_sessions"
on public.bazocon_sessions for select
to anon
using (true);

create policy "public read visible bazocon_questions"
on public.bazocon_questions for select
to anon
using (status in ('visible', 'answered'));

create policy "public read votes for visible bazocon_questions"
on public.bazocon_question_votes for select
to anon
using (
  exists (
    select 1
    from public.bazocon_questions q
    where q.id = bazocon_question_votes.question_id
      and q.status in ('visible', 'answered')
  )
);

create policy "public read event state"
on public.bazocon_event_state for select
to anon
using (true);

create policy "no public admin action access"
on public.bazocon_admin_actions for select
to anon
using (false);

grant select on public.bazocon_sessions to anon;
grant select on public.bazocon_questions to anon;
grant select on public.bazocon_question_votes to anon;
grant select on public.bazocon_event_state to anon;

insert into public.bazocon_sessions (slug, title, speaker, starts_at, ends_at, kind, sort_order, is_public_qna_enabled)
values
  ('entry', '입장', null, '2026-06-20 13:30:00+09', '2026-06-20 14:00:00+09', 'entry', 10, false),
  ('opening', '오프닝', null, '2026-06-20 14:00:00+09', '2026-06-20 14:05:00+09', 'opening', 20, false),
  ('ranolp-adt-church-encoding', 'Algebraic Data Type for FUN', 'RanolP', '2026-06-20 14:10:00+09', '2026-06-20 14:30:00+09', 'talk', 30, true),
  ('helloyunho-playstation-shell', '바보같은 PlayStation 셸', 'Helloyunho', '2026-06-20 14:40:00+09', '2026-06-20 15:00:00+09', 'talk', 40, true),
  ('sunmin-neuro-developer', '신경질환자, 개발자로 살아남기', '김선민', '2026-06-20 15:10:00+09', '2026-06-20 15:30:00+09', 'talk', 50, true),
  ('sudori-game-overlay', '나만의 고성능 게임 오버레이 만들기', '스도리', '2026-06-20 15:40:00+09', '2026-06-20 16:00:00+09', 'talk', 60, true),
  ('hong-minhee-gukhanmun', 'Gukhanmun: 國漢文을 한글로 바꾸기', '홍민희', '2026-06-20 16:10:00+09', '2026-06-20 16:30:00+09', 'talk', 70, true),
  ('lightning-margin', '라이트닝 토크', null, '2026-06-20 16:30:00+09', '2026-06-20 16:55:00+09', 'break', 80, false),
  ('closing', '기념 촬영', null, '2026-06-20 16:55:00+09', '2026-06-20 17:00:00+09', 'closing', 90, false),
  ('networking', '피자를 먹으며 네트워킹', null, '2026-06-20 17:00:00+09', '2026-06-20 19:00:00+09', 'networking', 100, false);

insert into public.bazocon_event_state (id, current_session_id, notice)
values (true, null, null)
on conflict (id) do nothing;

alter publication supabase_realtime add table public.bazocon_sessions;
alter publication supabase_realtime add table public.bazocon_questions;
alter publication supabase_realtime add table public.bazocon_question_votes;
alter publication supabase_realtime add table public.bazocon_event_state;
