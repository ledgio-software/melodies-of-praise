"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconClose } from "./Icons";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "When and where do you rehearse?",
  "How can I join the choir?",
  "How do I book the choir for a wedding?",
  "How can I donate?",
];

const GREETING = "Hello, and welcome! I can answer questions about Melodies of Praise: rehearsals, joining, bookings, donations and more. What would you like to know?";

/** Turns page paths in an answer, like "/bookings", into links. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(\/(?:about|news|music|events|outreach|gallery|join|bookings|donate|contact)(?:\/[\w-]+)?)\b/);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <Link key={i} href={p}>{p}</Link> : <span key={i}>{p}</span>))}
    </>
  );
}

export function HelpDesk() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [turns, busy, error]);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: q }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Sorry, something went wrong. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setTurns([...history, { role: "assistant", content: answer }]);
      }
    } catch (err) {
      setTurns(history.slice(0, -1));
      setInput(q);
      setError(err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="helpdesk__launch"
        aria-expanded={open}
        aria-controls="helpdesk"
        onClick={() => setOpen((o) => !o)}
        data-open={open}
      >
        {open ? <IconClose size={20} /> : <span aria-hidden="true" className="helpdesk__dot">?</span>}
        <span>{open ? "Close" : "Ask MOP"}</span>
      </button>

      {open && (
        <section id="helpdesk" className="helpdesk" role="dialog" aria-label="Help desk">
          <header className="helpdesk__head">
            <img src="/brand/mop-emblem.png" alt="" width={34} height={34} />
            <div>
              <strong>MOP Help Desk</strong>
              <small>Answers from our website, by AI</small>
            </div>
            <button type="button" className="helpdesk__x" aria-label="Close help desk" onClick={() => setOpen(false)}>
              <IconClose size={18} />
            </button>
          </header>

          <div className="helpdesk__log" ref={log} aria-live="polite">
            <p className="helpdesk__msg helpdesk__msg--bot">{GREETING}</p>
            {turns.map((t, i) =>
              t.role === "user" ? (
                <p key={i} className="helpdesk__msg helpdesk__msg--me">{t.content}</p>
              ) : (
                <p key={i} className="helpdesk__msg helpdesk__msg--bot">
                  {t.content ? <Linkified text={t.content} /> : <span className="helpdesk__typing" aria-label="Typing"><i /><i /><i /></span>}
                </p>
              ),
            )}
            {turns.length === 0 && (
              <div className="helpdesk__chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
            {error && <p className="helpdesk__err" role="alert">{error}</p>}
          </div>

          <form
            className="helpdesk__form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <textarea
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              maxLength={800}
              placeholder="Type your question…"
              aria-label="Your question"
            />
            <button type="submit" disabled={busy || !input.trim()}>Send</button>
          </form>
          <p className="helpdesk__note">
            Please don’t share personal details. Chats aren’t saved. Answers come from Claude (Anthropic) using what’s on this website and may not be perfect.
          </p>
        </section>
      )}
    </>
  );
}
