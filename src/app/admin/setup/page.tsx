import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setupFirstAdmin } from "../actions/auth";
import { NotConnected } from "../NotConnected";
import { SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { dbEnabled, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "First-time setup" };
export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: FlashParams }) {
  if (!dbEnabled) return <NotConnected />;
  const users = await queryOne<{ n: number }>(`SELECT count(*)::int AS n FROM users`);
  if ((users?.n ?? 0) > 0) redirect("/admin/login");
  const { error } = await searchParams;
  const codeSet = (process.env.ADMIN_SETUP_CODE ?? "").length >= 12;
  return (
    <div className="adm adm-auth">
      <div className="adm-auth__box">
        <img src="/brand/mop-emblem.png" alt="" width={64} height={64} className="adm-auth__logo" />
        <h1>Create the first admin</h1>
        <p className="adm-muted">This page only works once. After this, add the rest of the team from <strong>Team &amp; logins</strong>.</p>
        <Flash error={error} />
        {!codeSet ? (
          <div className="notice notice--err">
            Add an environment variable <code>ADMIN_SETUP_CODE</code> (at least 12 characters) in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        ) : (
          <form action={setupFirstAdmin} className="form">
            <div className="field">
              <label htmlFor="code">Setup code</label>
              <input id="code" name="code" type="password" required autoComplete="off" />
              <div className="field__hint">The ADMIN_SETUP_CODE you set in Vercel.</div>
            </div>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="username" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
              <div className="field__hint">At least 10 characters.</div>
            </div>
            <SubmitButton pendingText="Creating…">Create admin account</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
