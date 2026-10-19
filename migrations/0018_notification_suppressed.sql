-- The delivery log told half the truth.
--
-- A channel the client switched off was filtered out before the insert, so
-- consent left no trace at all: the log showed what was tried and what failed,
-- never what was forbidden. 'suppressed' records the difference between "we
-- did not want to send it" and "we were not allowed to" — which is the whole
-- point of asking for consent in the first place.

alter table portal_notification
  drop constraint if exists portal_notification_status_check;

alter table portal_notification
  add constraint portal_notification_status_check
  check (status in ('pending', 'sent', 'skipped', 'failed', 'suppressed'));
