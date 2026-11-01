import type { Metadata } from "next";
import { cookies } from "next/headers";
import { addUser, removeUser, resetUserPassword } from "../../actions/users";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Team & logins" };

export default async function UsersAdmin({ searchParams }: { searchParams: FlashParams }) {
  const me = await requireUser("admin");
  const { ok, error } = await searchParams;
  const users = await query<{ id: number; name: string; email: string; role: string }>(
    `SELECT id, name, email, role FROM users ORDER BY role, name`,
  );
  let temp: { name: string; pw: string } | null = null;
  try {
    const raw = (await cookies()).get("mop_temp_pw")?.value;
    temp = raw && ok ? JSON.parse(raw) : null;
  } catch {
    temp = null;
  }

  return (
    <>
      <div className="adm-head">
        <h1>Team &amp; logins</h1>
        <p>Everyone who can sign in to this dashboard. <strong>Editors</strong> manage content; <strong>admins</strong> can also manage logins.</p>
      </div>
      <Flash ok={ok} error={error} />
      {temp && (
        <div className="adm-card" style={{ borderColor: "var(--gold)" }}>
          <h3>Temporary password for {temp.name}</h3>
          <p><span className="adm-secret">{temp.pw}</span></p>
          <p className="adm-muted" style={{ marginBottom: 0 }}>Send it to them privately (for example on WhatsApp). It is shown only for the next two minutes. They should change it under <strong>My account</strong> after signing in at <code>/admin</code>.</p>
        </div>
      )}

      <div className="adm-card">
        <h2>Add a team member</h2>
        <form action={addUser} className="form">
          <div className="form__row">
            <div className="field"><label htmlFor="name">Name <span className="req">*</span></label><input id="name" name="name" required maxLength={100} /></div>
            <div className="field"><label htmlFor="email">Email <span className="req">*</span></label><input id="email" name="email" type="email" required maxLength={200} /></div>
          </div>
          <div className="field" style={{ maxWidth: 320 }}>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue="editor">
              <option value="editor">Editor: manage website content</option>
              <option value="admin">Admin: content and logins</option>
            </select>
          </div>
          <div><SubmitButton>Create account</SubmitButton></div>
        </form>
      </div>

      <div className="adm-card">
        <h2>People with access</h2>
        <ul className="adm-list">
          {users.map((u) => (
            <li key={u.id}>
              <div className="adm-list__main">
                <span className="adm-tag">{u.role}</span>
                <strong style={{ display: "inline" }}>{u.name}{u.id === me.id ? " (you)" : ""}</strong>
                <div className="adm-muted">{u.email}</div>
              </div>
              {u.id !== me.id && (
                <div className="adm-row-actions">
                  <form action={resetUserPassword}><input type="hidden" name="id" value={u.id} />
                    <ConfirmButton className="adm-btn-sm" message={`Reset ${u.name}'s password? They will be signed out.`}>Reset password</ConfirmButton></form>
                  <form action={removeUser}><input type="hidden" name="id" value={u.id} />
                    <ConfirmButton message={`Remove ${u.name}'s access to the dashboard?`}>Remove</ConfirmButton></form>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
