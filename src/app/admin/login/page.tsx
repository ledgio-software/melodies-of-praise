import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { login } from "../actions/auth";
import { NotConnected } from "../NotConnected";
import { SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { getCurrentUser } from "@/lib/auth";
import { dbEnabled, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: FlashParams }) {
  if (!dbEnabled) return <NotConnected />;
  if (await getCurrentUser()) redirect("/admin");
  const users = await queryOne<{ n: number }>(`SELECT count(*)::int AS n FROM users`);
  if ((users?.n ?? 0) === 0) redirect("/admin/setup");
  const { ok, error } = await searchParams;
  return (
    <div className="adm adm-auth">
      <div className="adm-auth__box">
        <img src="/brand/mop-emblem.png" alt="" width={64} height={64} className="adm-auth__logo" />
        <h1>Dashboard</h1>
        <p className="adm-muted" style={{ textAlign: "center" }}>Melodies of Praise publicity team</p>
        <Flash ok={ok} error={error} />
        <form action={login} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <SubmitButton pendingText="Signing in…">Log in</SubmitButton>
        </form>
        <p className="adm-muted" style={{ marginTop: "1.25rem", marginBottom: 0 }}>Forgot your password? Ask a dashboard admin to reset it.</p>
      </div>
    </div>
  );
}
