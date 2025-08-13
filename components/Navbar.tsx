"use client";

import { useCallback, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type MiniAppUser = {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContextUser = useCallback(async () => {
    try {
      // Mini App hosts expose user info in the runtime context
      const anySdk = sdk as unknown as { context?: Promise<any> };
      if (anySdk.context) {
        const ctx = await anySdk.context;
        if (ctx && ctx.user) {
          const { fid, username, displayName, pfpUrl } = ctx.user as MiniAppUser;
          setUser({ fid, username, displayName, pfpUrl });
        }
      }
    } catch {
      // best-effort; ignore context errors
    }
  }, []);

  useEffect(() => {
    loadContextUser();
  }, [loadContextUser]);

  const handleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      const nonce = Math.random().toString(36).slice(2, 12);
      await sdk.actions.signIn({ nonce, acceptAuthAddress: true });
      // Refresh context to pick up user details after sign-in
      await loadContextUser();
    } catch {
      // noop – user may reject
    } finally {
      setLoading(false);
    }
  }, [loadContextUser]);

  return (
    <div className="fixed top-2 right-4 z-50 flex items-center gap-3">
      {user?.pfpUrl ? (
        <img
          src={user.pfpUrl}
          alt={(user.displayName || user.username || "").concat(" profile image")}
          className="h-9 w-9 rounded-full border border-neutral-200 shadow-sm object-cover"
        />
      ) : (
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-sm shadow hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in with Farcaster"}
        </button>
      )}
    </div>
  );
}


