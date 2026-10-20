-- The outbox learns the client's clock.
--
-- Two additive columns, both nullable so every existing row keeps behaving
-- exactly as it did — a null deliver_after means "not held": the old inline
-- attempt, or a row that was never eligible for deferral (in-app, the studio's
-- own audience, suppressed channels).
--
--   deliver_after   when a held row becomes due. notify() computes it from
--                   the client's own zone: outside 08:00–20:00 there, the
--                   push channels wait for their morning instead of landing
--                   on a phone at three in the morning.
--   document_url    the deep link a drained email still needs. It was only
--                   ever held in memory before, which a row that defers past
--                   the request cannot keep.
--
-- The partial index exists for exactly one query shape — the drain's "pending
-- and now due" scan — and stays tiny because settled rows fall out of it.

alter table portal_notification add column deliver_after timestamptz;
alter table portal_notification add column document_url text;

create index portal_notification_due_idx on portal_notification (deliver_after)
  where status = 'pending' and deliver_after is not null;
