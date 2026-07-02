"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = {
  id: string;
  team_id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export default function TeamChat({
  teamId,
  currentUserId,
}: {
  teamId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;

  // Pre-populate current user's profile
  useEffect(() => {
    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        const name =
          profile?.display_name || user.email?.split("@")[0] || "User";
        setProfiles((prev) => ({ ...prev, [user.id]: name }));
      }
    }
    loadCurrentUser();
  }, []);

  // Load messages and subscribe to new ones
  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_chat",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Fetch profile if we don't have it yet
          if (!profilesRef.current[newMsg.user_id]) {
            fetchProfile(newMsg.user_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  async function loadMessages() {
    const { data } = await supabase
      .from("team_chat")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })
      .limit(50);

    const msgs = data ?? [];
    setMessages(msgs);

    // Fetch profiles for all unique user IDs
    const userIds = [...new Set(msgs.map((m) => m.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const nameMap: Record<string, string> = {};
      for (const id of userIds) {
        const p = (profilesData ?? []).find((p) => p.id === id);
        nameMap[id] = p?.display_name || (id === currentUserId ? "You" : "Team Member");
      }
      setProfiles((prev) => ({ ...prev, ...nameMap }));
    }
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    if (data?.display_name) {
      setProfiles((prev) => ({ ...prev, [userId]: data.display_name }));
    } else {
      // Set a fallback so we don't keep retrying
      setProfiles((prev) => ({
        ...prev,
        [userId]: prev[userId] || "Team Member",
      }));
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);

    const { error: sendErr } = await supabase.from("team_chat").insert({
      team_id: teamId,
      user_id: currentUserId,
      message: trimmed,
    });

    setSending(false);
    if (sendErr) {
      setError(sendErr.message);
    } else {
      setInput("");
      inputRef.current?.focus();
    }
  }

  function getDisplayName(userId: string): string {
    return profiles[userId] || (userId === currentUserId ? "You" : "Team Member");
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="xp-window">
      <div className="xp-window-title">
        <div className="flex items-center gap-1.5">
          <img src="/icons/icon-chat.png" alt="" className="w-4 h-4" />
          <span>Team Chat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] opacity-80">{messages.length} messages</span>
          <div className="xp-window-controls">
            <span className="xp-window-minimize">_</span>
            <span className="xp-window-maximize">&#9633;</span>
            <span className="xp-window-close">X</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="h-64 overflow-y-auto bg-white border-b border-black" style={{ fontFamily: "Tahoma, Geneva, Verdana, sans-serif" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-gray-500 px-4 text-center">
            <img src="/icons/icon-chat.png" alt="" className="w-8 h-8 mb-2 opacity-50" />
            <p>No messages yet.</p>
            <p className="text-[10px] mt-1">Send the first message to your team!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((msg) => {
              const isCurrentUser = msg.user_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`px-3 py-2 text-xs ${
                    isCurrentUser ? "bg-xp-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img
                      src="/icons/icon-user.png"
                      alt=""
                      className="w-3.5 h-3.5"
                    />
                    <span
                      className={`font-bold text-[11px] ${
                        isCurrentUser ? "text-xp-blue-500" : "text-gray-700"
                      }`}
                    >
                      {getDisplayName(msg.user_id)}
                      {isCurrentUser ? " (You)" : ""}
                    </span>
                    <span className="text-[9px] text-gray-400 ml-auto">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 ml-5 leading-relaxed">{msg.message}</p>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="xp-window-body !p-3">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="input-xp flex-1 text-xs"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn-xp-primary text-[11px]"
          >
            Send
          </button>
        </form>
        {error && (
          <div className="msg-xp-error mt-2 text-[10px]">{error}</div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
        <span>Connected</span>
        <span>Team Chat</span>
      </div>
    </div>
  );
}
