"use client";

import { useState, type FormEvent } from "react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  hint?: string;
  placeholder?: string;
  /** Put two short fields side by side */
  half?: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "whatsapp"; url: string }
  | { kind: "error"; message: string };

function whatsappUrl(whatsapp: string | null, subject: string, values: Record<string, string>, fields: Field[]) {
  if (!whatsapp) return null;
  const lines = [`*${subject}* (via website)`, ""];
  for (const f of fields) if (values[f.name]) lines.push(`${f.label}: ${values[f.name]}`);
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function EnquiryForm({ kind, subject, fields, submitLabel, whatsapp }: {
  kind: "booking" | "join";
  whatsapp: string | null;
  subject: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};
    for (const f of fields) values[f.name] = String(data.get(f.name) ?? "").trim();

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, values, website: data.get("website") ?? "" }),
      });
      if (res.ok) {
        form.reset();
        setStatus({ kind: "sent" });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; fallback?: boolean };
      if (body.fallback) {
        const url = whatsappUrl(whatsapp, subject, values, fields);
        if (url) {
          window.open(url, "_blank", "noopener");
          setStatus({ kind: "whatsapp", url });
          return;
        }
        setStatus({
          kind: "error",
          message: "Online submissions are not switched on yet. Please message us on any of our social pages and we will respond.",
        });
        return;
      }
      setStatus({ kind: "error", message: body.error ?? "Something went wrong. Please try again." });
    } catch {
      setStatus({ kind: "error", message: "We could not reach the server. Please check your connection and try again." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="notice notice--ok" role="status">
        <h3>Thank you. God bless you.</h3>
        <p>Your message has reached the choir. A member of our team will be in touch shortly.</p>
      </div>
    );
  }

  // group consecutive half-width fields into rows
  const rows: Field[][] = [];
  for (const f of fields) {
    const last = rows[rows.length - 1];
    if (f.half && last && last.length === 1 && last[0].half) last.push(f);
    else rows.push([f]);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      {rows.map((row) => (
        <div key={row[0].name} className={row.length > 1 ? "form__row" : undefined}>
          {row.map((f) => (
            <FieldInput key={f.name} field={f} />
          ))}
        </div>
      ))}
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status.kind === "error" && (
        <div className="notice notice--err" role="alert">
          {status.message}
        </div>
      )}
      {status.kind === "whatsapp" && (
        <div className="notice" role="status">
          We opened WhatsApp with your details filled in. Just press send.{" "}
          <a href={status.url} target="_blank" rel="noopener noreferrer">
            Open WhatsApp again
          </a>
        </div>
      )}
      <div>
        <button className="btn" type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FieldInput({ field: f }: { field: Field }) {
  const id = `f-${f.name}`;
  const common = { id, name: f.name, required: f.required, placeholder: f.placeholder };
  return (
    <div className="field">
      <label htmlFor={id}>
        {f.label} {f.required && <span className="req">*</span>}
      </label>
      {f.type === "textarea" ? (
        <textarea {...common} maxLength={3000} />
      ) : f.type === "select" ? (
        <select {...common} defaultValue="">
          <option value="" disabled>
            Please choose…
          </option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input {...common} type={f.type ?? "text"} maxLength={300} />
      )}
      {f.hint && <div className="field__hint">{f.hint}</div>}
    </div>
  );
}
