import type { Metadata } from "next";
import Link from "next/link";
import { setEnquiryStatus } from "../../actions/inbox";
import { SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Inbox" };

const TABS = [
  { key: "open", label: "Inbox", where: "status <> 'archived'" },
  { key: "new", label: "Unread", where: "status = 'new'" },
  { key: "archived", label: "Archived", where: "status = 'archived'" },
] as const;

export default async function Inbox({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error, tab = "open", kind } = await searchParams;
  const t = TABS.find((x) => x.key === tab) ?? TABS[0];
  const k = kind === "booking" || kind === "join" ? kind : null;
  const rows = await query<{ id: number; kind: string; name: string; status: string; created: string; data: Record<string, string> }>(
    `SELECT id, kind, name, status, data, to_char(created_at AT TIME ZONE 'Africa/Accra', 'DD Mon YYYY, HH24:MI') AS created
     FROM enquiries WHERE ${t.where} ${k ? "AND kind = $1" : ""} ORDER BY created_at DESC LIMIT 200`,
    k ? [k] : [],
  );
  const qs = (o: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const merged = { tab: t.key, kind: k, ...o };
    for (const [a, b] of Object.entries(merged)) if (b && !(a === "tab" && b === "open")) p.set(a, b);
    const s = p.toString();
    return s ? `/admin/inbox?${s}` : "/admin/inbox";
  };

  return (
    <>
      <div className="adm-head">
        <h1>Inbox</h1>
        <p>Booking requests and membership applications sent from the website.</p>
      </div>
      <Flash ok={ok} error={error} />
      <div className="adm-tabs">
        {TABS.map((x) => <Link key={x.key} href={qs({ tab: x.key })} aria-current={x.key === t.key ? "page" : undefined}>{x.label}</Link>)}
        <span style={{ width: "1rem" }} />
        <Link href={qs({ kind: null })} aria-current={!k ? "page" : undefined}>All</Link>
        <Link href={qs({ kind: "booking" })} aria-current={k === "booking" ? "page" : undefined}>Bookings</Link>
        <Link href={qs({ kind: "join" })} aria-current={k === "join" ? "page" : undefined}>Join requests</Link>
      </div>
      <div className="adm-card">
        {rows.length === 0 ? <p className="adm-muted">Nothing here.</p> : (
          <ul className="adm-list">
            {rows.map((e) => (
              <li key={e.id}>
                <div className="adm-list__main">
                  {e.status === "new" && <span className="adm-tag adm-tag--new">New</span>}
                  <span className="adm-tag">{e.kind === "booking" ? "Booking" : "Join"}</span>
                  <Link href={`/admin/inbox/${e.id}`} style={{ fontWeight: e.status === "new" ? 600 : 400 }}>{e.name}</Link>
                  <div className="adm-muted">
                    {e.created}
                    {e.kind === "booking" && e.data.occasion ? ` · ${e.data.occasion}${e.data.date ? ` on ${e.data.date}` : ""}` : ""}
                    {e.kind === "join" && e.data.voice ? ` · ${e.data.voice}` : ""}
                  </div>
                </div>
                <div className="adm-row-actions">
                  <Link href={`/admin/inbox/${e.id}`} className="adm-btn-sm">Open</Link>
                  {e.status !== "archived" && (
                    <form action={setEnquiryStatus}>
                      <input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="archived" /><input type="hidden" name="back" value="list" />
                      <SubmitButton className="adm-btn-sm" pendingText="…">Archive</SubmitButton>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
