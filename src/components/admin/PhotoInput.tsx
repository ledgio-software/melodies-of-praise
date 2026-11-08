"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 2400;

/** Resize a phone photo in the browser (max 2400px, JPEG) so uploads are quick and small. */
export async function shrink(file: File, maxEdge = MAX_EDGE): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) && !file.name.match(/\.(heic|heif)$/i)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === "image/jpeg" && file.size < (maxEdge < MAX_EDGE ? 900_000 : 2_500_000)) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // browser couldn't decode it; let the server decide
  }
}

export function PhotoInput({ name = "photo", required, current }: { name?: string; required?: boolean; current?: string | null }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function onChange() {
    const input = ref.current;
    const file = input?.files?.[0];
    if (!input || !file) return;
    setBusy(true);
    const small = await shrink(file);
    try {
      const dt = new DataTransfer();
      dt.items.add(small);
      input.files = dt.files;
    } catch {
      /* very old browsers: upload the original */
    }
    setPreview(URL.createObjectURL(small));
    setNote(`${(small.size / 1024 / 1024).toFixed(1)} MB, ready to upload`);
    setBusy(false);
  }

  return (
    <div className="adm-photo-input">
      {preview && <img src={preview} alt="" className="adm-photo-input__preview" />}
      <input ref={ref} type="file" name={name} accept="image/*" required={required} onChange={onChange} />
      <div className="field__hint">{busy ? "Preparing photo…" : note ?? "JPG or PNG. Large phone photos are resized automatically."}</div>
    </div>
  );
}
