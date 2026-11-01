import { site, type ChoirEvent } from "@/content/site";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function upcomingEvents(): ChoirEvent[] {
  const today = todayISO();
  return site.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function pastEvents(): ChoirEvent[] {
  const today = todayISO();
  return site.events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
}
