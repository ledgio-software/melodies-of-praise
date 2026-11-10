import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { HELPDESK_INSTRUCTIONS, buildKnowledge, checkHelpdeskLimit, helpdeskEnabled } from "@/lib/helpdesk";

/**
 * AI help desk. Answers visitors' questions from the website's own content
 * using Claude (Anthropic). Conversations are not stored: the browser sends the
 * chat so far with each question, and nothing is written except a hashed
 * visitor key used for rate limiting.
 *
 * Needs ANTHROPIC_API_KEY in the Vercel project's environment variables.
 * Optional HELPDESK_MODEL to change the model.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.HELPDESK_MODEL || "claude-opus-5-5";
const MAX_TURNS = 12;
const MAX_CHARS = 800;

type ChatTurn = { role: "user" | "assistant"; content: string };

function parse(body: unknown): ChatTurn[] | null {
  const msgs = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const m of msgs.slice(-MAX_TURNS)) {
    const role = (m as ChatTurn)?.role;
    const content = String((m as ChatTurn)?.content ?? "").trim().slice(0, MAX_CHARS * 2);
    if ((role !== "user" && role !== "assistant") || !content) return null;
    turns.push({ role, content });
  }
  while (turns[0]?.role === "assistant") turns.shift(); // first message must be from the visitor
  const last = turns.at(-1);
  if (!last || last.role !== "user" || last.content.length > MAX_CHARS) return null;
  return turns;
}

export async function POST(req: Request) {
  if (!helpdeskEnabled) return NextResponse.json({ error: "The help desk is not available right now." }, { status: 503 });

  let turns: ChatTurn[] | null = null;
  try {
    turns = parse(await req.json());
  } catch {
    /* invalid JSON */
  }
  if (!turns) return NextResponse.json({ error: `Please type a question (up to ${MAX_CHARS} characters).` }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limited = await checkHelpdeskLimit(ip);
  if (limited) return NextResponse.json({ error: limited }, { status: 429 });

  const knowledge = await buildKnowledge();
  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      let wrote = false;
      try {
        const s = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "low" },
          system: [
            { type: "text", text: HELPDESK_INSTRUCTIONS },
            { type: "text", text: `Choir information:\n\n${knowledge}`, cache_control: { type: "ephemeral" } },
          ],
          messages: turns,
        });
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send(event.delta.text);
            wrote = true;
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          send(`${wrote ? "\n\n" : ""}Sorry, I can’t help with that one. For anything about the choir, try asking another way or contact us through the Contact page (/contact).`);
        } else if (!wrote) {
          send("Sorry, I couldn’t find an answer. Please try asking another way, or visit the Contact page (/contact).");
        }
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) {
          console.error("Help desk rate limited by Anthropic", err.message);
        } else if (err instanceof Anthropic.AuthenticationError) {
          console.error("Help desk API key is invalid");
        } else if (err instanceof Anthropic.APIError) {
          console.error(`Help desk API error ${err.status}`, err.message);
        } else {
          console.error("Help desk failed", err);
        }
        send(`${wrote ? "\n\n" : ""}Sorry, the help desk is having trouble right now. Please try again in a moment, or use the Contact page (/contact).`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
