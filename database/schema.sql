create table if not exists payment_links (
  id text primary key,
  type text not null default 'payment-link',
  title text not null,
  amount text not null,
  amount_lamports bigint not null,
  token text not null default 'SOL',
  network text not null,
  status text not null,
  views integer not null default 0,
  date text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  expires_at timestamptz not null,
  expiry_minutes integer not null,
  creator text,
  recipient text,
  note text,
  deposit_signature text,
  withdraw_signature text
);

create index if not exists payment_links_creator_idx on payment_links (creator);
create index if not exists payment_links_status_idx on payment_links (status);

create table if not exists private_payments (
  id text primary key,
  type text not null default 'private-payment',
  owner_wallet text,
  recipient text,
  amount text not null,
  amount_lamports bigint not null,
  token text not null default 'SOL',
  network text not null,
  status text not null,
  date text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  note text,
  deposit_signature text not null,
  withdraw_signature text
);

create index if not exists private_payments_owner_wallet_idx on private_payments (owner_wallet);
create index if not exists private_payments_status_idx on private_payments (status);
