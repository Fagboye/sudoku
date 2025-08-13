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
      type MiniAppContext = { user?: MiniAppUser };
      const maybeContextProvider = sdk as unknown as { context?: Promise<unknown> };
      const isMiniAppContext = (v: unknown): v is MiniAppContext =>
        typeof v === "object" && v !== null && "user" in (v as Record<string, unknown>);

      if (maybeContextProvider.context) {
        const ctxUnknown = await maybeContextProvider.context;
        if (isMiniAppContext(ctxUnknown) && ctxUnknown.user) {
          const { fid, username, displayName, pfpUrl } = ctxUnknown.user;
          setUser({ fid, username, displayName, pfpUrl });
        }
      }
    } catch {
      // best-effort; ignore context errors
    }
  }, []);

  useEffect(() => {
    // Notify MiniApps host that the UI is ready as soon as navbar mounts
    sdk.actions.ready().catch(() => {});
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
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="h-full max-w-[1200px] mx-auto px-4 flex items-center justify-end">
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
    </div>
  );
}


