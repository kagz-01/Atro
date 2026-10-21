-- Step 17: reflection — an enquiry has an owner.
--
-- The funnel already carried contacted/quoted/won/lost in `status`, but nothing
-- recorded *who* is working a lead: two people could call the same prospect, or
-- a lead could sit because each assumed the other had it. `assigned_to` is the
-- staff email of whoever claimed it; empty means unclaimed. Claiming is
-- deliberate (a button), and the first person to move a lead along the funnel
-- claims it on their behalf — the alternative is a shared pile with no names.
alter table enquiries add column if not exists assigned_to text not null default '';
