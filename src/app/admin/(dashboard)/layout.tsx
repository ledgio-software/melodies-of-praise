import { logout } from "../actions/auth";
import { NotConnected } from "../NotConnected";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireUser } from "@/lib/auth";
import { dbEnabled, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!dbEnabled) return <NotConnected />;
  const user = await requireUser();
  const unread = await queryOne<{ n: number }>(`SELECT count(*)::int AS n FROM enquiries WHERE status='new'`);
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/inbox", label: "Inbox", badge: unread?.n ?? 0 },
    { href: "/admin/news", label: "News" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/photos", label: "Photos & slideshow" },
    { href: "/admin/leaders", label: "Leaders" },
    { href: "/admin/music", label: "Music videos" },
    { href: "/admin/settings", label: "Site settings" },
    ...(user.role === "admin" ? [{ href: "/admin/users", label: "Team & logins" }] : []),
    { href: "/admin/account", label: "My account" },
  ];
  return (
    <div className="adm">
      <AdminNav items={items} userName={user.name} logout={logout} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
