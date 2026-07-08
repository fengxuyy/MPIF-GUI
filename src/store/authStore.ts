import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrcidUser {
  orcid: string;        // e.g. "0000-0001-2345-6789"
  name: string;
  email: string;
  accessToken: string;
}

interface AuthStore {
  user: OrcidUser | null;
  isLoading: boolean;
  error: string | null;

  /** Redirect the browser to the ORCID authorization page. */
  login: () => void;

  /**
   * Called on the /orcid-callback route. Parses the URL hash fragment,
   * fetches the public person record, and persists the user.
   * Returns true on success, false on failure.
   */
  handleCallback: () => Promise<boolean>;

  /** Clear the session. */
  logout: () => void;
}

// ---------------------------------------------------------------------------
// ORCID config (from .env.local)
// ---------------------------------------------------------------------------

const CLIENT_ID  = import.meta.env.VITE_ORCID_CLIENT_ID  as string | undefined;
const REDIRECT   = import.meta.env.VITE_ORCID_REDIRECT_URI as string | undefined;
const IS_SANDBOX = import.meta.env.VITE_ORCID_SANDBOX === 'true';

const ORCID_BASE   = IS_SANDBOX ? 'https://sandbox.orcid.org'    : 'https://orcid.org';
const ORCID_API    = IS_SANDBOX ? 'https://pub.sandbox.orcid.org' : 'https://pub.orcid.org';

// localStorage key
const STORAGE_KEY = 'mpif-gui:orcid-user:v1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NONCE_KEY = 'mpif-gui:orcid-nonce';

function generateNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function loadStoredUser(): OrcidUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrcidUser;
  } catch {
    return null;
  }
}

function persistUser(user: OrcidUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Call /oauth/userinfo to get orcid iD + basic profile (requires openid scope)
// ---------------------------------------------------------------------------
async function fetchOrcidUserinfo(accessToken: string): Promise<{ orcid: string; name: string; email: string }> {
  const res = await fetch(`${ORCID_BASE}/oauth/userinfo`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error(`ORCID userinfo error: ${res.status}`);
  const data = await res.json();
  return {
    orcid: data.sub ?? '',
    name:  data.name || [data.given_name, data.family_name].filter(Boolean).join(' '),
    email: data.email ?? '',
  };
}

// ---------------------------------------------------------------------------
// Fetch the ORCID public person record (name + email)
// ---------------------------------------------------------------------------

async function fetchOrcidPerson(orcid: string, accessToken: string): Promise<{ name: string; email: string }> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const res = await fetch(`${ORCID_API}/v3.0/${orcid}/person`, { headers });
  if (!res.ok) throw new Error(`ORCID API error: ${res.status}`);

  const data = await res.json();

  // Construct name from name block
  const nameBlock = data?.name;
  let name = '';
  if (nameBlock) {
    const given  = nameBlock['given-names']?.value  ?? '';
    const family = nameBlock['family-name']?.value  ?? '';
    const credit = nameBlock['credit-name']?.value;
    name = credit || [given, family].filter(Boolean).join(' ');
  }

  // Grab primary email (visibility = public)
  let email = '';
  const emails: any[] = data?.emails?.email ?? [];
  const primaryEmail = emails.find((e) => e.primary && e.visibility === 'public')
    ?? emails.find((e) => e.visibility === 'public');
  if (primaryEmail) email = primaryEmail.email ?? '';

  return { name, email };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: loadStoredUser(),
  isLoading: false,
  error: null,

  login: () => {
    if (!CLIENT_ID || !REDIRECT) {
      set({ error: 'ORCID client is not configured. See .env.local.template.' });
      return;
    }

    const nonce = generateNonce();
    sessionStorage.setItem(NONCE_KEY, nonce);

    const params = new URLSearchParams({
      client_id:     CLIENT_ID,
      response_type: 'token',
      scope:         '/authenticate openid profile email',
      redirect_uri:  REDIRECT,
      state:         nonce,
    });

    window.location.href = `${ORCID_BASE}/oauth/authorize?${params.toString()}`;
  },

  handleCallback: async () => {
    set({ isLoading: true, error: null });

    try {
      // ORCID can return data in:
      //   1. URL hash  (#access_token=...&orcid=...) — Implicit Flow
      //   2. Query string (?code=...&state=...)       — Authorization Code Flow
      //   3. Query string (?error=...&error_description=...) — Error
      const hash   = window.location.hash.slice(1);      // strip leading "#"
      const search = window.location.search.slice(1);    // strip leading "?"
      const hashParams   = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(search);

      // --- Check for error first (ORCID sends errors in query string) ---
      const error = hashParams.get('error') || searchParams.get('error');
      if (error) {
        const desc = hashParams.get('error_description') || searchParams.get('error_description') || '';
        throw new Error(`ORCID error: ${error} — ${desc}`);
      }

      // --- Check for auth code (Authorization Code Flow) ---
      const code = searchParams.get('code');
      if (code) {
        // ORCID returned an authorization code — the Implicit Flow is not enabled
        // for this client. A backend is required to exchange the code for a token.
        throw new Error(
          'ORCID returned an authorization code instead of a token. ' +
          'This means the Implicit Flow is not enabled for your ORCID client. ' +
          'In your ORCID developer settings, make sure "Allow implicit flow" is checked, ' +
          'or contact support@orcid.org to enable it for APP-7JVCJ2FY5YSYYNCE.'
        );
      }

      // --- Implicit Flow: token in hash fragment ---
      const accessToken = hashParams.get('access_token');
      let orcidId       = hashParams.get('orcid');
      const state       = hashParams.get('state');

      if (!accessToken) {
        throw new Error(
          `ORCID callback did not include access_token. ` +
          `Hash: "${hash || '(empty)'}" | Query: "${search || '(empty)'}"`
        );
      }

      // Validate state / nonce to prevent CSRF
      const storedNonce = sessionStorage.getItem(NONCE_KEY);
      sessionStorage.removeItem(NONCE_KEY);
      if (storedNonce && state !== storedNonce) {
        throw new Error('ORCID state mismatch — possible CSRF attack.');
      }

      // If ORCID didn't include the iD in the hash, fetch it from /oauth/userinfo
      let name = '';
      let email = '';
      if (!orcidId) {
        const userinfo = await fetchOrcidUserinfo(accessToken);
        orcidId = userinfo.orcid;
        name    = userinfo.name;
        email   = userinfo.email;
      }

      if (!orcidId) {
        throw new Error('Could not determine ORCID iD from token or userinfo endpoint.');
      }

      // Enrich with public person record if we don't already have name/email
      if (!name) {
        try {
          const person = await fetchOrcidPerson(orcidId, accessToken);
          name  = person.name;
          email = person.email;
        } catch {
          // Person record is optional — name from userinfo is enough
        }
      }

      const user: OrcidUser = { orcid: orcidId, name, email, accessToken };
      persistUser(user);
      set({ user, isLoading: false, error: null });

      // Clean up the fragment from the address bar
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown ORCID login error';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: () => {
    clearUser();
    set({ user: null, error: null });
    // Revocation is optional for public read-only tokens;
    // ORCID implicit tokens expire on their own.
  },
}));
