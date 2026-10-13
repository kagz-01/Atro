import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients (server-only).
 *
 * Two clients, deliberately:
 *   - `supabaseAnon`  verifies the caller's JWT and honours row-level security.
 *     This is what every request that reads client data must use.
 *   - `supabaseAdmin` bypasses row-level security. Only for work the caller has
 *     already authorised — provisioning, staff roles — never for returning one
 *     client's rows to another.
 */

import { anonKeyValue, projectUrl, serviceRoleKeyValue } from "./config";

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function supabaseAnon(): SupabaseClient | null {
  if (!projectUrl || !anonKeyValue) return null;
  anonClient ??= createClient(projectUrl, anonKeyValue, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}

export function supabaseAdmin(): SupabaseClient | null {
  if (!projectUrl || !serviceRoleKeyValue) return null;
  adminClient ??= createClient(projectUrl, serviceRoleKeyValue, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

/**
 * Resolve the user behind an access token, or `null` when the token is absent,
 * malformed or expired.
 *
 * Always asks Supabase Auth rather than decoding the JWT locally: the point of
 * verification is that a client cannot mint its own user id, and decoding a
 * self-supplied token proves nothing.
 */
export async function verifyAccessToken(
  token: string | null | undefined,
): Promise<{ id: string; email: string | null; phone: string | null } | null> {
  if (!token) return null;
  const supabase = supabaseAnon();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      phone: data.user.phone ?? null,
    };
  } catch {
    return null;
  }
}