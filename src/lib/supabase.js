/**
 * The only place the site talks to a server it writes to.
 *
 * Deliberately hand-rolled rather than @supabase/supabase-js. The whole surface
 * this site needs is "POST a JSON body to one RPC endpoint", which is fifteen
 * lines of fetch. Pulling in the SDK would add a production dependency, weight
 * to a bundle that currently gzips to 90kB, and a new thing to keep at zero
 * npm-audit findings, all to wrap a call we can write out in full.
 *
 * THE ANON KEY IS PUBLIC AND THAT IS FINE.
 *
 * VITE_ values are inlined into the client bundle, so this key is readable by
 * anyone who views source. That is how Supabase is designed: the key identifies
 * the project, and what it may actually DO is decided by row-level security.
 * supabase/schema.sql enables RLS on both tables and grants the anon role no
 * policy at all, so this key can reach exactly two functions and nothing else.
 * It cannot read the roster, because no function returns one.
 *
 * If someone ever adds a permissive policy or a service-role key to this file,
 * that reasoning collapses. The service_role key must NEVER appear in this
 * repository or in any VITE_ variable.
 */

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Whether attendance can work at all in this build.
 *
 * Follows the pattern the rest of the site already uses for optional
 * configuration (hasCalendar, the pitch form's ACCESS_KEY): absent config is a
 * designed state, not a crash. The page renders an explanatory panel instead of
 * a form that would post into the void.
 */
export const hasBackend = Boolean(URL_BASE && ANON_KEY);

/** Network or configuration failure, as distinct from a rejected check-in. */
export class BackendError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "BackendError";
    this.cause = cause;
  }
}

/**
 * Call a Postgres function exposed through PostgREST.
 *
 * `args` is the function's named parameters. PostgREST maps a JSON body onto
 * them by name, which is why the SQL parameters are p_-prefixed: it keeps them
 * from colliding with column names inside the function body.
 *
 * @param {string} fn    function name, e.g. "check_in"
 * @param {object} args  named arguments
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<any>} the function's return value, already JSON-parsed
 */
export async function rpc(fn, args = {}, options = {}) {
  if (!hasBackend) {
    throw new BackendError("Attendance backend is not configured.");
  }

  let res;
  try {
    res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(args),
      signal: options.signal,
    });
  } catch (cause) {
    // Offline, DNS, or blocked by the CSP. All indistinguishable from here and
    // all mean the same thing to the person standing in the room.
    throw new BackendError("Could not reach the server.", cause);
  }

  if (!res.ok) {
    // PostgREST puts the useful part in `message`; keep it for the console but
    // never render it, since it can name schema internals.
    const detail = await res.json().catch(() => ({}));
    throw new BackendError(
      `Request failed (${res.status}).`,
      detail.message || detail.hint || null
    );
  }

  return res.json();
}
