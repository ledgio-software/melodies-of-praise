import "server-only";
import { randomBytes } from "node:crypto";
import { FormError } from "./admin";

/**
 * Photo storage. Production uses Vercel Blob (BLOB_READ_WRITE_TOKEN is set when
 * a Blob store is connected to the project). In local development without a
 * token, files are written to public/uploads so the dashboard can be tried out.
 */

export const storageEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.NODE_ENV !== "production";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Upload problems are shown to the user like any other form error. */
export class UploadError extends FormError {}

export async function savePhoto(file: File, folder: "photos" | "leaders"): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("Please choose a photo.");
  const ext = TYPES[file.type];
  if (!ext) throw new UploadError("Please upload a JPG, PNG or WebP photo.");
  if (file.size > MAX_BYTES) throw new UploadError("That photo is too large (max 4 MB).");
  const name = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV !== "production") {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const dest = path.join(process.cwd(), "public", "uploads", name);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  }
  throw new UploadError("Photo storage is not set up yet. Connect a Vercel Blob store to the project.");
}

/** Remove an uploaded photo. Built-in photos under /photos are left alone. */
export async function deletePhoto(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.includes(".blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    } else if (url.startsWith("/uploads/") && process.env.NODE_ENV !== "production") {
      const { unlink } = await import("node:fs/promises");
      const path = await import("node:path");
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (err) {
    console.error("Could not delete photo", url, err);
  }
}
