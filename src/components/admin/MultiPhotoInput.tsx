"use client";

import { useRef, useState } from "react";
import { shrink } from "./PhotoInput";

// one upload has to stay under the server's 4 MB limit, so photos are made smaller here
const EDGE = 1600;
const BUDGET = 3_700_000;

/** Choose several photos at once; each is resized in the browser before upload. */
export function MultiPhotoInput({ name = "photos" }: { name?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onChange() {
    const input = ref.current;
    const files = [...(input?.files ?? [])];
    if (!input || files.length === 0) return;
    setBusy(true);
    const small: File[] = [];
    let total = 0;
    let skipped = 0;
    for (const f of files) {
      const s = await shrink(f, EDGE);
      if (total + s.size > BUDGET) { skipped++; continue; }
      total += s.size;
      small.push(s);
    }
    try {
      const dt = new DataTransfer();
      small.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    } catch {
      /* very old browsers: upload the originals */
    }
    setPreviews(small.map((f) => URL.createObjectURL(f)));
    setNote(
      `${small.length} photo${small.length === 1 ? "" : "s"} ready (${(total / 1024 / 1024).toFixed(1)} MB).` +
        (skipped ? ` ${skipped} more didn’t fit in one upload: save, then edit and add them.` : ""),
    );
    setBusy(false);
  }

  return (
    <div className="adm-photo-input">
      {previews.length > 0 && (
        <div className="adm-photo-grid">
          {previews.map((src) => <img key={src} src={src} alt="" />)}
        </div>
      )}
      <input ref={ref} type="file" name={name} accept="image/*" multiple onChange={onChange} />
      <div className="field__hint">{busy ? "Preparing photos…" : note ?? "Choose several photos at once (about 6 to 8 per save). Phone photos are resized automatically."}</div>
    </div>
  );
}
