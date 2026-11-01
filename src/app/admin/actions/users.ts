"use server";

import { cookies } from "next/headers";
import { hashPassword, passwordProblem, requireUser, temporaryPassword, verifyPassword } from "@/lib/auth";
import { FormError, handle, int, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";

const PATH = "/admin/users";

/** Show a new temporary password once, without putting it in the URL or logs. */
async function flashPassword(name: string, pw: string) {
  (await cookies()).set("mop_temp_pw", JSON.stringify({ name, pw }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin/users",
    maxAge: 120,
  });
}

export async function addUser(fd: FormData) {
  await requireUser("admin");
  await handle(PATH, async () => {
    const name = text(fd, "name", { required: true, max: 100, label: "Name" });
    const email = text(fd, "email", { required: true, max: 200, label: "Email" }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new FormError("Please enter a valid email address.");
    const role = fd.get("role") === "admin" ? "admin" : "editor";
    if (await queryOne(`SELECT 1 FROM users WHERE email=$1`, [email])) throw new FormError("Someone with that email already has an account.");
    const pw = temporaryPassword();
    await query(`INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)`, [
      email, name, await hashPassword(pw), role,
    ]);
    await flashPassword(name, pw);
    return `Account created for ${name}.`;
  });
}

export async function resetUserPassword(fd: FormData) {
  await requireUser("admin");
  await handle(PATH, async () => {
    const id = int(fd, "id");
    const pw = temporaryPassword();
    const u = await queryOne<{ name: string }>(`UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING name`, [
      await hashPassword(pw), id,
    ]);
    await query(`DELETE FROM sessions WHERE user_id=$1`, [id]);
    await flashPassword(u?.name ?? "user", pw);
    return `Password reset for ${u?.name ?? "user"}.`;
  });
}

export async function removeUser(fd: FormData) {
  const me = await requireUser("admin");
  await handle(PATH, async () => {
    const id = int(fd, "id");
    if (id === me.id) throw new FormError("You can’t remove your own account.");
    const admins = await queryOne<{ n: number }>(`SELECT count(*)::int AS n FROM users WHERE role='admin' AND id<>$1`, [id]);
    const target = await queryOne<{ role: string; name: string }>(`SELECT role, name FROM users WHERE id=$1`, [id]);
    if (target?.role === "admin" && (admins?.n ?? 0) === 0) throw new FormError("There must be at least one admin.");
    await query(`DELETE FROM users WHERE id=$1`, [id]);
    return `${target?.name ?? "User"} no longer has access.`;
  });
}

export async function changeOwnPassword(fd: FormData) {
  const me = await requireUser();
  await handle("/admin/account", async () => {
    const row = await queryOne<{ password_hash: string }>(`SELECT password_hash FROM users WHERE id=$1`, [me.id]);
    if (!row || !(await verifyPassword(String(fd.get("current") ?? ""), row.password_hash))) {
      throw new FormError("Your current password is not correct.");
    }
    const next = String(fd.get("next") ?? "");
    const problem = passwordProblem(next);
    if (problem) throw new FormError(problem);
    if (next !== String(fd.get("confirm") ?? "")) throw new FormError("The new passwords don’t match.");
    await query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [await hashPassword(next), me.id]);
    return "Password changed.";
  });
}
