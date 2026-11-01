"use server";

import { redirect } from "next/navigation";
import {
  clearFailedLogins,
  createSession,
  destroySession,
  hashPassword,
  passwordProblem,
  recordFailedLogin,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/auth";
import { FormError, fail, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";

export async function login(fd: FormData) {
  const email = text(fd, "email", { max: 200 }).toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) fail("/admin/login", "Please enter your email and password.");
  if (await tooManyAttempts(email)) {
    fail("/admin/login", "Too many failed attempts. Please wait 15 minutes and try again.");
  }
  const user = await queryOne<{ id: number; password_hash: string }>(
    `SELECT id, password_hash FROM users WHERE email = $1`,
    [email],
  );
  // verify even when the user doesn't exist, so timing doesn't reveal which emails are registered
  const ok = await verifyPassword(password, user?.password_hash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==");
  if (!user || !ok) {
    await recordFailedLogin(email);
    fail("/admin/login", "That email and password don’t match.");
  }
  await clearFailedLogins(email);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/** Create the very first admin account. Only works while there are no users. */
export async function setupFirstAdmin(fd: FormData) {
  const expected = process.env.ADMIN_SETUP_CODE ?? "";
  try {
    if (expected.length < 12) throw new FormError("ADMIN_SETUP_CODE is not set in Vercel (it needs at least 12 characters).");
    const existing = await queryOne<{ n: number }>(`SELECT count(*)::int AS n FROM users`);
    if ((existing?.n ?? 0) > 0) throw new FormError("An admin account already exists. Please log in.");
    if (String(fd.get("code") ?? "") !== expected) throw new FormError("That setup code is not correct.");
    const name = text(fd, "name", { required: true, max: 100, label: "Name" });
    const email = text(fd, "email", { required: true, max: 200, label: "Email" }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new FormError("Please enter a valid email address.");
    const password = String(fd.get("password") ?? "");
    const problem = passwordProblem(password);
    if (problem) throw new FormError(problem);
    const user = await queryOne<{ id: number }>(
      `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      [email, name, await hashPassword(password)],
    );
    await createSession(user!.id);
  } catch (err) {
    if (err instanceof FormError) fail("/admin/setup", err.message);
    throw err;
  }
  redirect("/admin?ok=" + encodeURIComponent("Welcome! Your admin account is ready."));
}

