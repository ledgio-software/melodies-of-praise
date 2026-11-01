"use server";

import { requireUser } from "@/lib/auth";
import { FormError, handle, optional, refreshSite, text, toWhatsApp } from "@/lib/admin";
import { query } from "@/lib/db";

const PATH = "/admin/settings";

async function put(key: string, value: unknown) {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)],
  );
}

function url(fd: FormData, name: string, label: string) {
  const v = text(fd, name, { max: 300, label });
  if (v && !/^https:\/\//.test(v)) throw new FormError(`${label} link must start with https://`);
  return v;
}

export async function saveSettings(fd: FormData) {
  await requireUser();
  const section = String(fd.get("section"));
  await handle(`${PATH}#${section}`, async () => {
    switch (section) {
      case "rehearsal":
        await put("rehearsal", {
          day: text(fd, "day", { required: true, max: 60, label: "Day" }),
          time: text(fd, "time", { required: true, max: 40, label: "Time" }),
          venue: text(fd, "venue", { required: true, max: 150, label: "Venue" }),
        });
        break;
      case "contact": {
        const wa = text(fd, "whatsapp", { max: 30, label: "WhatsApp" });
        const whatsapp = wa ? toWhatsApp(wa) : null;
        if (wa && !whatsapp) throw new FormError("Please enter the WhatsApp number like 024 123 4567.");
        const email = text(fd, "email", { max: 200, label: "Email" });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new FormError("Please enter a valid email address.");
        await put("contact", {
          phone: optional(text(fd, "phone", { max: 30, label: "Phone" })),
          whatsapp,
          email: optional(email),
          address: text(fd, "address", { required: true, max: 300, label: "Address" }),
          mapQuery: text(fd, "mapQuery", { required: true, max: 200, label: "Map search" }),
        });
        break;
      }
      case "social":
        await put("social", {
          youtube: url(fd, "youtube", "YouTube"),
          instagram: url(fd, "instagram", "Instagram"),
          facebook: url(fd, "facebook", "Facebook"),
          tiktok: url(fd, "tiktok", "TikTok"),
        });
        break;
      case "donation": {
        const number = text(fd, "number", { required: true, max: 20, label: "MoMo number" }).replace(/\s/g, "");
        if (!/^\d{9,13}$/.test(number)) throw new FormError("Please enter the MoMo number using digits only.");
        await put("donation", {
          network: text(fd, "network", { required: true, max: 60, label: "Network" }),
          number,
          accountName: text(fd, "accountName", { required: true, max: 120, label: "Account name" }),
          note: text(fd, "note", { max: 300, label: "Note" }),
        });
        break;
      }
      case "join": {
        const age = text(fd, "minimumAge", { max: 3, label: "Minimum age" });
        if (age && !/^\d{1,2}$/.test(age)) throw new FormError("Minimum age must be a number.");
        await put("join", {
          minimumAge: age ? Number(age) : null,
          monthlyDues: optional(text(fd, "monthlyDues", { max: 80, label: "Monthly dues" })),
          probation: optional(text(fd, "probation", { max: 80, label: "Probation" })),
        });
        break;
      }
      default:
        throw new FormError("Unknown settings section.");
    }
    refreshSite();
    return "Settings saved. The website is updated.";
  });
}
