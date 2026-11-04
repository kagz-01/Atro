create table if not exists enquiry_upload_session (
  enquiry_id uuid primary key references enquiries (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists enquiry_attachment (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries (id) on delete cascade,
  filename text not null,
  mime text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists enquiry_attachment_enquiry_idx
  on enquiry_attachment (enquiry_id, created_at)
  where deleted_at is null;
