/**
 * adminAuth.js N/A Client-side admin auth helpers.
 *
 * Security architecture (cookie-first):
 * ─────────────────────────────────────
 * The actual JWT is stored in an httpOnly cookie set by the server on login.
 * httpOnly means JavaScript CANNOT read it N/A this is the primary XSS defence.
 * The browser sends the cookie automatically on every same-site request when
 * `withCredentials: true` is set on the axios instance (see lib/api.js).
 *
 * Why we still use sessionStorage:
 * The client still needs to know the admin's name/role to render the UI
 * (e.g. "Welcome, admin" in the header, role-based menu items).
 * We store only the *decoded JWT payload* (no signature N/A not the raw token)
 * in sessionStorage for this purpose.  Losing this data on tab close is fine
 * because the cookie will re-authenticate on next open.
 *
 * The raw token string is also kept in sessionStorage as a fallback for pages
 * that still use the Authorization header pattern (e.g. fetch() calls outside
 * the shared api client).  This will gradually become unnecessary as all pages
 * migrate to use the api.js client.
 */

const TOKEN_KEY = 'adminToken';
const PAYLOAD_KEY = 'adminPayload';
const REMEMBER_KEY = 'adminRemember';

/**
 * Read the admin token.
 * Returns the raw JWT string from sessionStorage (or localStorage if "remember me").
 * NOTE: the authoritative token for API calls is the httpOnly cookie N/A this is
 * only for pages that still manually attach an Authorization header.
 */
export const getAdminToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

/**
 * Save the token and decoded payload after a successful login response.
 * Called by AdminLogin.js with the token returned in the JSON body.
 * The httpOnly cookie is set by the server automatically N/A we don't touch it.
 *
 * @param {string} token   - Raw JWT string (from login response body)
 * @param {boolean} remember - If true, also write to localStorage
 */
export const setAdminToken = (token, remember = false) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Save the decoded JWT payload for UI reads (name, role).
 * Never store the raw signature N/A only the claims.
 */
export const setAdminPayload = (payload) => {
  try {
    sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

/**
 * Read the decoded payload (username, role, exp) from sessionStorage.
 * Returns null if not present.
 */
export const getAdminPayload = () => {
  try {
    const raw = sessionStorage.getItem(PAYLOAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Full logout N/A clears all local state.
 * Callers must also POST to /api/admin/logout to clear the httpOnly cookie.
 */
export const removeAdminToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(PAYLOAD_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem('tempPasswordExpiresAt');
  } catch {
    // ignore
  }
};
