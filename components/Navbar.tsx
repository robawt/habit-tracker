"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        }
      }
    }
    getUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Don't show navbar on login page
  if (pathname === "/") return null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <nav className="bg-gradient-to-r from-[#316AC5] via-[#4A8FE4] to-[#316AC5] border-b-2 border-black sticky top-0 z-50 shadow-xp-window">
      <div className="max-w-5xl mx-auto px-1 sm:px-2">
        <div className="flex items-center h-9">
          {/* Start Button */}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="bg-gradient-to-b from-xp-green-400 to-xp-green-600 
                           hover:from-xp-green-500 hover:to-xp-green-700
                           px-3 py-0.5 text-xs sm:text-sm font-bold text-white 
                           border border-black shadow-xp-raised-sm 
                           flex items-center gap-1.5 rounded-r-none border-r-0
                           active:shadow-xp-sunken active:translate-x-px active:translate-y-px"
              >
                <img src="/icons/icon-home.png" alt="" className="w-4 h-4" />
                <span className="tracking-wide">START</span>
              </Link>

              {/* Vertical separator */}
              <div className="w-px h-5 bg-white/30 mx-0.5" />
            </>
          )}

          {/* Nav Links */}
          {user && (
            <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
              <ToolbarButton
                href="/dashboard"
                active={pathname === "/dashboard"}
                icon="D"
                label="Dashboard"
              />
              <ToolbarButton
                href="/teams/new"
                active={pathname === "/teams/new"}
                icon="+"
                label="New Team"
              />
            </div>
          )}

          {/* Tray Area */}
          {user && (
            <div className="flex items-center gap-0.5 ml-auto shrink-0">
              <Link
                href="/profile"
                className={`px-1.5 py-0.5 text-[11px] border border-black flex items-center gap-1 ${
                  pathname === "/profile"
                    ? "bg-xp-blue-500 text-white shadow-xp-sunken"
                    : "bg-xp-silver text-black shadow-xp-raised-sm hover:bg-xp-silver-200"
                }`}
              >
                <span className="w-4 h-4 bg-xp-gold text-black flex items-center justify-center text-[9px] font-bold border border-black leading-none">
                  {(displayName || user.email || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {displayName || user.email?.split("@")[0] || "User"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-1.5 py-0.5 text-[10px] font-bold border border-black bg-xp-silver text-gray-700 shadow-xp-raised-sm hover:bg-xp-silver-200 active:shadow-xp-sunken"
                title="Sign out"
              >
                X
              </button>
              {/* System tray clock */}
              <div className="px-1.5 py-0.5 text-[10px] font-bold border border-black bg-xp-silver text-black shadow-xp-sunken ml-0.5 whitespace-nowrap">
                {timeStr}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function ToolbarButton({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`px-1.5 py-0.5 text-[11px] border border-black flex items-center gap-1 shrink-0 ${
        active
          ? "bg-xp-blue-500 text-white shadow-xp-sunken"
          : "bg-xp-silver text-black shadow-xp-raised-sm hover:bg-xp-silver-200"
      }`}
    >
      <span className="font-bold text-[10px] w-3.5 text-center leading-none">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
