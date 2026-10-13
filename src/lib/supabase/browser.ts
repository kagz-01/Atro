"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client.
 *
 * Holds the session in localStorage and refreshes it automatically, so a client
 * who stays signed in on a phone does not have to re-enter a code on every
 * visit. Sign-in itself goes through `phone.ts` in this folder.
 */

let client: SupabaseClient | null = null;

/**
 * The live client, or `null` when Supabase is not configured.
 *
 * Callers must handle `null`: a deployment missing its keys should render a
 * clear "sign-in is unavailable" message rather than throw inside a render.
 */
export function supabaseBrowser(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) return null;

  client ??= createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "atro-supabase-auth",
    },
  });
  return client;
}

/**
 * Send a sign-in code to a phone number.
 *
 * `shouldCreateUser: true` makes this double as sign-up: a number that has never
 * signed in gets an account on first use. That matters here because most
 * clients arrive from an enquiry and have never had an account before.
 *
 * Returns the error instead of throwing so the UI can show it.
 */
export async function sendPhoneOtp(phone: string): Promise<{ error: string | null }> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    return { error: "Sign-in is not configured on this deployment." };
  }
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  return { error: error ? error.message : null };
}

/** Exchange the code the client received for a session. */
export async function verifyPhoneOtp(
  phone: string,
  token: string,
): Promise<{ error: string | null }> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    return { error: "Sign-in is not configured on this deployment." };
  }
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  return { error: error ? error.message : null };
}

/** The signed-in user's id and email, or `null`. */
export async function currentSupabaseUser(): Promise<{
  id: string;
  email: string | null;
  phone: string | null;
} | null> {
  const supabase = supabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return null;
  return { id: user.id, email: user.email ?? null, phone: user.phone ?? null };
}

export async function signOutSupabase(): Promise<void> {
  await supabaseBrowser()?.auth.signOut();
}