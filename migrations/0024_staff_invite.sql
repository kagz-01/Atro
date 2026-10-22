-- Invitations: the studio opens the console by sending a door someone can
-- walk through, instead of waiting for them to notice the door and ask.
--
-- Until now access moved one way: grant, now; or request, wait for an admin.
-- The missing middle is an invitation — the boss sends one to an address, and
-- the console opens the first time that address signs in and accepts it. The
-- row holds the promise, the sender, and the note so the accept screen can
-- say who opened the door.
--
-- An invitation never carries `admin`. It only ever resolves to `staff`;
-- promoting someone to admin is the deliberate second decision on the Access
-- screen, so a forwarded invitation can at most open the staff side of the
-- console. Accepting also never lowers a role already held (see
-- roleAfterAccept): if the boss granted a role by hand while the invitation
-- was still open, accepting must not undo it.
--
-- `status` keeps the trail after the door is used or withdrawn, mirroring
-- staff_request's decided rows. One OPEN invitation per address — re-sending
-- updates the pending row in place rather than stacking duplicates.

create table if not exists staff_invite (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by text not null default '',
  note text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create unique index if not exists staff_invite_pending_idx
  on staff_invite (lower(email)) where status = 'pending';

create index if not exists staff_invite_status_idx
  on staff_invite (status, created_at);
