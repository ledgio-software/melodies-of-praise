import type { ChoirEvent } from "@/content/site";

export function EventList({ events, emptyText }: { events: ChoirEvent[]; emptyText?: string }) {
  if (events.length === 0) {
    return (
      <div className="empty">
        <h3>New dates coming soon</h3>
        <p>{emptyText ?? "Our next ministrations will be announced here and on our social pages."}</p>
      </div>
    );
  }
  return (
    <div>
      {events.map((e) => {
        const d = new Date(`${e.date}T12:00:00`);
        return (
          <article key={`${e.date}-${e.title}`} className="event">
            <div className="event__date" aria-hidden="true">
              <span className="event__day">{d.getDate()}</span>
              <span className="event__month">{d.toLocaleString("en-GB", { month: "short" })} {d.getFullYear()}</span>
            </div>
            <div>
              <h3>{e.title}</h3>
              <div className="event__meta">
                <time dateTime={e.date}>
                  {d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </time>
                {e.time && ` · ${e.time}`} · {e.venue}
              </div>
              {e.description && <p>{e.description}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
