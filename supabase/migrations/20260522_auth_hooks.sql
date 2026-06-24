-- Migration: Configure Auth Hook for Welcome Email
-- Run this in Supabase SQL Editor or via: supabase db push
--
-- This creates a database trigger that calls the welcome-email edge function
-- whenever a new user signs up via Supabase Auth.

-- Enable pg_net extension (required for HTTP calls from triggers)
create extension if not exists pg_net with schema extensions;

-- Create a function that calls the welcome-email edge function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  request_id bigint;
begin
  -- Call the welcome-email edge function via pg_net
  select net.http_post(
    url := 'https://ocivkbocmywinwqmaqac.supabase.co/functions/v1/welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'signup',
      'user', jsonb_build_object(
        'id', new.id,
        'email', new.email,
        'user_metadata', new.raw_user_meta_data
      )
    )
  ) into request_id;

  return new;
end;
$$;

-- Create trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Usage limit notification ──
-- Triggers when user_usage.used_percent reaches thresholds

create or replace function public.notify_usage_threshold()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  request_id bigint;
  user_email text;
begin
  -- Only notify on 80% and 100% (not every update)
  if new.used_percent < 80 or old.used_percent >= new.used_percent then
    return new;
  end if;

  -- Get user email
  select email into user_email from auth.users where id = new.user_id;

  -- Call notification edge function
  select net.http_post(
    url := 'https://ocivkbocmywinwqmaqac.supabase.co/functions/v1/usage-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'user_id', new.user_id,
      'email', user_email,
      'used_percent', new.used_percent,
      'plan_type', new.plan_type
    )
  ) into request_id;

  return new;
end;
$$;

-- Create trigger on user_usage updates
drop trigger if exists on_usage_threshold on public.user_usage;
create trigger on_usage_threshold
  after update of used_percent on public.user_usage
  for each row execute procedure public.notify_usage_threshold();
