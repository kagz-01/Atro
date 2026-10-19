-- The next call, as a moment rather than a sentence.
--
-- `next_call_when` holds "Friday 14 March, 15:00 EAT" — a line written for a
-- person to read. The client's own timezone (their profile, or where the
-- project says they live) makes "your time" a real conversion, and a
-- conversion needs an actual instant: 15:00 Nairobi is 12:00 in London on one
-- date and 13:00 a fortnight later, depending on the clocks the sentence never
-- mentions. The sentence stays for display; this is the value arithmetic runs
-- on. Nullable — projects created before this existed simply have no instant
-- to convert, and the portal says nothing rather than guessing.

alter table portal_projects add column if not exists next_call_at timestamptz;
