"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils/format";
import type { Message } from "@/lib/types/database";

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(body?: string, attachmentUrl?: string, attachmentType?: string) {
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body, attachmentUrl, attachmentType }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setText("");
    }
    setSending(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isDocument = !file.type.startsWith("image/");
    const path = `${currentUserId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("messages").upload(path, file);
    if (error) return;
    const { data } = supabase.storage.from("messages").getPublicUrl(path);
    await sendMessage(undefined, data.publicUrl, isDocument ? "document" : "photo");
    e.target.value = "";
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {m.body && <p className="whitespace-pre-line">{m.body}</p>}
                  {m.attachment_url && m.attachment_type === "photo" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.attachment_url} alt="Pièce jointe" className="mt-1 max-w-full rounded-lg" />
                  )}
                  {m.attachment_url && m.attachment_type === "document" && (
                    <a href={m.attachment_url} target="_blank" rel="noreferrer" className="mt-1 block underline">
                      📎 Document joint
                    </a>
                  )}
                  <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatDateTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) sendMessage(text.trim());
        }}
        className="mx-auto flex w-full max-w-2xl items-center gap-2 border-t border-border p-3"
      >
        <label className="cursor-pointer rounded-full border border-border p-2.5 hover:bg-muted">
          📎
          <input type="file" className="hidden" onChange={handleFile} accept="image/*,application/pdf" />
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message..."
          className="input flex-1"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary">
          Envoyer
        </button>
      </form>
    </div>
  );
}
