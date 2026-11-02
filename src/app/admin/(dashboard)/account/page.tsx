import type { Metadata } from "next";
import { changeOwnPassword } from "../../actions/users";
import { SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function Account({ searchParams }: { searchParams: FlashParams }) {
  const me = await requireUser();
  const { ok, error } = await searchParams;
  return (
    <>
      <div className="adm-head">
        <h1>My account</h1>
        <p>{me.name} · {me.email} · {me.role}</p>
      </div>
      <Flash ok={ok} error={error} />
      <div className="adm-card" style={{ maxWidth: 560 }}>
        <h2>Change password</h2>
        <form action={changeOwnPassword} className="form">
          <div className="field"><label htmlFor="current">Current password</label><input id="current" name="current" type="password" required autoComplete="current-password" /></div>
          <div className="field"><label htmlFor="next">New password</label><input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" /><div className="field__hint">At least 10 characters.</div></div>
          <div className="field"><label htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" /></div>
          <div><SubmitButton>Change password</SubmitButton></div>
        </form>
      </div>
    </>
  );
}
