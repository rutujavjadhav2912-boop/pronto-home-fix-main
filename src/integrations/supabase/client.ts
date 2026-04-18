// placeholder supabase client to satisfy imports
// original project may have used Supabase, but it's not required for current backend

// This is a very lightweight stand-in for the supabase-js client that
// implements only the methods used by the UI.  No network requests are made.

let _session: unknown = null;
const _listeners = new Set<(event: string, session: unknown) => void>();

function notify(event: string, session: unknown) {
  for (const cb of Array.from(_listeners)) {
    try {
      cb(event, session);
    } catch {
      // ignore listener errors
    }
  }
}

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: _session } }),
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
      _listeners.add(callback);
      const subscription = { unsubscribe: () => _listeners.delete(callback) };
      return { data: { subscription } };
    },
    signIn: async () => {
      _session = { user: { id: 0, email: 'local@dev' } };
      notify('SIGNED_IN', _session);
      return { data: { session: _session }, error: null };
    },
    signOut: async () => {
      _session = null;
      notify('SIGNED_OUT', _session);
      return { error: null };
    }
  },
  from: (_table: string) => ({
    select: () => ({ data: [], error: null })
  })
};
